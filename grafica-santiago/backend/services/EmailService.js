const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Configuración del "Cartero" (Transporter)
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // O usa 'hotmail', 'yahoo', etc.
            auth: {
                user: process.env.EMAIL_USER, // Tu correo
                pass: process.env.EMAIL_PASS  // Tu "Contraseña de Aplicación" (No la normal)
            }
        });
    }

    async sendEmail(to, subject, htmlContent) {
        try {
            const info = await this.transporter.sendMail({
                from: `"Gráfica Santiago" <${process.env.EMAIL_USER}>`,
                to: to,
                subject: subject,
                html: htmlContent
            });
            console.log(`📨 Correo enviado a ${to}: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error("❌ Error enviando correo:", error);
            return false;
        }
    }

    // Plantilla para Confirmación de Pedido
    async sendOrderConfirmation(order, user) {
        const subject = `¡Pedido Confirmado! #${order._id.toString().slice(-6)}`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h1 style="color: #2563eb;">¡Gracias por tu compra, ${user.nombre}!</h1>
                <p>Hemos recibido tu pedido correctamente.</p>
                
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Pedido ID:</strong> ${order._id}</p>
                    <p><strong>Total:</strong> $${order.totalPrice}</p>
                    <p><strong>Estado:</strong> ${order.orderStatus}</p>
                </div>

                <p>Te avisaremos cuando tus productos estén en camino.</p>
                <hr>
                <p style="font-size: 12px; color: #666;">Gráfica Santiago E-commerce</p>
            </div>
        `;
        return this.sendEmail(user.email, subject, html);
    }
}

module.exports = new EmailService();