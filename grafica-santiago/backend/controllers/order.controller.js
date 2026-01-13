const OrderRepository = require('../repositories/order.repository');
const EmailService = require('../services/EmailService'); // <--- 1. IMPORTANTE: Importar el servicio

class OrderController {
    
    // Crear nueva orden
    async newOrder(req, res, next) {
        try {
            const {
                orderItems,
                shippingInfo,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                paymentInfo
            } = req.body;

            // Crear la orden en la Base de Datos
            const order = await OrderRepository.create({
                orderItems,
                shippingInfo,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                paymentInfo,
                paidAt: Date.now(),
                user: req.user._id // El ID viene del middleware de autenticación
            });

            // 2. ¡ENVIAR EL CORREO DE CONFIRMACIÓN! ✉️
            // Lo envolvemos en un try/catch interno para que si falla el correo, 
            // la orden no se cancele (el cliente igual compró).
            try {
                // req.user tiene el email y nombre gracias al middleware de auth
                await EmailService.sendOrderConfirmation(order, req.user);
            } catch (emailError) {
                console.error("⚠️ Alerta: La orden se creó pero el correo falló:", emailError.message);
            }

            res.status(201).json({
                success: true,
                order
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Ver una orden específica
    async getSingleOrder(req, res, next) {
        try {
            const order = await OrderRepository.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Orden no encontrada' });
            }
            res.status(200).json({ success: true, order });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Ver mis órdenes (Usuario logueado)
    async myOrders(req, res, next) {
        try {
            const orders = await OrderRepository.findByUser(req.user._id);
            res.status(200).json({ success: true, orders });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Admin: Ver todas las órdenes
    async allOrders(req, res, next) {
        try {
            const orders = await OrderRepository.findAll();
            let totalAmount = 0;
            orders.forEach(order => {
                totalAmount += order.totalPrice;
            });
            res.status(200).json({ success: true, totalAmount, orders });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Admin: Actualizar estado de orden
    async updateOrder(req, res, next) {
        try {
            const order = await OrderRepository.findById(req.params.id);
            if (!order) return res.status(404).json({ message: 'Orden no encontrada' });

            if (order.orderStatus === 'Delivered') {
                return res.status(400).json({ message: 'Esta orden ya fue entregada' });
            }

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

    // Admin: Eliminar orden
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

// Exportamos las funciones individuales para que coincidan con la ruta
const controller = new OrderController();
module.exports = {
    newOrder: (req, res, next) => controller.newOrder(req, res, next),
    getSingleOrder: (req, res, next) => controller.getSingleOrder(req, res, next),
    myOrders: (req, res, next) => controller.myOrders(req, res, next),
    allOrders: (req, res, next) => controller.allOrders(req, res, next),
    updateOrder: (req, res, next) => controller.updateOrder(req, res, next),
    deleteOrder: (req, res, next) => controller.deleteOrder(req, res, next)
};