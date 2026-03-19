import React, { useState, useEffect } from 'react';
import api from '../services/api';
// Importación de los componentes de reportes
import ActaDeEntrega from '../components/Reportes/ActaDeEntrega'; 
import ActaDeDevolucion from '../components/Reportes/ActaDeDevolucion';

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

const Asignaciones = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [activos, setActivos] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [showReporteEntrega, setShowReporteEntrega] = useState(false);
  const [showReporteDevolucion, setShowReporteDevolucion] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState(null);

  const [error, setError] = useState('');
  const [filter, setFilter] = useState('true');
  
  // 1. Agrega un estado para manejar las observaciones por separado
  // ... otros estados
  const [showDevolverModal, setShowDevolverModal] = useState(false);
  const [asignacionParaDevolver, setAsignacionParaDevolver] = useState(null);
  const [obsPorEquipo, setObsPorEquipo] = useState({}); // Guardará { idActivo: "observación" }

  // 1. CAMBIO: activos ahora es un arreglo vacío []
  const [formData, setFormData] = useState({
    activos: [], 
    personal: '',
    observaciones: ''
  });

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [asignacionesRes, activosRes, personalRes] = await Promise.all([
        api.get(`/asignaciones?activa=${filter}`),
        api.get('/activos?estado=Disponible'),
        api.get('/personal')
      ]);
      
      const asignacionesOrdenadas = (asignacionesRes.data || []).sort((a, b) => {
        return (b.numeroActa || 0) - (a.numeroActa || 0); // Orden descendente para ver lo último arriba
      });

      setAsignaciones(asignacionesOrdenadas);
      setActivos(activosRes.data || []);
      // Quitamos el filtro .filter(p => p.activo) para permitir asignar a cualquiera si lo prefieres
      setPersonal(personalRes.data || []); 
      setError('');
    } catch (err) {
      console.error("Error en loadData:", err);
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.activos.length === 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'Faltan activos',
        text: 'Debes seleccionar al menos un activo para realizar la asignación.',
        confirmButtonColor: '#2e59d9'
      });
    }
    try {
      // 2. CAMBIO: Se envía el formData con la lista de activos al backend
      await api.post('/asignaciones', formData);
      // 3. Notificación de éxito elegante (Toast)
      Toast.fire({
        icon: 'success',
        title: '¡Asignación creada con éxito!'
      });
      loadData();
      closeModal();
    } catch (err) {
      // 4. Error visual detallado
      Swal.fire({
        icon: 'error',
        title: 'Error al asignar',
        text: err.response?.data?.error || 'No se pudo crear la asignación múltiple',
        confirmButtonColor: '#d33'
      });
    }
  };

const handleDevolver = (asig) => {
    // 1. Guardamos la asignación
    setAsignacionParaDevolver(asig);
    
    // 2. Preparamos estado inicial
    const inicial = {};
    asig.activos.forEach(activo => {
      inicial[activo._id] = 'OPERATIVO / BUENO';
    });
    
    setObsPorEquipo(inicial);

    // --- CAMBIO: Feedback visual al técnico ---
    Toast.fire({
      icon: 'info',
      title: 'Cargando equipos asignados',
      text: `Preparando recepción de ${asig.activos.length} activos`,
      timer: 1500
    });

    setShowDevolverModal(true); 
  };

  const openModal = () => {
    setFormData({
      activos: [], // Inicializa vacío
      personal: '',
      observaciones: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError('');
  };

  const imprimirEntrega = (asig) => {
    setSelectedAsignacion(asig);
    setShowReporteEntrega(true);
  };

  const imprimirDevolucion = (asig) => {
    setSelectedAsignacion(asig);
    setShowReporteDevolucion(true);
  };

const handleEliminarRegistro = async (id) => {
    // 1. Confirmación con diseño de advertencia
    const result = await Swal.fire({
      title: '¿Deseas quitar este registro?',
      text: "Esta acción eliminará la asignación definitivamente. ¡No podrás deshacerlo!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Rojo para peligro
      cancelButtonColor: '#3085d6', // Azul para cancelar
      confirmButtonText: 'Sí, eliminar registro',
      cancelButtonText: 'Cancelar'
    });

    // 2. Si el usuario confirma
    if (result.isConfirmed) {
      try {
        await api.delete(`/asignaciones/${id}`);
        
        // Filtramos el estado localmente
        setAsignaciones(prev => prev.filter(asig => asig._id !== id));

        // Notificación Toast de éxito
        Toast.fire({
          icon: 'success',
          title: 'Registro eliminado correctamente'
        });

      } catch (err) {
        // Alerta de error si algo falla en el servidor
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: err.response?.data?.error || 'No se pudo eliminar el registro de asignación',
          confirmButtonColor: '#d33'
        });
      }
    }
  };

