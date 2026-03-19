import React from 'react';
import './CartaDeCargo.css'; // Reutiliza los estilos profesionales

const ActaDeDevolucion = ({ asignacion, onClose }) => {
  const handlePrint = () => window.print();

  if (!asignacion) return null;

  // Fecha de devolución formateada (prioriza la del backend, sino usa la actual)
  const fechaDoc = asignacion.fechaDevolucion 
    ? new Date(asignacion.fechaDevolucion).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="acta-modal-overlay">
      <div className="acta-wrapper">
        <div className="acta-actions no-print">
          <button className="btn-print" onClick={handlePrint}>🖨️ Imprimir Acta de Devolución</button>
          <button className="btn-close" onClick={onClose}>Cerrar Vista</button>
        </div>

        <div className="acta-paper">
          <header className="acta-header">
            <div className="header-top">
               <div className="empresa-logo">Transportes Moquegua</div>             
            </div>
            <h1>ACTA DE DEVOLUCIÓN COD: {String(asignacion.numeroActa || 0).padStart(3, '0')}-2026</h1>
          </header>

          <section className="acta-meta">
            <p><strong>FECHA DE DEVOLUCIÓN:</strong> {fechaDoc?.toUpperCase()}</p>
            <p>
              <strong>LUGAR:</strong> {
                asignacion.activos && asignacion.activos.length > 0 && asignacion.activos[0].agencia
                  ? `${asignacion.activos[0].agencia.nombre.toUpperCase()} / ${asignacion.activos[0].agencia.direccion.toUpperCase()}`
                  : "TACNA / SEDE CENTRAL" 
              }
            </p>
          </section>

          <section className="acta-section">
            <h3 className="section-title">1. DATOS DEL PERSONAL QUE DEVUELVE</h3>
            <table className="tabla-format">
              <tbody>
                <tr>
                  <td width="50%"><strong>Nombre:</strong> {asignacion.personal?.nombre} {asignacion.personal?.apellido}</td>
                  <td width="50%"><strong>DNI:</strong> {asignacion.personal?.dni || '___________'}</td>
                </tr>
                <tr>
                  <td><strong>Cargo:</strong> {asignacion.personal?.cargo || 'Personal'}</td>
                  <td><strong>Área:</strong> Operaciones / Tacna</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="acta-section">
          <h3 className="section-title">2. DESCRIPCIÓN DE LOS EQUIPOS DEVUELTOS</h3>
          <table className="tabla-format">
            <thead>
              <tr>
                <th width="10%">Item</th>
                <th width="60%">Equipos (Marca/Modelo/Serie)</th>
                <th width="30%">Estado al Recibir</th>
              </tr>
            </thead>
            <tbody>
              {/* MAPEO PARA MÚLTIPLES ACTIVOS */}
              {asignacion.activos && asignacion.activos.map((activo, index) => {
                
                // BUSCAMOS LA OBSERVACIÓN ESPECÍFICA DE ESTE EQUIPO
                const detalleIndividual = asignacion.detallesDevolucion?.find(d => 
                  (d.activoId?._id || d.activoId) === activo._id
                );

                return (
                  <tr key={activo._id}>
                    <td align="center">{String(index + 1).padStart(2, '0')}</td>
                    <td>
                      <strong>{activo.nombre}</strong><br />
                      {activo.marca} {activo.modelo} <br />
                      <small>Serie: {activo.serie || 'N/A'}</small>
                      {activo.observaciones && (
                        <div style={{ marginTop: '5px', fontSize: '0.85em', borderTop: '1px solid #eee', paddingTop: '2px' }}>
                          <strong>Características:</strong> {activo.observaciones}
                        </div>
                      )}
                    </td>
                    <td align="center">
                      {/* CAMBIO AQUÍ: Si existe detalle individual lo pone, si no, usa el general o 'OPERATIVO' */}
                      {detalleIndividual ? detalleIndividual.observacion : (asignacion.observacionesDevolucion || 'OPERATIVO')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

          <section className="acta-section">
            <h3 className="section-title">3. CONFORMIDAD DE RECEPCIÓN</h3>
            <div className="estado-box">
              <p>Por la presente, el área de <strong>Informática y Sistemas</strong> de Transportes Moquegua hace constar que recibe los equipos detallados anteriormente.</p>
              <p>El estado físico y funcional ha sido verificado al momento de la devolución, quedando los activos bajo custodia nuevamente de la empresa para su posterior reasignación o mantenimiento.</p>
            </div>
          </section>

          <section className="acta-section signatures">
            <div className="sig-container">
              <div className="sig-box">
                <div className="sig-line"></div>
                <p><strong>DEVUELTO POR (FIRMA)</strong></p>
                <p>{asignacion.personal?.nombre} {asignacion.personal?.apellido}</p>
                <p>DNI: {asignacion.personal?.dni || '___________'}</p>
              </div>
              <div className="sig-box">
                <div className="sig-line"></div>
                <p><strong>RECIBIDO POR (SISTEMAS)</strong></p>
                <p>Nombre: David Aduviri Feliciano</p>
                <p>DNI: 40888372</p>
              </div>
            </div>
          </section>

          <footer className="acta-footer">
            <p>Documento emitido por Informática - Tacna.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ActaDeDevolucion;