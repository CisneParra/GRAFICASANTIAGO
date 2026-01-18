const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user_model');

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'clave_super_secreta_cambiar_en_produccion',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono, cedulaRuc } = req.body;

    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: nombre, apellido, email, password'
      });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      telefono: telefono || '',
      cedulaRuc: cedulaRuc || '',
      role: 'user'
    });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return res.status(500).json({ success: false, message: 'Error en registro.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y password son obligatorios.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({ success: false, message: 'Error en login.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // req.user lo pone el middleware
    return res.json({
      success: true,
      user: {
        id: req.user._id,
        nombre: req.user.nombre,
        apellido: req.user.apellido,
        email: req.user.email,
        role: req.user.role,
        telefono: req.user.telefono || '',
        cedulaRuc: req.user.cedulaRuc || ''
      }
    });
  } catch (error) {
    console.error('GET PROFILE ERROR:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener perfil.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    const { nombre, apellido, telefono, cedulaRuc, password } = req.body;

    if (nombre) updates.nombre = nombre.trim();
    if (apellido) updates.apellido = apellido.trim();
    if (telefono !== undefined) updates.telefono = telefono;
    if (cedulaRuc !== undefined) updates.cedulaRuc = cedulaRuc;

    if (password && String(password).trim().length >= 8) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });

    return res.json({
      success: true,
      message: 'Perfil actualizado.',
      user: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        role: user.role,
        telefono: user.telefono || '',
        cedulaRuc: user.cedulaRuc || ''
      }
    });
  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar perfil.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('GET ALL USERS ERROR:', error);
    return res.status(500).json({ success: false, message: 'Error al listar usuarios.' });
  }
};
