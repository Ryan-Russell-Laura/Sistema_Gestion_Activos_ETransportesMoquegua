const express = require('express');
const Asignacion = require('../models/Asignacion');
const Activo = require('../models/Activo');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// 1. OBTENER TODAS LAS ASIGNACIONES (CORREGIDO)
router.get('/', async (req, res) => {
  try {
    const { activa } = req.query;
    const filter = activa !== undefined ? { activa: activa === 'true' } : {};

    const asignaciones = await Asignacion.find(filter)
      .populate({
        path: 'activos', // <--- ANTES DECÍA 'activo', DEBE SER 'activos' (PLURAL)
        select: 'codigo nombre tipo marca modelo serie agencia observaciones',
        populate: { 
          path: 'agencia', 
          select: 'nombre direccion telefono responsable' 
        }
      })
      .populate('personal', 'nombre apellido cargo dni')
      .sort({ numeroActa: -1 }); // Ordenar por acta más reciente

    res.json(asignaciones);
  } catch (error) {
    console.error("Error en GET /asignaciones:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. OBTENER UNA ESPECÍFICA
router.get('/:id', async (req, res) => {
  try {
    const asignacion = await Asignacion.findById(req.params.id)
      .populate('activos') // <--- CAMBIADO A PLURAL
      .populate('personal');
    if (!asignacion) return res.status(404).json({ error: 'Asignación no encontrada' });
    res.json(asignacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. CREAR ASIGNACIÓN MÚLTIPLE (CORREGIDO)
router.post('/', async (req, res) => {
  try {
    const { activos: activosIds, personal: personalId, observaciones } = req.body;

    if (!activosIds || activosIds.length === 0) {
      return res.status(400).json({ error: 'Debe seleccionar al menos un equipo' });
    }

    const ultimaAsignacion = await Asignacion.findOne().sort({ numeroActa: -1 });
    const nuevoNumeroActa = ultimaAsignacion ? (ultimaAsignacion.numeroActa + 1) : 1;

    const asignacion = new Asignacion({
      activos: activosIds, // Array de IDs
      personal: personalId,
      numeroActa: nuevoNumeroActa,
      observaciones
    });

    await asignacion.save();

    // Actualizar estado de los activos seleccionados
    await Activo.updateMany(
      { _id: { $in: activosIds } },
      { 
        $set: { 
          estado: 'Asignado', 
          personalAsignado: personalId,
          ultimaAsignacion: asignacion._id 
        } 
      }
    );

    await asignacion.populate(['activos', 'personal']);
    res.status(201).json(asignacion);
  } catch (error) {
    console.error("Error en POST /asignaciones:", error);
    res.status(400).json({ error: error.message });
  }
});

// 4. DEVOLUCIÓN (CORREGIDO PARA OBSERVACIONES INDIVIDUALES)
router.put('/:id/devolver', async (req, res) => {
  try {
    // 1. Extraemos tanto el campo general como el nuevo arreglo de detalles
    const { observacionesDevolucion, detallesDevolucion } = req.body;

    const asignacion = await Asignacion.findById(req.params.id);
    if (!asignacion) return res.status(404).json({ error: 'Asignación no encontrada' });

    // 2. Guardamos datos generales
    asignacion.fechaDevolucion = new Date();
    asignacion.activa = false;
    
    // Guardamos el texto general por si acaso (compatibilidad)
    asignacion.observacionesDevolucion = observacionesDevolucion || 'OPERATIVO / BUENO';
    
    // NUEVO: Guardamos el arreglo de observaciones individuales por equipo
    if (detallesDevolucion) {
      asignacion.detallesDevolucion = detallesDevolucion;
    }
    
    await asignacion.save();

    // 3. Liberamos todos los equipos vinculados
    await Activo.updateMany(
      { _id: { $in: asignacion.activos } }, 
      { 
        $set: { 
          estado: 'Disponible', 
          personalAsignado: null 
        } 
      }
    );

    // 4. Devolvemos el objeto poblado para el frontend
    await asignacion.populate([
      { path: 'activos' }, 
      'personal'
    ]);
    
    res.json(asignacion);
  } catch (error) {
    console.error("Error en devolución:", error);
    res.status(400).json({ error: error.message });
  }
});

// Eliminar asignación y liberar activos
router.delete('/:id', async (req, res) => {
  try {
    // 1. Buscamos la asignación antes de borrarla para saber qué activos liberar
    const asignacion = await Asignacion.findById(req.params.id);
    
    if (!asignacion) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    // 2. Liberamos todos los activos que estaban en esta acta
    // Los ponemos como "Disponible" y quitamos el personal asignado
    if (asignacion.activos && asignacion.activos.length > 0) {
      await Activo.updateMany(
        { _id: { $in: asignacion.activos } },
        { 
          $set: { 
            estado: 'Disponible', 
            personalAsignado: null,
            ultimaAsignacion: null 
          } 
        }
      );
    }

    // 3. Ahora sí, borramos el acta de la base de datos
    await Asignacion.findByIdAndDelete(req.params.id);

    res.json({ message: 'Acta eliminada y equipos liberados correctamente' });
  } catch (error) {
    console.error("Error al eliminar asignación:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;