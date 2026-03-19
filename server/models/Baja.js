const mongoose = require('mongoose');

const bajaSchema = new mongoose.Schema({
  activo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activo',
    required: true
  },
  fechaBaja: {
    type: Date,
    default: Date.now
  },
  motivo: {
    type: String,
    required: [true, 'El motivo de baja es requerido'],
    enum: ['Obsolescencia', 'Daño Irreparable', 'Robo', 'Pérdida', 'Otro']
  },
  descripcion: {
    type: String,
    required: true
  },
  responsableAutoriza: {
    type: String,
    required: true
  },
  documentoRespaldo: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Baja', bajaSchema);
