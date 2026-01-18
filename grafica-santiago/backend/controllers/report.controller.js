const Product = require('../models/product_model');
const Order = require('../models/order.model');
const User = require('../models/user_model');

/**
 * Reporte resumen para dashboard admin
 * Devuelve:
 * - total usuarios
 * - total productos
 * - total pedidos
 * - total ventas (si existe totalPrice en Order)
 * - pedidos por estado (si existe orderStatus en Order)
 * - top 5 productos con más stock
 */
exports.getSummary = async (req, res) => {
  try {
    const [usersCount, productsCount, ordersCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments()
    ]);

    // Total ventas (si tu Order tiene totalPrice)
    const totalSalesAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: { $ifNull: ['$totalPrice', 0] } } } }
    ]);
    const totalSales = totalSalesAgg[0]?.total || 0;

    // Pedidos por estado (si tu Order tiene orderStatus)
    const ordersByStatusAgg = await Order.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$orderStatus', 'Sin Estado'] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Top 5 productos con más stock
    const topStockProducts = await Product.find()
      .sort({ stock: -1 })
      .limit(5)
      .select('nombre stock categoria precio');

    return res.json({
      success: true,
      summary: {
        usersCount,
        productsCount,
        ordersCount,
        totalSales,
        ordersByStatus: ordersByStatusAgg,
        topStockProducts
      }
    });
  } catch (error) {
    console.error('REPORT SUMMARY ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al generar el resumen de reportes.'
    });
  }
};
