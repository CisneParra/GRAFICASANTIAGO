const mongoose = require('mongoose');
const Product = require('../models/product_model');

/**
 * GET /api/v1/products
 * Query:
 * - category
 * - keyword
 */
exports.getProducts = async (req, res) => {
  try {
    const query = { activo: true };

    if (req.query.category) {
      // categoría amplia: "Papel" trae "Papel Bond", etc.
      query.categoria = { $regex: req.query.category, $options: 'i' };
    }

    if (req.query.keyword) {
      query.nombre = { $regex: req.query.keyword, $options: 'i' };
    }

    const products = await Product.find(query)
      .select('nombre precio stock categoria imagenes ratingPromedio numResenas')
      .limit(200);

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('GET PRODUCTS ERROR:', error);
    res.status(500).json({ success: false, message: 'Error al obtener productos' });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const product = await Product.findById(id)
      .select('-reviews') // para no traer reseñas en la ficha si hay muchas
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error('GET SINGLE PRODUCT ERROR:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el producto' });
  }
};

exports.newProduct = async (req, res) => {
  try {
    const created = await Product.create(req.body);
    res.status(201).json({ success: true, product: created });
  } catch (error) {
    console.error('NEW PRODUCT ERROR:', error);
    res.status(500).json({ success: false, message: 'Error al crear producto' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    res.json({ success: true, product: updated });
  } catch (error) {
    console.error('UPDATE PRODUCT ERROR:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar producto' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    res.json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    console.error('DELETE PRODUCT ERROR:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar producto' });
  }
};

/**
 * ⭐ POST /api/v1/products/:id/reviews
 * Body: { rating, comentario }
 * Requiere login
 */
exports.addOrUpdateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comentario } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const r = Number(rating);
    if (!r || r < 1 || r > 5) {
      return res.status(400).json({ success: false, message: 'Rating debe ser 1 a 5' });
    }

    if (!comentario || String(comentario).trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Comentario muy corto' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    const userId = req.user._id.toString();

    // Si ya reseñó, se actualiza
    const existing = product.reviews.find(rv => rv.user.toString() === userId);

    if (existing) {
      existing.rating = r;
      existing.comentario = String(comentario).trim();
      existing.nombre = `${req.user.nombre} ${req.user.apellido}`.trim();
    } else {
      product.reviews.push({
        user: req.user._id,
        nombre: `${req.user.nombre} ${req.user.apellido}`.trim(),
        rating: r,
        comentario: String(comentario).trim()
      });
    }

    // Recalcular promedio
    product.numResenas = product.reviews.length;
    product.ratingPromedio =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: existing ? 'Reseña actualizada' : 'Reseña agregada',
      ratingPromedio: product.ratingPromedio,
      numResenas: product.numResenas
    });
  } catch (error) {
    console.error('ADD REVIEW ERROR:', error);
    res.status(500).json({ success: false, message: 'Error al guardar reseña' });
  }
};

/**
 * ⭐ GET /api/v1/products/:id/reviews
 * Lista reseñas de un producto
 */
exports.getReviews = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const product = await Product.findById(id)
      .select('reviews ratingPromedio numResenas')
      .populate('reviews.user', 'nombre apellido');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    res.json({
      success: true,
      ratingPromedio: product.ratingPromedio,
      numResenas: product.numResenas,
      reviews: product.reviews
    });
  } catch (error) {
    console.error('GET REVIEWS ERROR:', error);
    res.status(500).json({ success: false, message: 'Error al obtener reseñas' });
  }
};

/**
 * ⭐ DELETE /api/v1/products/:id/reviews/:reviewId
 * Permisos: admin o dueño de la reseña
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Reseña no encontrada' });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para borrar esta reseña' });
    }

    review.deleteOne();

    // Recalcular promedio
    product.numResenas = product.reviews.length;
    product.ratingPromedio = product.reviews.length
      ? product.reviews.reduce((acc, item) => acc + item.rating, 0) / product.reviews.length
      : 0;

    await product.save();

    res.json({
      success: true,
      message: 'Reseña eliminada',
      ratingPromedio: product.ratingPromedio,
      numResenas: product.numResenas
    });
  } catch (error) {
    console.error('DELETE REVIEW ERROR:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar reseña' });
  }
};
