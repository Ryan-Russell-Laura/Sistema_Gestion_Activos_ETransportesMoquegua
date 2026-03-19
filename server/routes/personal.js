const express = require('express');
const Personal = require('../models/Personal');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const personal = await Personal.find()
      .populate('agencia', 'nombre')
      .sort({ apellido: 1 });
    res.json(personal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const personal = await Personal.findById(req.params.id)
      .populate('agencia');
    if (!personal) {
      return res.status(404).json({ error: 'Personal no encontrado' });
    }
    res.json(personal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const personal = new Personal(req.body);
    await personal.save();
    await personal.populate('agencia', 'nombre');
    res.status(201).json(personal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const personal = await Personal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('agencia', 'nombre');
    if (!personal) {
      return res.status(404).json({ error: 'Personal no encontrado' });
    }
    res.json(personal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const personal = await Personal.findByIdAndDelete(req.params.id);
    if (!personal) {
      return res.status(404).json({ error: 'Personal no encontrado' });
    }
    res.json({ message: 'Personal eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
