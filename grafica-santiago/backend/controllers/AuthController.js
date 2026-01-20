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

    const user = await User.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.toLowerCase().trim(),
      password: password, 
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

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

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

// 👇 ACTUALIZAR PERFIL (Usuario logueado)
exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    const { nombre, apellido, telefono, cedulaRuc, password } = req.body;

    // Solo actualizamos si el campo viene en la petición
    if (nombre) updates.nombre = nombre.trim();
    if (apellido) updates.apellido = apellido.trim();
    if (telefono) updates.telefono = telefono.trim();
    if (cedulaRuc) updates.cedulaRuc = cedulaRuc.trim();

    // Si envía contraseña, la encriptamos
    if (password && String(password).trim().length >= 6) {
      updates.password = await bcrypt.hash(password, 10);
    }

    // Actualizamos y devolvemos el usuario NUEVO ({new: true})
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });

    return res.json({
      success: true,
      message: 'Perfil actualizado correctamente.',
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

// --- FUNCIONES DE ADMINISTRADOR ---

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('GET ALL USERS ERROR:', error);
    return res.status(500).json({ success: false, message: 'Error al listar usuarios.' });
  }
};

// 👇 CAMBIAR ROL (Para ascender a Bodega/Admin)
// 👇 CAMBIAR ROL (CON VERIFICACIÓN DE CONTRASEÑA)
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params; // ID del usuario al que vamos a cambiar
        const { role, adminPassword } = req.body; // El nuevo rol y la contraseña del admin

        // 1. Validar que enviaron la contraseña
        if (!adminPassword) {
            return res.status(400).json({ success: false, message: "Se requiere contraseña para confirmar." });
        }

        // 2. Validar que el rol sea válido
        if (!['user', 'admin', 'bodega'].includes(role)) {
            return res.status(400).json({ success: false, message: "Rol no válido" });
        }

        // 3. VERIFICAR QUE EL ADMIN (req.user) ES QUIEN DICE SER
        // Buscamos al admin que está haciendo la petición y pedimos su contraseña encriptada
        const adminUser = await User.findById(req.user._id).select('+password');
        
        if (!adminUser) {
            return res.status(404).json({ success: false, message: "Admin no encontrado." });
        }

        // Comparamos la contraseña que escribió en la ventanita con la de la base de datos
        const isMatch = await bcrypt.compare(adminPassword, adminUser.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Contraseña incorrecta. No autorizado." });
        }
        
        // 4. Si la contraseña es correcta, procedemos al cambio
        const user = await User.findByIdAndUpdate(id, { role }, { new: true });

        if (!user) return res.status(404).json({ success: false, message: "Usuario objetivo no encontrado" });

        res.json({ success: true, message: `Rol actualizado a ${role}`, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// 👇 ELIMINAR USUARIO
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        
        if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

        res.json({ success: true, message: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};