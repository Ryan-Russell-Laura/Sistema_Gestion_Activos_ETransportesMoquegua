const mongoose = require('mongoose');

const agenciaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la agencia es requerido'],
    enum: ['Tacna', 'Moquegua', 'Ilo','Arequipa','Mollendo','Camana','Cusco','Puno','Juliaca','Nasca','Ica','Lima-LaVictoria','Lima-PlazaNorte','Lima-Atocongo'],
    unique: true
  },
  direccion: {
    type: String,
    required: true
  },
  telefono: String,
  responsable: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Agencia', agenciaSchema);
