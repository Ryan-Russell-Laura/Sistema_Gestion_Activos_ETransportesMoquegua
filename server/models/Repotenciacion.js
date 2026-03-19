const mongoose = require('mongoose');

const repotenciacionSchema = new mongoose.Schema({
  numeroActa: { 
    type: Number, 
    required: true 
  },
  fecha: { 
    type: Date, 
    default: Date.now 
  },
  
  // 1. EL PROTAGONISTA: El CPU que recibe la mejora
  cpu: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Activo', 
    required: true 
  },
  
  // 2. LOS ACTORES: Componentes nuevos (Array porque puedes poner RAM + SSD a la vez)
  componentes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Activo' 
  }],
  
  // 3. LOS RESPONSABLES
  responsableSoporte: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Personal' // David Aduviri
  }, 
  
  usuarioAsignado: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Personal', 
    default: null 
  }, // El dueño del CPU (si existe)

  // 4. LÓGICA DE FIRMAS (Para saber qué formato imprimir)
  tipoFirma: { 
    type: String, 
    enum: ['SOPORTE_USUARIO', 'SOPORTE_GERENCIA'],
    required: true
  },
  
  observaciones: String

}, { timestamps: true });

module.exports = mongoose.model('Repotenciacion', repotenciacionSchema);