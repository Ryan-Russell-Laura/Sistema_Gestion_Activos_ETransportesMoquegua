const mongoose = require('mongoose');

const activoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: [true, 'El código es requerido'],
    unique: true,
    trim: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  // Archivo: models/Activo.js
  tipo: {
  type: String,
  required: true,
  enum: [
    'CPU', 
    'LAPTOP',     // Antes: 'Laptop'
    'IMPRESORA',  // Antes: 'Impresora'
    'MONITOR',    // Antes: 'Monitor'
    'RAM', 
    'DISCO DURO', 
    'OTRO'        // Antes: 'OTRO' (Verifica que coincida con el valor del select)
  ]
  },
  clase: {
    type: String,
    enum: ['EQUIPO', 'COMPONENTE'], 
    default: 'EQUIPO'
  },
  equipoPadre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activo',
    default: null
  },
  marca: String,
  modelo: String,
  serie: {
    type: String,
    trim: true
  },
  estado: {
    type: String,
    enum: ['Disponible', 'Asignado', 'De Baja', 'Instalado'], 
    default: 'Disponible'
  },
  fechaAdquisicion: {
    type: Date,
    default: Date.now
  },
  valorAdquisicion: {
    type: Number,
    default: 0
  },
  agencia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agencia'
  },
  personalAsignado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personal'
  },
  ultimaAsignacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asignacion'
  },
  observaciones: String,
}, {
  timestamps: true
});

module.exports = mongoose.model('Activo', activoSchema);