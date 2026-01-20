const Product = require('../models/product_model');
const Order = require('../models/order.model');
const User = require('../models/user_model');

exports.getSummary = async (req, res) => {
  try {
    const [usersCount, productsCount, ordersCount, totalSalesAgg, topStockProducts] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ['$totalPrice', 0] } } } }]),
        Product.find().sort({ stock: -1 }).limit(5).select('nombre stock categoria').lean()
    ]);

    return res.json({
      success: true,
      summary: {
        usersCount,
        productsCount,
        ordersCount,
        totalSales: totalSalesAgg[0]?.total || 0,
        topStockProducts
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en reportes.' });
  }
};