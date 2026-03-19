import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ActaDeRepotenciacion from '../components/Reportes/ActaDeRepotenciacion';

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

const Activos = () => {
  const [activos, setActivos] = useState([]);
  const [agencias, setAgencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRepotenciarModal, setShowRepotenciarModal] = useState(false);
  const [editingActivo, setEditingActivo] = useState(null);
  const [selectedCpu, setSelectedCpu] = useState(null);
  const [componentesDisponibles, setComponentesDisponibles] = useState([]);
  const [selectedComponente, setSelectedComponente] = useState('');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ estado: '', tipo: '', agencia: '', clase: '' });
  // Cerca de tus otros estados (línea 10 aprox.)
  const [showReporteModal, setShowReporteModal] = useState(false);
  const [dataActa, setDataActa] = useState(null);

  // Cambia tipo: 'EQUIPO' por tipo: 'CPU'
  const [formData, setFormData] = useState({
    codigo: '', nombre: '', tipo: 'CPU', clase: 'EQUIPO',
    marca: '', modelo: '', serie: '', estado: 'Disponible',
    fechaAdquisicion: new Date().toISOString().split('T')[0],
    valorAdquisicion: 0, agencia: '', observaciones: ''
  });
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [activosRes, agenciasRes] = await Promise.all([
        api.get('/activos'),
        api.get('/agencias')
      ]);
      setActivos(activosRes.data);
      setAgencias(agenciasRes.data);
    } catch (error) {
      setError('Error al cargar datos');
    } finally { setLoading(false); }
  };

  const openRepotenciar = (cpu) => {
    setSelectedCpu(cpu);
    const disponibles = activos.filter(a => a.clase === 'COMPONENTE' && a.estado === 'Disponible');
    setComponentesDisponibles(disponibles);
    setShowRepotenciarModal(true);
  };

  const handleRepotenciarSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/repotenciacion', { 
        cpuId: selectedCpu._id, 
        componenteId: selectedComponente 
      });
      
      // --- CAMBIO AQUÍ: Alerta de éxito con icono ---
      Swal.fire({
        icon: 'success',
        title: '¡Equipo Repotenciado!',
        text: 'La mejora se registró correctamente en Tacna',
        confirmButtonColor: '#28a745'
      });

      setShowRepotenciarModal(false);
      loadData();
    } catch (err) { 
      // --- CAMBIO AQUÍ: Alerta de error ---
      Swal.fire({
        icon: 'error',
        title: 'Error al procesar',
        text: 'No se pudo completar la repotenciación',
        confirmButtonColor: '#dc3545'
      });    
    }
  };

