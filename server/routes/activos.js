const express = require('express');
const Activo = require('../models/Activo');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { estado, agencia, tipo } = req.query;
    const filter = {};

    if (estado) filter.estado = estado;
    if (agencia) filter.agencia = agencia;
    if (tipo) filter.tipo = tipo;

    // ESTA ES LA PARTE CLAVE:
    const activos = await Activo.find(filter)
      .populate('agencia', 'nombre') // Para ver el nombre de la agencia
      .populate('personalAsignado', 'nombre apellido cargo') // Para ver quién lo tiene
      .populate('ultimaAsignacion') // <--- SI NO PONES ESTO, LA FECHA NO SALE EN PANTALLA
      .sort({ codigo: 1 });

    res.json(activos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const activo = await Activo.findById(req.params.id)
      .populate('agencia')
      .populate('personalAsignado');
    if (!activo) {
      return res.status(404).json({ error: 'Activo no encontrado' });
    }
    res.json(activo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const activo = new Activo(req.body);
    await activo.save();
    await activo.populate(['agencia', 'personalAsignado']);
    res.status(201).json(activo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const activo = await Activo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate(['agencia', 'personalAsignado']);
    if (!activo) {
      return res.status(404).json({ error: 'Activo no encontrado' });
    }
    res.json(activo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const activo = await Activo.findByIdAndDelete(req.params.id);
    if (!activo) {
      return res.status(404).json({ error: 'Activo no encontrado' });
    }
    res.json({ message: 'Activo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
