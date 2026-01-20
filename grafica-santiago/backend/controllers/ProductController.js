const Product = require('../models/product_model');

// 1. OBTENER TODOS LOS PRODUCTOS (Con Filtros y Límite)
exports.getProducts = async (req, res, next) => {
    try {
        const keyword = req.query.keyword ? {
            nombre: {
                $regex: req.query.keyword,
                $options: 'i'
            }
        } : {};

        const categoryFilter = req.query.category && req.query.category !== 'Todas' 
            ? { categoria: req.query.category } 
            : {};

        // Si mandan ?limit=1000, usamos 1000. Si no, 0 (todos).
        const limit = Number(req.query.limit) || 0; 

        const products = await Product.find({ ...keyword, ...categoryFilter })
                                      .limit(limit)
                                      .sort({ fechaCreacion: -1 });

        const count = await Product.countDocuments({ ...keyword, ...categoryFilter });

        res.status(200).json({
            success: true,
            count: products.length,
            totalDocs: count,
            products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. CREAR PRODUCTO
exports.newProduct = async (req, res, next) => {
    try {
        if (!req.body.imagenes || req.body.imagenes.length === 0) {
            req.body.imagenes = [{ url: 'https://via.placeholder.com/300?text=Sin+Imagen' }];
        }
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. OBTENER UN SOLO PRODUCTO
exports.getSingleProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. ACTUALIZAR PRODUCTO
exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. ELIMINAR PRODUCTO
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

        await product.deleteOne();
        res.status(200).json({ success: true, message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. CREAR/ACTUALIZAR RESEÑA
exports.createProductReview = async (req, res) => {
    try {
        const { rating, comment, productId } = req.body;

        const review = {
            user: req.user._id,
            nombre: req.user.nombre,
            rating: Number(rating),
            comentario: comment
        };

        const product = await Product.findById(productId);
        if(!product) return res.status(404).json({success: false, message: "Producto no encontrado"});

        const isReviewed = product.reviews.find(
            r => r.user.toString() === req.user._id.toString()
        );

        if (isReviewed) {
            product.reviews.forEach(review => {
                if (review.user.toString() === req.user._id.toString()) {
                    review.comentario = comment;
                    review.rating = rating;
                }
            });
        } else {
            product.reviews.push(review);
            product.numResenas = product.reviews.length;
        }

        product.ratingPromedio = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save({ validateBeforeSave: false });

        res.status(200).json({ success: true, message: "Reseña guardada" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};