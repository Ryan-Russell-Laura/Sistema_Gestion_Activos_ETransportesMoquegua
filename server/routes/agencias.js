const express = require('express');
const Agencia = require('../models/Agencia');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const agencias = await Agencia.find().sort({ nombre: 1 });
    res.json(agencias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const agencia = await Agencia.findById(req.params.id);
    if (!agencia) {
      return res.status(404).json({ error: 'Agencia no encontrada' });
    }
    res.json(agencia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const agencia = new Agencia(req.body);
    await agencia.save();
    res.status(201).json(agencia);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const agencia = await Agencia.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!agencia) {
      return res.status(404).json({ error: 'Agencia no encontrada' });
    }
    res.json(agencia);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const agencia = await Agencia.findByIdAndDelete(req.params.id);
    if (!agencia) {
      return res.status(404).json({ error: 'Agencia no encontrada' });
    }
    res.json({ message: 'Agencia eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