const handleVerActaRepotenciacion = async (activo) => {
  let actaData = null;

  try {
    // INTENTO 1: Buscar registro oficial
    const response = await api.get(`/repotenciacion/detalle/${activo._id}`);
    const data = response.data;

    actaData = {
      numeroActa: String(data.numeroActa).padStart(3, '0') + '-2026',
      fecha: new Date(data.createdAt),
      cpu: {
        nombre: data.cpu.nombre,
        marca: data.cpu.marca,
        modelo: data.cpu.modelo,
        serie: data.cpu.serie,
        codigo: data.cpu.codigo
      },
      componentes: data.componentes.map((c, i) => ({
        _id: c._id || i,
        nombre: c.nombre, 
        marca: c.marca,
        modelo: c.modelo,
        serie: c.serie
      })),
      // PASAMOS EL HISTORIAL COMPLETO DEL ACTIVO
      historialTexto: activo.observaciones || '', 
      usuarioAsignado: data.usuarioAsignado,
      tipoFirma: data.tipoFirma
    };

  } catch (error) {
    console.warn("Modo fallback activo");
    
    const partes = activo.observaciones ? activo.observaciones.split('🚀') : [''];
    const mejorasTexto = partes.slice(1);

    if (mejorasTexto.length === 0) {
      alert("Este equipo no tiene historial de repotenciación registrado.");
      return;
    }

    actaData = {
      numeroActa: "S/N (LEGACY)",
      fecha: new Date(),
      cpu: {
        nombre: activo.nombre,
        marca: activo.marca,
        modelo: activo.modelo,
        serie: activo.serie,
        codigo: activo.codigo
      },
      componentes: mejorasTexto.map((texto, i) => ({
        _id: i,
        nombre: "Componente (Histórico)",
        marca: texto.trim(),
        modelo: "-",
        serie: "-"
      })),
      historialTexto: activo.observaciones || '', // También aquí para el fallback
      usuarioAsignado: activo.personalAsignado,
      tipoFirma: activo.personalAsignado ? 'USUARIO' : 'SOPORTE'
    };
  }

  setDataActa(actaData);
  setShowReporteModal(true);
};

  const getEstadoBadge = (estado) => {
    const badges = { 'Disponible': 'badge-success', 'Asignado': 'badge-warning', 'De Baja': 'badge-danger', 'Instalado': 'badge-info' };
    return badges[estado] || 'badge-secondary';
  };

  const openModal = (activo = null) => {
  if (activo) {
    setEditingActivo(activo);
    // IMPORTANTE: Mapear cada campo individualmente para que el formulario los reconozca
    setFormData({
      codigo: activo.codigo || '',
      nombre: activo.nombre || '',
      clase: activo.clase || 'EQUIPO',
      tipo: activo.tipo || 'CPU', // Asegúrate que el backend use este valor
      marca: activo.marca || '',
      modelo: activo.modelo || '',
      serie: activo.serie || '',
      estado: activo.estado || 'Disponible',
      agencia: activo.agencia?._id || '', // Cargamos el ID de la agencia
      fechaAdquisicion: activo.fechaAdquisicion?.split('T')[0] || new Date().toISOString().split('T')[0],
      valorAdquisicion: activo.valorAdquisicion || 0,
      observaciones: activo.observaciones || ''
    });
  } else {
    // Reset para nuevo registro
    setEditingActivo(null);
    setFormData({
      codigo: '', nombre: '', tipo: 'CPU', clase: 'EQUIPO', 
      marca: '', modelo: '', serie: '', estado: 'Disponible',
      fechaAdquisicion: new Date().toISOString().split('T')[0],
      valorAdquisicion: 0, agencia: '', observaciones: ''
    });
  }
  setShowModal(true);
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Limpieza de datos antes de enviar para evitar el Error 400
    const dataToSend = { 
      ...formData, 
      // Si no hay agencia seleccionada, enviamos null en lugar de string vacío
      agencia: formData.agencia || null,
      // Aseguramos que el tipo sea válido para el backend
      tipo: formData.clase === 'COMPONENTE' ? 'RAM' : (formData.tipo || 'CPU')
    };

    if (editingActivo) {
      // Usamos el ID del activo que estamos editando
      await api.put(`/activos/${editingActivo._id}`, dataToSend);
      
      // --- CAMBIO: SweetAlert2 Toast ---
      Toast.fire({
        icon: 'success',
        title: '¡Actualizado con éxito!'
      });

    } else {
      await api.post('/activos', dataToSend);
      
      // --- CAMBIO: SweetAlert2 Toast ---
      Toast.fire({
        icon: 'success',
        title: '¡Creado con éxito!'
      });
    }
    
    loadData(); // Recarga la lista en Tacna
    setShowModal(false);
  } catch (error) {
    // Mantenemos el log para depuración técnica
    console.error("Detalle del error:", error.response?.data);

    // --- CAMBIO: SweetAlert2 para Errores ---
    Swal.fire({
      icon: 'error',
      title: 'Error al guardar',
      text: error.response?.data?.message || "Verifique los campos obligatorios o el código duplicado",
      confirmButtonColor: '#d33', // Rojo para errores
      confirmButtonText: 'Entendido'
    });
  }
};