const confirmarDevolucion = async () => {
  try {
    // 1. Mostrar mensaje de carga (para evitar clics repetidos)
    Swal.fire({
      title: 'Procesando Devolución...',
      text: 'Actualizando estados de activos y cerrando asignación',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // 2. Preparamos los datos (Tu lógica intacta)
    const detalles = asignacionParaDevolver.activos.map(activo => ({
      activoId: activo._id,
      observacion: obsPorEquipo[activo._id] || 'OPERATIVO / BUENO'
    }));

    const resumenGeneral = detalles.map(d => d.observacion).join(', ');

    // 3. Enviamos AMBOS campos al backend
    await api.put(`/asignaciones/${asignacionParaDevolver._id}/devolver`, { 
      detallesDevolucion: detalles,
      observacionesDevolucion: resumenGeneral
    });

    // 4. Cerramos carga y modal
    Swal.close();
    setShowDevolverModal(false);
    loadData();

    // 5. CAMBIO: Alerta de éxito con SweetAlert2
    Swal.fire({
      icon: 'success',
      title: '¡Procesado!',
      text: 'Devolución procesada correctamente en Tacna',
      confirmButtonColor: '#28a745',
      timer: 3000 // Se cierra solo en 3 segundos si no le dan click
    });

  } catch (err) {
    // Cerramos el loading si hay error
    Swal.close();
    console.error("Error al enviar datos:", err);

    // 6. CAMBIO: Alerta de error con SweetAlert2
    Swal.fire({
      icon: 'error',
      title: 'Error al procesar',
      text: err.response?.data?.error || 'No se pudo registrar la devolución',
      confirmButtonColor: '#d33'
    });
  }
};

  if (loading) return <div className="loading">Cargando datos del sistema...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Control de Asignaciones - Tacna</h1>
        <button className="btn btn-primary" onClick={openModal}>+ Nueva Asignación Múltiple</button>
      </div>

      {error && <div className="alert alert-error" style={{backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '5px', marginBottom: '20px'}}>{error}</div>}

      <div className="card" style={{ marginBottom: '20px' }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="form-control">
          <option value="true">Ver: Asignaciones Activas</option>
          <option value="false">Ver: Activos Devueltos</option>
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>N° Acta</th>
                <th>Equipos Asignados</th>
                <th>Responsable</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Reportes</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {asignaciones.map((asig) => (
                <tr key={asig._id}>
                  <td><strong>#{String(asig.numeroActa || 0).padStart(3, '0')}</strong></td>
                  <td>
                    {/* 3. CAMBIO: Mapeamos los activos para mostrar la lista en la tabla */}
                    {asig.activos && asig.activos.map((item, idx) => (
                      <div key={item._id} style={{ 
                        padding: '4px 0', 
                        borderBottom: idx !== asig.activos.length - 1 ? '1px solid #eee' : 'none' 
                      }}>
                        <strong>• {item.nombre}</strong> <small style={{color: '#666'}}>({item.codigo})</small>
                        {item.observaciones && (
                          <div style={{fontSize: '10px', color: '#007bff', fontStyle: 'italic'}}>⚙️ {item.observaciones}</div>
                        )}
                      </div>
                    ))}
                  </td>
                  <td>{asig.personal ? `${asig.personal.nombre} ${asig.personal.apellido}` : 'No asignado'}</td>
                  <td>
                    {asig.fechaAsignacion 
                      ? new Date(asig.fechaAsignacion).toLocaleDateString('es-PE', { timeZone: 'UTC' }) 
                      : '-'}
                  </td>
                  <td>
                    <span className={`badge ${asig.activa ? 'badge-success' : 'badge-info'}`}>
                      {asig.activa ? 'En Uso' : 'Devuelto'}
                    </span>
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '5px'}}>
                        <button className="btn btn-small" onClick={() => imprimirEntrega(asig)}>📦 Entrega</button>
                        {!asig.activa && <button className="btn btn-small btn-secondary" onClick={() => imprimirDevolucion(asig)}>🔙 Dev.</button>}
                    </div>
                  </td>
                  <td>
                    {asig.activa ? (                      
                      <button 
                        className="btn btn-small" 
                        style={{backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px'}}
                        onClick={() => handleDevolver(asig)}
                      >
                        🗑️ Devolver
                      </button>

                    ) : (
                      <button 
                        className="btn btn-small" 
                        style={{backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px'}}
                        onClick={() => handleEliminarRegistro(asig._id)}
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CON SELECCIÓN MÚLTIPLE */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{padding: '25px', minWidth: '450px'}}>
            <h2>Registrar Nueva Asignación</h2>
            <form onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label>Seleccionar Equipos (Presiona <strong>Ctrl</strong> para elegir varios)</label>
                <select 
                  required 
                  multiple 
                  className="form-control" 
                  style={{ height: '150px' }} 
                  value={formData.activos} 
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({...formData, activos: values});
                  }}
                >
                  {activos.map(a => (
                    <option key={a._id} value={a._id}>
                      [{a.codigo}] {a.nombre} - {a.marca}
                    </option>
                  ))}
                </select>
                <small className="text-muted">Equipos seleccionados: {formData.activos.length}</small>
              </div>

              <div className="form-group">
                <label>Personal Responsable</label>
                <select required className="form-control" value={formData.personal} onChange={(e) => setFormData({...formData, personal: e.target.value})}>
                  <option value="">Seleccione personal...</option>
                  {personal.map(p => <option key={p._id} value={p._id}>{p.nombre} {p.apellido}</option>)}
                </select>
              </div>

              <div className="modal-actions" style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Generar Acta Múltiple</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* REPORTES */}
      {showReporteEntrega && selectedAsignacion && (
        <ActaDeEntrega asignacion={selectedAsignacion} onClose={() => setShowReporteEntrega(false)} />
      )}
      {showReporteDevolucion && selectedAsignacion && (
        <ActaDeDevolucion asignacion={selectedAsignacion} onClose={() => setShowReporteDevolucion(false)} />
      )}
      {/* MODAL DE DEVOLUCIÓN INDIVIDUALIZADA */}
      {showDevolverModal && asignacionParaDevolver && (
        <div className="modal-overlay">
          <div className="modal" style={{padding: '25px', maxWidth: '600px', width: '90%'}}>
            <div style={{borderBottom: '2px solid #eee', marginBottom: '20px'}}>
              <h2>Devolución de Equipos - Acta #{String(asignacionParaDevolver.numeroActa).padStart(3, '0')}</h2>
              <p className="text-muted">Por favor, indique el estado individual de cada equipo recibido.</p>
            </div>

            <div style={{maxHeight: '400px', overflowY: 'auto', marginBottom: '20px'}}>
              {asignacionParaDevolver.activos.map((activo) => (
                <div key={activo._id} className="form-group" style={{
                  padding: '15px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '8px', 
                  marginBottom: '10px',
                  border: '1px solid #e2e8f0'
                }}>
                  <label style={{display: 'block', fontWeight: 'bold', marginBottom: '5px'}}>
                    📦 {activo.nombre} 
                    <span style={{fontSize: '12px', color: '#64748b', marginLeft: '10px'}}>
                      (S/N: {activo.serie || 'Sin serie'})
                    </span>
                  </label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="Ej: Operativo, pantalla rayada, teclado falla..."
                    value={obsPorEquipo[activo._id] || ''}
                    onChange={(e) => setObsPorEquipo({
                      ...obsPorEquipo,
                      [activo._id]: e.target.value
                    })}
                  />
                </div>
              ))}
            </div>

            <div className="modal-actions" style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
              <button className="btn btn-secondary" onClick={() => setShowDevolverModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={confirmarDevolucion}>
                Finalizar Devolución y Guardar Acta
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Asignaciones;