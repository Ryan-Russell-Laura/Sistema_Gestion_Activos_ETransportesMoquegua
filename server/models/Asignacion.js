const mongoose = require('mongoose');

const asignacionSchema = new mongoose.Schema({
  // DEBE SER ASÍ: plural y con corchetes
  activos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activo', required: true }],
  personal: { type: mongoose.Schema.Types.ObjectId, ref: 'Personal', required: true },
  numeroActa: { type: Number, default: 1 }, 
  fechaAsignacion: { type: Date, default: Date.now },
  fechaDevolucion: Date,
  observaciones: String,
  observacionesDevolucion: String,
  detallesDevolucion: [{
    activoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activo' },
    observacion: String
  }],
  activa: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Asignacion', asignacionSchema);