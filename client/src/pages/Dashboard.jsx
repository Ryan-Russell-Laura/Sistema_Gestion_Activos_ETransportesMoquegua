import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalActivos: 0,
    disponibles: 0,
    asignados: 0,
    bajas: 0,
    totalPersonal: 0,
    totalAgencias: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [activos, personal, agencias] = await Promise.all([
        api.get('/activos'),
        api.get('/personal'),
        api.get('/agencias')
      ]);

      const activosData = activos.data;
      setStats({
        totalActivos: activosData.length,
        disponibles: activosData.filter(a => a.estado === 'Disponible').length,
        asignados: activosData.filter(a => a.estado === 'Asignado').length,
        bajas: activosData.filter(a => a.estado === 'De Baja').length,
        totalPersonal: personal.data.filter(p => p.activo).length,
        totalAgencias: agencias.data.length
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando estadísticas...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px', color: '#2c3e50' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.9 }}>Total Activos</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>{stats.totalActivos}</p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.9 }}>Disponibles</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>{stats.disponibles}</p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.9 }}>Asignados</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>{stats.asignados}</p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.9 }}>De Baja</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>{stats.bajas}</p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.9 }}>Personal Activo</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>{stats.totalPersonal}</p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.9 }}>Agencias</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>{stats.totalAgencias}</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Bienvenido al Sistema de Control de Activos</h2>
        <p style={{ color: '#7f8c8d', lineHeight: '1.6' }}>
          Este sistema le permite gestionar de manera eficiente todos los activos de Transportes Moquegua,
          incluyendo su asignación al personal, seguimiento de ubicaciones y control de bajas.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
