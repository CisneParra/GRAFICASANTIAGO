const jwt = require('jsonwebtoken');
const User = require('../models/user_model');

exports.isAuthenticatedUser = async (req, res, next) => {
    try {
        let token;
        
        // Buscar token en cookies o header Authorization
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Inicia sesión para acceder.' });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_super_secreta_cambiar_en_produccion');
        req.user = await User.findById(decoded.id);

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
    }
};

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: `El rol (${req.user.role}) no tiene permiso para esta acción` 
            });
        }
        next();
    };
};