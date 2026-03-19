import React, { useState, useEffect } from 'react';
import api from '../services/api';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Configuración de notificaciones rápidas (Toasts)
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

const Agencias = () => {
  const [agencias, setAgencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAgencia, setEditingAgencia] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    responsable: ''
  });

  useEffect(() => {
    loadAgencias();
  }, []);

  const loadAgencias = async () => {
    try {
      const response = await api.get('/agencias');
      setAgencias(response.data);
    } catch (error) {
      setError('Error al cargar agencias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingAgencia) {
        await api.put(`/agencias/${editingAgencia._id}`, formData);
        // --- CAMBIO: Toast de éxito para edición ---
        Toast.fire({
          icon: 'success',
          title: '¡Agencia actualizada con éxito!'
        });
      } else {
        await api.post('/agencias', formData);
        // --- CAMBIO: Toast de éxito para nueva agencia ---
        Toast.fire({
          icon: 'success',
          title: '¡Agencia registrada con éxito!'
        });
      }
      loadAgencias();
      closeModal();
    } catch (error) {
        // --- CAMBIO: Alerta de error visual ---
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: error.response?.data?.error || 'No se pudo procesar la solicitud',
        confirmButtonColor: '#d33'
      });
    }
  };

  const handleDelete = async (id) => {
    // 1. Confirmación con diseño moderno
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción eliminará la agencia. Asegúrate de que no tenga activos vinculados.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Rojo para eliminar
      cancelButtonColor: '#3085d6', // Azul para cancelar
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    // 2. Si el usuario confirma en el modal
    if (result.isConfirmed) {
      try {
        await api.delete(`/agencias/${id}`);
        
        // Notificación de éxito rápida (Toast)
        Toast.fire({
          icon: 'success',
          title: 'Agencia eliminada correctamente'
        });

        loadAgencias();
      } catch (error) {
        // Alerta de error estilizada
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: error.response?.data?.error || 'No se pudo eliminar la agencia. Posiblemente esté en uso.',
          confirmButtonColor: '#d33'
        });
      }
    }
  };

  const openModal = (agencia = null) => {
    if (agencia) {
      setEditingAgencia(agencia);
      setFormData({
        nombre: agencia.nombre,
        direccion: agencia.direccion,
        telefono: agencia.telefono || '',
        responsable: agencia.responsable || ''
      });
    } else {
      setEditingAgencia(null);
      setFormData({
        nombre: '',
        direccion: '',
        telefono: '',
        responsable: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAgencia(null);
    setError('');
  };

  if (loading) {
    return <div className="loading">Cargando agencias...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Agencias</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Nueva Agencia
        </button>
      </div>

      <div className="card">
        {agencias.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📍</div>
            <p>No hay agencias registradas</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th>Teléfono</th>
                  <th>Responsable</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {agencias.map((agencia) => (
                  <tr key={agencia._id}>
                    <td><strong>{agencia.nombre}</strong></td>
                    <td>{agencia.direccion}</td>
                    <td>{agencia.telefono || '-'}</td>
                    <td>{agencia.responsable || '-'}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-primary" onClick={() => openModal(agencia)}>
                          Editar ✏️
                        </button>
                        {/* Reemplaza el botón de eliminar por este */}
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(agencia._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAgencia ? 'Editar Agencia' : 'Nueva Agencia'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <select
                  className="form-control"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="Tacna">Tacna</option>
                  <option value="Moquegua">Moquegua</option>
                  <option value="Ilo">Ilo</option>
                  <option value="Arequipa">Arequipa</option>
                  <option value="Mollendo">Mollendo</option>
                  <option value="Camana">Camana</option>                 
                  <option value="Cusco">Cusco</option>
                  <option value="Puno">Puno</option>
                  <option value="Juliaca">Juliaca</option>
                  <option value="Nasca">Nasca</option>
                  <option value="Ica">Ica</option>                  
                  <option value="Lima-LaVictoria">Lima - La Victoria</option>
                  <option value="Lima-PlazaNorte">Lima - Plaza Norte</option>
                  <option value="Lima-Atocongo">Lima - Atocongo</option>
                </select>
              </div>

              <div className="form-group">
                <label>Dirección *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Responsable</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAgencia ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agencias;
