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

const Bajas = () => {
  const [bajas, setBajas] = useState([]);
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    activo: '',
    fechaBaja: new Date().toISOString().split('T')[0],
    motivo: 'Obsolescencia',
    descripcion: '',
    responsableAutoriza: '',
    documentoRespaldo: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bajasRes, activosRes] = await Promise.all([
        api.get('/bajas'),
        api.get('/activos')
      ]);
      setBajas(bajasRes.data);
      setActivos(activosRes.data.filter(a => a.estado !== 'De Baja'));
    } catch (error) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

 const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Mostrar estado de carga
      Swal.fire({
        title: 'Procesando Baja...',
        text: 'Actualizando estado del activo en el sistema',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // 2. Ejecutar la petición al backend
      await api.post('/bajas', formData);

      // 3. Cerrar el cargando y el modal
      Swal.close();
      loadData();
      closeModal();

      // 4. Notificación de éxito elegante
      Toast.fire({
        icon: 'success',
        title: 'Activo dado de baja correctamente'
      });

    } catch (error) {
      // Cerramos el loading si hubo error
      Swal.close();
      
      // 5. Alerta de error visual
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar baja',
        text: error.response?.data?.error || 'No se pudo completar la operación',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Reintentar'
      });
    }
  };

const handleDelete = async (id) => {
    // 1. Confirmación con advertencia visual
    const result = await Swal.fire({
      title: '¿Anular esta baja?',
      text: "Al eliminar este registro, se revertirá el estado del activo. ¿Deseas continuar?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Rojo para acción de eliminar
      cancelButtonColor: '#3085d6', // Azul para cancelar
      confirmButtonText: 'Sí, eliminar registro',
      cancelButtonText: 'Cancelar'
    });

    // 2. Si el usuario confirma la acción
    if (result.isConfirmed) {
      try {
        // Mostrar un pequeño cargando mientras se procesa
        Swal.fire({
          title: 'Procesando...',
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); }
        });

        await api.delete(`/bajas/${id}`);
        
        // Cerramos el cargando
        Swal.close();

        // 3. Notificación Toast de éxito
        Toast.fire({
          icon: 'success',
          title: 'Registro de baja eliminado'
        });

        loadData();
      } catch (error) {
        // Cerrar cargando en caso de error
        Swal.close();

        // 4. Alerta de error detallada
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: error.response?.data?.error || 'No se pudo eliminar el registro de baja',
          confirmButtonColor: '#d33'
        });
      }
    }
  };

  const openModal = () => {
    setFormData({
      activo: '',
      fechaBaja: new Date().toISOString().split('T')[0],
      motivo: 'Obsolescencia',
      descripcion: '',
      responsableAutoriza: '',
      documentoRespaldo: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError('');
  };

  if (loading) {
    return <div className="loading">Cargando bajas...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Bajas de Activos</h1>
        <button className="btn btn-primary" onClick={openModal}>
          + Registrar Baja
        </button>
      </div>

      <div className="card">
        {bajas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>No hay bajas registradas</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fecha Baja</th>
                  <th>Activo</th>
                  <th>Código</th>
                  <th>Motivo</th>
                  <th>Descripción</th>
                  <th>Responsable</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {bajas.map((baja) => (
                  <tr key={baja._id}>
                    <td>
                      {new Date(baja.fechaBaja).toLocaleDateString('es-PE', {
                        timeZone: 'UTC'
                      })}
                    </td>                    
                    <td>
                      <strong>{baja.activo?.nombre}</strong>
                      <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                        {baja.activo?.tipo}
                      </div>
                    </td>
                    <td>{baja.activo?.codigo}</td>
                    <td>
                      <span className="badge badge-danger">{baja.motivo}</span>
                    </td>
                    <td>{baja.descripcion}</td>
                    <td>{baja.responsableAutoriza}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(baja._id)}
                        >
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
              <h2>Registrar Baja de Activo</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Activo *</label>
                <select
                  className="form-control"
                  value={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.value })}
                  required
                >
                  <option value="">Seleccione un activo...</option>
                  {activos.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.codigo} - {a.nombre} ({a.tipo})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Fecha de Baja *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.fechaBaja}
                    onChange={(e) => setFormData({ ...formData, fechaBaja: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Motivo *</label>
                  <select
                    className="form-control"
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    required
                  >
                    <option value="Obsolescencia">Obsolescencia</option>
                    <option value="Daño Irreparable">Daño Irreparable</option>
                    <option value="Robo">Robo</option>
                    <option value="Pérdida">Pérdida</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Descripción *</label>
                <textarea
                  className="form-control"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows="3"
                  required
                  placeholder="Describa detalladamente el motivo de la baja..."
                />
              </div>

              <div className="form-group">
                <label>Responsable que Autoriza *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.responsableAutoriza}
                  onChange={(e) => setFormData({ ...formData, responsableAutoriza: e.target.value })}
                  required
                  placeholder="Nombre completo del responsable"
                />
              </div>

              <div className="form-group">
                <label>Documento de Respaldo</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.documentoRespaldo}
                  onChange={(e) => setFormData({ ...formData, documentoRespaldo: e.target.value })}
                  placeholder="Número de documento o referencia"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-danger">
                  Registrar Baja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bajas;
