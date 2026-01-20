const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    cod: { 
        type: String, 
        trim: true,
        default: '' 
    },
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria']
    },
    precio: {
        minorista: { type: Number, required: true },
        mayorista: { type: Number, required: true }
    },
    stock: {
        type: Number,
        required: [true, 'El stock es obligatorio'],
        default: 0
    },
    activo: {
        type: Boolean,
        default: true
    },
    categoria: {
        type: String,
        required: [true, 'La categoría es obligatoria']
    },
    // 👇 NUEVO CAMPO PARA G3
    subcategoria: {
        type: String,
        default: ''
    },
    imagenes: [
        {
            public_id: String,
            url: String
        }
    ],
    // 👇 ASEGURAMOS QUE ESTO EXISTA PARA LAS RESEÑAS
    reviews: [
        {
            user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
            nombre: { type: String, required: true },
            rating: { type: Number, required: true },
            comentario: { type: String, required: true }
        }
    ],
    numResenas: { type: Number, default: 0 },
    ratingPromedio: { type: Number, default: 0 },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

productSchema.index({ stock: -1 });

module.exports = mongoose.model('Product', productSchema);