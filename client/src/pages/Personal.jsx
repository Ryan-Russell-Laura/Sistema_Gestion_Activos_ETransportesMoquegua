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

const Personal = () => {
  const [personal, setPersonal] = useState([]);
  const [agencias, setAgencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    cargo: '',
    agencia: '',
    telefono: '',
    email: '',
    activo: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [personalRes, agenciasRes] = await Promise.all([
        api.get('/personal'),
        api.get('/agencias')
      ]);
      setPersonal(personalRes.data);
      setAgencias(agenciasRes.data);
    } catch (error) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingPersonal) {
        // 1. Actualización de personal
        await api.put(`/personal/${editingPersonal._id}`, formData);
        
        Toast.fire({
          icon: 'success',
          title: '¡Datos actualizados con éxito!'
        });
      } else {
        // 2. Registro de nuevo personal
        await api.post('/personal', formData);
        
        Toast.fire({
          icon: 'success',
          title: '¡Personal registrado correctamente!'
        });
      }

      loadData();
      closeModal();
    } catch (error) {
      // 3. Reemplazamos el setError por SweetAlert2 para el error
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: error.response?.data?.error || 'No se pudo procesar la solicitud del personal',
        confirmButtonColor: '#d33'
      });
    }
  };

const handleDelete = async (id) => {
    // 1. Confirmación con advertencia visual
    const result = await Swal.fire({
      title: '¿Eliminar personal?',
      text: "Esta acción no se puede deshacer. Asegúrate de que no tenga activos bajo su responsabilidad.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Rojo para peligro
      cancelButtonColor: '#3085d6', // Azul para cancelar
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    // 2. Si el usuario confirma la acción
    if (result.isConfirmed) {
      try {
        await api.delete(`/personal/${id}`);
        
        // Notificación de éxito rápida (Toast)
        Toast.fire({
          icon: 'success',
          title: 'Personal eliminado correctamente'
        });

        loadData();
      } catch (error) {
        // Alerta de error si el backend lo rechaza (ej. por integridad referencial)
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: error.response?.data?.error || 'No se pudo eliminar el registro del personal',
          confirmButtonColor: '#d33'
        });
      }
    }
  };

  const openModal = (p = null) => {
    if (p) {
      setEditingPersonal(p);
      setFormData({
        nombre: p.nombre,
        apellido: p.apellido,
        dni: p.dni,
        cargo: p.cargo,
        agencia: p.agencia?._id || '',
        telefono: p.telefono || '',
        email: p.email || '',
        activo: p.activo
      });
    } else {
      setEditingPersonal(null);
      setFormData({
        nombre: '',
        apellido: '',
        dni: '',
        cargo: '',
        agencia: '',
        telefono: '',
        email: '',
        activo: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPersonal(null);
    setError('');
  };

  if (loading) {
    return <div className="loading">Cargando personal...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Personal</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Nuevo Personal
        </button>
      </div>

      <div className="card">
        {personal.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p>No hay personal registrado</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>DNI</th>
                  <th>Cargo</th>
                  <th>Agencia</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {personal.map((p) => (
                  <tr key={p._id}>
                    <td><strong>{p.nombre} {p.apellido}</strong></td>
                    <td>{p.dni}</td>
                    <td>{p.cargo}</td>
                    <td>{p.agencia?.nombre || '-'}</td>
                    <td>
                      {p.telefono && <div>{p.telefono}</div>}
                      {p.email && <div style={{ fontSize: '12px', color: '#7f8c8d' }}>{p.email}</div>}
                    </td>
                    <td>
                      <span className={`badge ${p.activo ? 'badge-success' : 'badge-danger'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-primary" onClick={() => openModal(p)}>
                          Editar
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(p._id)}>
                          Eliminar
                        </button>
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
              <h2>{editingPersonal ? 'Editar Personal' : 'Nuevo Personal'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>DNI *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    required
                    maxLength="8"
                  />
                </div>

                <div className="form-group">
                  <label>Cargo *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Agencia *</label>
                <select
                  className="form-control"
                  value={formData.agencia}
                  onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                  required
                >
                  <option value="">Seleccione...</option>
                  {agencias.map((a) => (
                    <option key={a._id} value={a._id}>{a.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    style={{ marginRight: '8px' }}
                  />
                  Personal Activo
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPersonal ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personal;