const handleDelete = async (id) => {
    // 1. Preguntar con diseño moderno
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "El activo se eliminará permanentemente del sistema.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Rojo
      cancelButtonColor: '#3085d6', // Azul
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    // 2. Si confirma, ejecutar la lógica de borrado
    if (result.isConfirmed) {
      try {
        await api.delete(`/activos/${id}`);
        
        // Notificación de éxito rápida (Toast)
        Toast.fire({
          icon: 'success',
          title: 'Eliminado correctamente'
        });

        loadData(); // Recarga la tabla en Tacna
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el activo', 'error');
      }
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>Gestión Técnica de Activos</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nuevo Registro</button>
      </div>

      <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select value={filters.clase} onChange={(e) => setFilters({ ...filters, clase: e.target.value })}>
            <option value="">Todas las Clases</option>
            <option value="EQUIPO">EQUIPOS</option>
            <option value="COMPONENTE">COMPONENTES</option>
          </select>
          {filters.clase !== 'COMPONENTE' && (
            <select value={filters.tipo} onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}>
              <option value="">Todos los Tipos</option>
              <option value="CPU">CPU</option>
              <option value="MONITOR">MONITOR</option>
              <option value="IMPRESORA">IMPRESORA</option>
              <option value="OTRO">OTRO</option>
            </select>
          )}
          <select value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })}>
            <option value="">Todos los Estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Asignado">Asignado</option>
            <option value="De Baja">De Baja</option>
          </select>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th style={{ width: '150px' }}>Código / Registro</th>
              <th>Equipo / Espec. Técnicas</th>
              <th>Historial de Mejoras</th>
              <th>Estado</th>
              <th>Ubicación / Asignación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
  {activos
    .filter(a => (!filters.clase || a.clase === filters.clase) && (!filters.estado || a.estado === filters.estado) && (!filters.tipo || a.tipo === filters.tipo))
    .map((activo) => {
      // Mantenemos tu lógica original de procesamiento de texto
      const partes = activo.observaciones ? activo.observaciones.split('🚀') : [''];
      const inicial = partes[0];
      const mejoras = partes.slice(1);

      return (
        <tr key={activo._id}>
          {/* COLUMNA 1: CÓDIGO (Igual a la tuya) */}
          <td style={{ padding: '12px' }}>
            <strong style={{ fontSize: '16px', display: 'block', marginBottom: '4px' }}>{activo.codigo}</strong>
            <small style={{ color: '#777', fontSize: '12px' }}>
              📅 Reg: {new Date(activo.createdAt).toLocaleDateString('es-PE')}
            </small>
          </td>
          
          {/* COLUMNA 2: EQUIPO (Igual a la tuya) */}
          <td style={{ padding: '12px' }}>
            <strong style={{ fontSize: '16px', color: '#333' }}>{activo.nombre}</strong> 
            {activo.clase === 'EQUIPO' && <span style={{ fontSize: '13px', color: '#666' }}> ({activo.tipo})</span>}
            <div style={{ color: '#444', fontSize: '13.5px', margin: '5px 0', fontWeight: '500' }}>
              {activo.marca || 'S/M'} — {activo.modelo || 'S/M'} — {activo.serie || 'S/S'}
            </div>
            <div style={{ fontSize: '12px', color: '#888', borderLeft: '3px solid #eee', paddingLeft: '8px' }}>
              {inicial}
            </div>
          </td>

          {/* COLUMNA 3: HISTORIAL (Mejorada con validación de tipo) */}
          <td>
            {activo.tipo === 'CPU' ? (
              mejoras.length > 0 ? (
                mejoras.map((m, i) => (
                  <div key={i} style={{ fontSize: '11px', color: '#0056b3', marginBottom: '2px' }}>🚀 {m}</div>
                ))
              ) : <span style={{ color: '#ccc', fontSize: '12px' }}>Sin mejoras</span>
            ) : <span style={{ color: '#ccc', fontSize: '12px' }}>No corresponde</span>}
          </td>

          {/* COLUMNA 4: ESTADO (Igual a la tuya) */}
          <td style={{ textAlign: 'center' }}>
            <span className={`badge ${getEstadoBadge(activo.estado)}`} style={{ fontSize: '12px', padding: '5px 10px' }}>
              {activo.estado}
            </span>
          </td>

          <td style={{ padding: '12px', minWidth: '180px' }}>
          <div style={{ lineHeight: '1.4' }}>
            {/* Agencia / Ubicación Física */}
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2c3e50' }}>
              📍 {activo.agencia?.nombre || 'Almacén Central'}
            </div>
            
            {/* Datos de Asignación (Solo si está asignado) */}
            {activo.estado === 'Asignado' && (
              <div style={{ marginTop: '4px' }}>
                <span style={{ fontSize: '14px', color: '#333', display: 'block', fontWeight: '500' }}>
                  👤 {activo.personalAsignado?.nombre || 'Personal'} {activo.personalAsignado?.apellido || ''}
                </span>
                {/* Restauramos la fecha de asignación aquí */}
                <small style={{ color: '#28a745', fontSize: '12px', fontWeight: 'bold' }}>
                  🗓️ Asig: {new Date(activo.updatedAt).toLocaleDateString('es-PE')}
                </small>
              </div>
            )}
            
            {/* Detalle para equipos instalados dentro de otros */}
            {activo.estado === 'Instalado' && (
              <div style={{ fontSize: '13px', color: '#17a2b8', marginTop: '4px' }}>
                📦 En: <strong>{activo.equipoPadre?.codigo || 'Equipo Principal'}</strong>
              </div>
            )}
          </div>
</td>

          {/* COLUMNA 6: ACCIONES (Protección del botón Cohete) */}
          <td style={{ padding: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn-sm btn-primary" onClick={() => openModal(activo)}>✏️</button>
              
              {/* Solo CPU puede repotenciarse */}
              {activo.tipo === 'CPU' && activo.estado !== 'De Baja' && (
                <button className="btn-sm btn-warning" onClick={() => openRepotenciar(activo)}>🚀</button>
              )}
              
              {/* Solo CPU muestra el acta si tiene mejoras */}
              {activo.tipo === 'CPU' && mejoras.length > 0 && (
                <button className="btn-sm btn-success" onClick={() => handleVerActaRepotenciacion(activo)}>📄</button>
              )}
              
              {/* Reemplaza tu línea anterior por esta */}
              <button className="btn-sm btn-danger" onClick={() => handleDelete(activo._id)}>🗑️</button>
            </div>
          </td>
        </tr>
      );
    })}
</tbody>
        </table>
      </div>

      {/* MODAL REPOTENCIAR */}
      {showRepotenciarModal && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth: '450px'}}>
            <h2>🚀 Repotenciar: {selectedCpu?.codigo}</h2>
            <form onSubmit={handleRepotenciarSubmit}>
              <select className="form-control" value={selectedComponente} onChange={e => setSelectedComponente(e.target.value)} required>
                <option value="">-- Seleccionar RAM o Disco --</option>
                {componentesDisponibles.map(c => <option key={c._id} value={c._id}>{c.nombre} ({c.serie})</option>)}
              </select>
              <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>Confirmar</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRepotenciarModal(false)}>Cerrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showReporteModal && dataActa && (
        <ActaDeRepotenciacion 
        acta={dataActa} 
        onClose={() => setShowReporteModal(false)} 
        />
      )}
      {/* MODAL REGISTRO */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth: '600px'}}>
            <h2>{editingActivo ? 'Editar Activo' : 'Nuevo Activo'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <div className="form-group"><label>Código</label><input className="form-control" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} required /></div>
                <div className="form-group">
                  <label>Clase</label>
                  <select className="form-control" value={formData.clase} onChange={e => setFormData({...formData, clase: e.target.value})}>
                    <option value="EQUIPO">EQUIPO</option>
                    <option value="COMPONENTE">COMPONENTE</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Nombre</label><input className="form-control" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required /></div>
              
              {formData.clase === 'EQUIPO' && (
                <div className="form-group">
                  <label>Tipo de Equipo</label>
                  <select className="form-control" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                    <option value="CPU">CPU</option>
                    <option value="MONITOR">MONITOR</option>
                    <option value="IMPRESORA">IMPRESORA</option>
                    <option value="OTRO">OTRO</option>
                  </select>
                </div>
              )}

              {/* REEMPLAZA TU DIV DE MARCA/MODELO/SERIE POR ESTE: */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '10px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>Marca</label>
                  <input 
                    className="form-control" 
                    placeholder="Ej: HP, Dell..." 
                    value={formData.marca || ''} 
                    onChange={e => setFormData({...formData, marca: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>Modelo</label>
                  <input 
                    className="form-control" 
                    placeholder="Ej: ProDesk 600..." 
                    value={formData.modelo || ''} 
                    onChange={e => setFormData({...formData, modelo: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>Serie</label>
                  <input 
                    className="form-control" 
                    placeholder="S/N" 
                    value={formData.serie || ''} 
                    onChange={e => setFormData({...formData, serie: e.target.value})} 
                  />
                </div>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px'}}>
                <select className="form-control" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}>
                  <option value="Disponible">Disponible</option>
                  <option value="Asignado">Asignado</option>
                  <option value="De Baja">De Baja</option>
                </select>
                <select className="form-control" value={formData.agencia} onChange={e => setFormData({...formData, agencia: e.target.value})}>
                  <option value="">Almacén</option>
                  {agencias.map(a => <option key={a._id} value={a._id}>{a.nombre}</option>)}
                </select>
              </div>

              <div className="form-group" style={{marginTop: '10px'}}><label>Specs Iniciales</label><textarea className="form-control" value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} /></div>
              
              <div style={{marginTop: '20px', textAlign: 'right'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{marginLeft: '10px'}}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activos;