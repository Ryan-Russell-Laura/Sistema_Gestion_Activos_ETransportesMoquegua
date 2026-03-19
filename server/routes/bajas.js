const express = require('express');
const Baja = require('../models/Baja');
const Activo = require('../models/Activo');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const bajas = await Baja.find()
      .populate('activo', 'codigo nombre tipo marca modelo')
      .sort({ fechaBaja: -1 });
    res.json(bajas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const baja = await Baja.findById(req.params.id)
      .populate('activo');
    if (!baja) {
      return res.status(404).json({ error: 'Baja no encontrada' });
    }
    res.json(baja);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { activo: activoId } = req.body;

    const activo = await Activo.findById(activoId);
    if (!activo) {
      return res.status(404).json({ error: 'Activo no encontrado' });
    }

    if (activo.estado === 'De Baja') {
      return res.status(400).json({ error: 'El activo ya está dado de baja' });
    }

    const baja = new Baja(req.body);
    await baja.save();

    activo.estado = 'De Baja';
    activo.personalAsignado = null;
    await activo.save();

    await baja.populate('activo');
    res.status(201).json(baja);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const baja = await Baja.findByIdAndDelete(req.params.id);
    if (!baja) {
      return res.status(404).json({ error: 'Baja no encontrada' });
    }
    res.json({ message: 'Baja eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
