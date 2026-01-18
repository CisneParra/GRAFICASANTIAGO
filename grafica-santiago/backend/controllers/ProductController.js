const Product = require('../models/product_model');

// Controlador completo de Productos
class ProductController {

    // 1. Crear nuevo producto
    async newProduct(req, res, next) {
        try {
            const product = await Product.create(req.body);
            res.status(201).json({
                success: true,
                product
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 2. Obtener productos (CON FILTROS DE BÚSQUEDA Y CATEGORÍA) - HU017/HU018
    async getProducts(req, res, next) {
        try {
            const { keyword, category } = req.query;
            let query = {};

            // Filtro por nombre (Búsqueda)
            if (keyword) {
                query.nombre = { $regex: keyword, $options: 'i' }; // 'i' hace que no importe mayúsculas/minúsculas
            }

            // Filtro por categoría
            if (category) {
                query.categoria = category;
            }

            const products = await Product.find(query);

            res.status(200).json({
                success: true,
                count: products.length,
                products
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 3. Obtener un solo producto por ID
    async getSingleProduct(req, res, next) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            }
            res.status(200).json({ success: true, product });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 4. Actualizar producto
    async updateProduct(req, res, next) {
        try {
            let product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            }
            product = await Product.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            });
            res.status(200).json({ success: true, product });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 5. Eliminar producto
    async deleteProduct(req, res, next) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            }
            await product.deleteOne();
            res.status(200).json({ success: true, message: 'Producto eliminado' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

const controller = new ProductController();
module.exports = {
    newProduct: (req, res, next) => controller.newProduct(req, res, next),
    getProducts: (req, res, next) => controller.getProducts(req, res, next),
    getSingleProduct: (req, res, next) => controller.getSingleProduct(req, res, next),
    updateProduct: (req, res, next) => controller.updateProduct(req, res, next),
    deleteProduct: (req, res, next) => controller.deleteProduct(req, res, next)
};