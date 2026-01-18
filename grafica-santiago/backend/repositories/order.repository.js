const mongoose = require('mongoose');
const Order = require('../models/order.model');

/**
 * Repositorio de Orders (Pedido)
 * Centraliza acceso a MongoDB para pedidos.
 */
class OrderRepository {
  async create(orderData) {
    return await Order.create(orderData);
  }

  async findById(orderId) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) return null;

    return await Order.findById(orderId)
      .populate('user', 'nombre apellido email role')
      .populate('orderItems.product', 'nombre precio stock categoria');
  }

  async findByUser(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];

    return await Order.find({ user: userId }).sort({ createdAt: -1 });
  }

  async findAll() {
    return await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'nombre apellido email role');
  }

  async updateStatus(orderId, updates) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) return null;

    return await Order.findByIdAndUpdate(orderId, updates, { new: true });
  }

  async delete(orderId) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) return null;

    return await Order.findByIdAndDelete(orderId);
  }
}

module.exports = new OrderRepository();
