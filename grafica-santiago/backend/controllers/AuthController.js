const User = require('../models/user_model');
const jwt = require('jsonwebtoken'); // Asegúrate de tener: npm install jsonwebtoken

// Función auxiliar para crear Token
const sendToken = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
    res.status(statusCode).json({
        success: true,
        token,
        user
    });
};

class AuthController {

    // 1. Registro de usuario
    async registerUser(req, res, next) {
        try {
            const { nombre, email, password, telefono } = req.body;
            const user = await User.create({ nombre, email, password, telefono });
            sendToken(user, 201, res);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 2. Login de usuario
    async loginUser(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Por favor ingrese email y contraseña' });
            }

            const user = await User.findOne({ email }).select('+password');
            if (!user) {
                return res.status(401).json({ message: 'Email o contraseña inválidos' });
            }

            const isPasswordMatched = await user.comparePassword(password);
            if (!isPasswordMatched) {
                return res.status(401).json({ message: 'Email o contraseña inválidos' });
            }

            sendToken(user, 200, res);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 3. Cerrar sesión
    async logout(req, res, next) {
        res.cookie('token', null, {
            expires: new Date(Date.now()),
            httpOnly: true
        });
        res.status(200).json({
            success: true,
            message: 'Cierre de sesión exitoso'
        });
    }

    // 4. Actualizar Perfil (HU-006) - ¡NUEVO!
    async updateProfile(req, res, next) {
        try {
            const newUserData = {
                nombre: req.body.nombre,
                email: req.body.email,
                telefono: req.body.telefono
            };

            // req.user.id viene del middleware de autenticación
            const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
                new: true,
                runValidators: true,
                useFindAndModify: false
            });

            res.status(200).json({
                success: true,
                user
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

const controller = new AuthController();
module.exports = {
    registerUser: (req, res, next) => controller.registerUser(req, res, next),
    loginUser: (req, res, next) => controller.loginUser(req, res, next),
    logout: (req, res, next) => controller.logout(req, res, next),
    updateProfile: (req, res, next) => controller.updateProfile(req, res, next)
};