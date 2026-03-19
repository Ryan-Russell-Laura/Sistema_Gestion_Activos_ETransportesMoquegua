const express = require('express');
const router = express.Router();
const Activo = require('../models/Activo');
const Repotenciacion = require('../models/Repotenciacion');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', async (req, res) => {
  try {
    const { cpuId, componenteId } = req.body;
    const cpu = await Activo.findById(cpuId).populate('personalAsignado');
    const componente = await Activo.findById(componenteId);

    if (!cpu || !componente) return res.status(404).json({ error: 'No encontrado' });

    // 1. Obtener número de acta correlativo
    const ultima = await Repotenciacion.findOne().sort({ numeroActa: -1 });
    const nuevoNumero = ultima ? ultima.numeroActa + 1 : 1;

    // 2. Crear documento de Repotenciación oficial
    const nuevaMejora = new Repotenciacion({
      numeroActa: nuevoNumero,
      cpu: cpuId,
      componentes: [componenteId],
      usuarioAsignado: cpu.personalAsignado?._id || null,
      tipoFirma: cpu.personalAsignado ? 'SOPORTE_USUARIO' : 'SOPORTE_GERENCIA',
      observaciones: `Instalación de ${componente.nombre} S/N: ${componente.serie}`
    });
    await nuevaMejora.save();

    // 3. Actualizar estados
    componente.estado = 'Instalado';
    componente.equipoPadre = cpu._id;
    await componente.save();

    const fecha = new Date().toLocaleDateString('es-PE');
    // Usamos el cohete 🚀 como separador para el Frontend
    cpu.observaciones = (cpu.observaciones || '') + ` 🚀 [Acta #${nuevoNumero}] ${componente.nombre} (${fecha})`;
    await cpu.save();

    res.json({ message: 'Repotenciación exitosa', numeroActa: nuevoNumero });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// RUTA NUEVA: Obtener detalle completo para el PDF
// Busca la última repotenciación de un CPU y trae los datos de los componentes
router.get('/detalle/:cpuId', async (req, res) => {
  try {
    const repotenciacion = await Repotenciacion.findOne({ cpu: req.params.cpuId })
      .sort({ createdAt: -1 }) // Trae la más reciente
      .populate('componentes') // <--- IMPORTANTE: Esto es lo que trae marca, modelo y serie
      .populate('cpu')
      .populate('usuarioAsignado');

    if (!repotenciacion) {
      return res.status(404).json({ message: 'No hay registro de repotenciación' });
    }
    
    res.json(repotenciacion);
  } catch (error) {
    console.error("Error al obtener detalle:", error);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;