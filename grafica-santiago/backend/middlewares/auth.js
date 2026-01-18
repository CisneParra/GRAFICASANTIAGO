const jwt = require('jsonwebtoken');
const User = require('../models/user_model');

// Verificar si el usuario está autenticado (Tiene Token válido)
exports.isAuthenticatedUser = async (req, res, next) => {
    try {
        let token;
        
        // 1. Buscar token en el header Authorization ("Bearer eyJkb...")
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // 2. Si no hay token, denegar acceso
        if (!token) {
            return res.status(401).json({ success: false, message: 'Debes iniciar sesión para acceder a este recurso.' });
        }

        // 3. Verificar la firma del token
        // Usamos la clave del .env, o una por defecto si no existe
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_super_secreta_cambiar_en_produccion');
        
        // 4. Buscar al usuario dueño del token
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Usuario no encontrado con este token.' });
        }

        next(); // ¡Pase usted!
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
    }
};

// Verificar si el usuario tiene el Rol necesario (ej: 'admin')
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: `El rol (${req.user.role}) no tiene permiso para realizar esta acción` 
            });
        }
        next();
    };
};