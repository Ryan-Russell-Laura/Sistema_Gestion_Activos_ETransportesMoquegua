import React from 'react';
import './CartaDeCargo.css'; 

const ActaDeRepotenciacion = ({ acta, onClose }) => {
  const handlePrint = () => window.print();
  if (!acta) return null;

  const fechaFormateada = new Date(acta.fecha).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric'
  }).toUpperCase();

  // Procesamos la Sección 2: Historial rompiendo por el cohete 🚀
  const historialArray = acta.historialTexto 
    ? acta.historialTexto.split('🚀').filter(item => item.trim() !== "") 
    : [];

  return (
    <div className="acta-modal-overlay">
      <div className="acta-wrapper">
        <div className="acta-actions no-print">
          <button className="btn-print" onClick={handlePrint}>🖨️ Imprimir Acta A4</button>
          <button className="btn-close" onClick={onClose}>Cerrar Vista</button>
        </div>

        <div className="acta-paper">
          <header className="acta-header">
            <div className="header-top">
               <div className="empresa-logo">Transportes Moquegua</div>             
            </div>
            <h1>ACTA DE REPOTENCIACIÓN N° {acta.numeroActa}</h1>
          </header>

          <section className="acta-meta">
            <p><strong>FECHA:</strong> {fechaFormateada}</p>
            <p><strong>LUGAR:</strong> TACNA / TALLER DE SISTEMAS</p>
          </section>

          {/* SECCIÓN 1: EQUIPO */}
          <section className="acta-section">
            <h3 className="section-title">1. EQUIPO INTERVENIDO (PRINCIPAL)</h3>
            <table className="tabla-format" style={{width: '100%'}}>
              <tbody>
                <tr>
                  <td width="30%"><strong>EQUIPO:</strong></td>
                  <td>{acta.cpu.nombre}</td>
                </tr>
                <tr>
                  <td><strong>MARCA / MODELO / SERIE:</strong></td>
                  <td>{acta.cpu.marca} / {acta.cpu.modelo} / {acta.cpu.serie}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* SECCIÓN 2: HISTORIAL DE MEJORAS */}
          <section className="acta-section">
            <h3 className="section-title">2. HISTORIAL DE MEJORAS EN EL EQUIPO</h3>
            <table className="tabla-format" style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{background: '#f0f0f0'}}>
                  <th style={{padding: '5px', border: '1px solid #000', width: '60px'}}>ITEM</th>
                  <th style={{padding: '5px', border: '1px solid #000'}}>FECHA / DESCRIPCIÓN DE MEJORA PREVIA</th>
                </tr>
              </thead>
              <tbody>
                {historialArray.map((hist, i) => (
                  <tr key={i}>
                    <td style={{textAlign: 'center', border: '1px solid #000'}}>{i + 1}</td>
                    <td style={{padding: '5px', border: '1px solid #000', fontSize: '11px'}}>{hist.trim()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* SECCIÓN 3: INSTALACIONES NUEVAS */}
          <section className="acta-section" style={{marginTop: '20px'}}>
            <h3 className="section-title">3. DETALLE DE MEJORAS E INSTALACIONES NUEVAS</h3>
            <table className="tabla-format" style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{background: '#f0f0f0', textAlign: 'center'}}>
                  <th style={{padding: '8px', border: '1px solid #000'}}>ITEM</th>
                  <th style={{padding: '8px', border: '1px solid #000'}}>COMPONENTE</th>
                  <th style={{padding: '8px', border: '1px solid #000'}}>MARCA / MODELO / SERIE</th>
                  <th style={{padding: '8px', border: '1px solid #000'}}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {acta.componentes.map((comp, index) => (
                  <tr key={comp._id}>
                    <td style={{textAlign: 'center', padding: '8px', border: '1px solid #000'}}>{index + 1}</td>
                    <td style={{padding: '8px', border: '1px solid #000'}}><strong>{comp.nombre}</strong></td>
                    <td style={{padding: '8px', border: '1px solid #000'}}>
                      {comp.marca} / {comp.modelo} <br/> 
                      <small>S/N: {comp.serie}</small>
                    </td>
                    <td style={{textAlign: 'center', padding: '8px', border: '1px solid #000', color: 'green', fontSize: '10px'}}>
                      <strong>INSTALACIÓN NUEVA</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          {/* 3. CONFORMIDAD */}
          <section className="acta-section">
             <h3 className="section-title">3. CONFORMIDAD TÉCNICA</h3>
             <div className="estado-box" style={{padding: '10px', background: '#f9f9f9', border: '1px solid #ddd'}}>
                <p>El componente detallado ha sido instalado correctamente en el equipo principal. Se ha verificado su funcionamiento y compatibilidad, quedando operativo para las labores designadas en la sede <strong>TACNA</strong>.</p>
             </div>
          </section>

          {/* 4. FIRMAS */}
          <section className="acta-section signatures" style={{marginTop: '60px'}}>
            <div className="sig-container" style={{display: 'flex', justifyContent: 'space-around'}}>
              
              {/* FIRMA SOPORTE */}
              <div className="sig-box" style={{textAlign: 'center', borderTop: '1px solid #000', width: '200px', paddingTop: '10px'}}>
                <p><strong>REALIZADO POR (SISTEMAS)</strong></p>
                <p>David Aduviri Feliciano</p>
                <p>Soporte Informático</p>
              </div>

              {/* FIRMA USUARIO / GERENCIA */}
              <div className="sig-box" style={{textAlign: 'center', borderTop: '1px solid #000', width: '200px', paddingTop: '10px'}}>
                <p><strong>CONFORMIDAD / V°B°</strong></p>
                {acta.tipoFirma === 'SOPORTE_GERENCIA' ? (
                  <>
                    <p>GERENCIA / ADMINISTRACIÓN</p>
                    <p style={{fontSize: '10px'}}>(Autorización Stock)</p>
                  </>
                ) : (
                  <>
                    <p>{acta.usuarioAsignado?.nombre || 'USUARIO'}</p>
                    <p>USUARIO RESPONSABLE</p>
                  </>
                )}
              </div>

            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ActaDeRepotenciacion;