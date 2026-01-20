const OrderRepository = require('../repositories/order.repository');
const EmailService = require('../services/EmailService');

class OrderController {
    
    // 1. Crear nueva orden
    async newOrder(req, res, next) {
        try {
            const { orderItems, shippingInfo, itemsPrice, totalPrice, paymentInfo } = req.body;
            
            const order = await OrderRepository.create({
                orderItems,
                shippingInfo,
                itemsPrice,
                totalPrice,
                paymentInfo,
                paidAt: Date.now(),
                user: req.user._id
            });

            // Intentar enviar correo (sin bloquear)
            try {
                await EmailService.sendOrderConfirmation(order, req.user);
            } catch (error) {
                console.error("Error enviando correo:", error.message);
            }

            res.status(201).json({ success: true, order });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 2. Ver mis órdenes (Usuario)
    async myOrders(req, res, next) {
        try {
            const orders = await OrderRepository.findByUser(req.user._id);
            res.status(200).json({ success: true, orders });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 3. Ver una orden específica
    async getSingleOrder(req, res, next) {
        try {
            const order = await OrderRepository.findById(req.params.id);
            if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
            res.status(200).json({ success: true, order });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 4. Ver todas las órdenes (Admin)
    async allOrders(req, res, next) {
        try {
            const orders = await OrderRepository.findAll();
            let totalAmount = 0;
            orders.forEach(order => { totalAmount += order.totalPrice; });
            res.status(200).json({ success: true, totalAmount, orders });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 5. Actualizar orden (Admin)
    async updateOrder(req, res, next) {
        try {
            const order = await OrderRepository.findById(req.params.id);
            if (!order) return res.status(404).json({ message: 'Orden no encontrada' });

            order.orderStatus = req.body.status;
            if (req.body.status === 'Delivered') {
                order.deliveredAt = Date.now();
            }

            await order.save();
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 6. Eliminar orden (Admin)
    async deleteOrder(req, res, next) {
        try {
            const order = await OrderRepository.delete(req.params.id);
            if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

// INSTANCIA Y EXPORTACIÓN SEGURA
const controller = new OrderController();

module.exports = {
    newOrder: (req, res, next) => controller.newOrder(req, res, next),
    myOrders: (req, res, next) => controller.myOrders(req, res, next),
    getSingleOrder: (req, res, next) => controller.getSingleOrder(req, res, next),
    allOrders: (req, res, next) => controller.allOrders(req, res, next),
    updateOrder: (req, res, next) => controller.updateOrder(req, res, next),
    deleteOrder: (req, res, next) => controller.deleteOrder(req, res, next)
};