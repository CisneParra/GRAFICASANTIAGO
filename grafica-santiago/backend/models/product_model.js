const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comentario: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema({
  cod: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },

  nombre: {
    type: String,
    required: [true, 'Nombre obligatorio'],
    trim: true
  },

  descripcion: { type: String, default: '' },

  // Frontend usa precio.minorista y precio.mayorista
  precio: {
    minorista: { type: Number, required: true, default: 0 },
    mayorista: { type: Number, default: 0 }
  },

  stock: { type: Number, required: true, default: 0 },

  categoria: { type: String, required: true, default: 'General' },

  imagenes: [{
    public_id: String,
    url: String
  }],

  activo: { type: Boolean, default: true },

  usuario: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },

  // ⭐ Reseñas
  reviews: [reviewSchema],
  ratingPromedio: { type: Number, default: 0 },
  numResenas: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
