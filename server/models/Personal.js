const mongoose = require('mongoose');

const personalSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  apellido: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true
  },
  dni: {
    type: String,
    required: [true, 'El DNI es requerido'],
    unique: true,
    trim: true
  },
  cargo: {
    type: String,
    required: true
  },
  agencia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agencia',
    required: true
  },
  telefono: String,
  email: String,
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Personal', personalSchema);
