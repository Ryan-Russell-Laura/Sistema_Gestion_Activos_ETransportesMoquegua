const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const activoRoutes = require('./routes/activos');
const personalRoutes = require('./routes/personal');
const agenciaRoutes = require('./routes/agencias');
const asignacionRoutes = require('./routes/asignaciones');
const bajaRoutes = require('./routes/bajas');
// NUEVO: Importar la ruta de repotenciación
const repotenciacionRoutes = require('./routes/repotenciacion'); 

const app = express();

// Busca esta línea: app.use(cors());
// Y reemplázala por esta configuración:

const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'https://activostransportesmoquegua.netlify.app' // La URL que aparece en tu captura de Netlify
  ],
  credentials: true
};
app.use(cors(corsOptions));


app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

app.use('/api/auth', authRoutes);
app.use('/api/activos', activoRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/agencias', agenciaRoutes);
app.use('/api/asignaciones', asignacionRoutes);
app.use('/api/bajas', bajaRoutes);
// NUEVO: Registrar la ruta de repotenciación
app.use('/api/repotenciacion', repotenciacionRoutes); 


app.get('/', (req, res) => {
  res.json({ message: 'API de Control de Activos - Transportes Moquegua' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});