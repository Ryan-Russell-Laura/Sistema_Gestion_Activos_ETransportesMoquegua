import React from 'react';
import './CartaDeCargo.css';

const ActaDeEntrega = ({ asignacion, onClose }) => {
  const handlePrint = () => window.print();

  if (!asignacion) return null;

  return (
    <div className="acta-modal-overlay">
      <div className="acta-wrapper">
        <div className="acta-actions no-print">
          <button className="btn-print" onClick={handlePrint}>🖨️ Imprimir Acta</button>
          <button className="btn-close" onClick={onClose}>Cerrar Vista</button>
        </div>

        <div className="acta-paper">
          <header className="acta-header">
            <div className="header-top">
               <div className="empresa-logo">Transportes Moquegua</div>               
            </div>
            <h1>ACTA DE ENTREGA COD: {String(asignacion.numeroActa || 0).padStart(3, '0')}-2026</h1>
          </header>
          <section className="acta-meta">
            <p><strong>FECHA:</strong> {new Date(asignacion.fechaAsignacion).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}</p>
            <p>
            <strong>LUGAR:</strong> {
              asignacion.activos && asignacion.activos.length > 0 && asignacion.activos[0].agencia
                ? `${asignacion.activos[0].agencia.nombre.toUpperCase()} / ${asignacion.activos[0].agencia.direccion.toUpperCase()}`
                : "TACNA / SEDE CENTRAL" 
            }
          </p>
          </section>

         <section className="acta-section">
            <h3 className="section-title">1. DATOS GENERALES</h3>
            <table className="tabla-format">
              <thead>
                <tr>
                  <th width="50%">Información del Emisor</th>
                  <th width="50%">Información del Receptor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <p><strong>Empresa:</strong> Transportes Moquegua Turismo S.R.L.</p>
                    <p><strong>Área:</strong> Informática y Sistemas</p>
                    <p><strong>Responsable:</strong> David Aduviri Feliciano</p>
                  </td>
                  <td>
                    <p><strong>Nombre:</strong> {asignacion.personal?.nombre} {asignacion.personal?.apellido}</p>
                    <p><strong>DNI / ID:</strong> {asignacion.personal?.dni || '__________'}</p>
                    <p><strong>Cargo:</strong> {asignacion.personal?.cargo || 'Soporte'}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="acta-section">
            <h3 className="section-title">2. DESCRIPCIÓN DE LOS EQUIPOS</h3>
            <table className="acta-table">
              <thead>
                <tr>
                  <th style={{width: '30px'}}>N°</th>
                  <th>EQUIPO</th>
                  <th>MARCA / MODELO / SERIE</th>
                  <th>CARACTERÍSTICAS TÉCNICAS</th>
                  <th style={{width: '50px'}}>CANT.</th>
                  <th style={{width: '50px'}}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {asignacion.activos && asignacion.activos.map((activo, index) => (
                  <tr key={activo._id}>
                    <td style={{textAlign: 'center'}}>{index + 1}</td>
                    <td><strong>{activo.nombre}</strong></td>
                    <td>
                      {activo.marca} {activo.modelo} <br />
                      <small>Serie: {activo.serie || 'S/S'}</small>
                    </td>
                    <td style={{fontSize: '10px', fontStyle: 'italic'}}>
                      {activo.observaciones || '---'}
                    </td>
                    <td style={{textAlign: 'center'}}>01</td>
                    <td style={{textAlign: 'center'}}>Operativo</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="acta-section">
            <h3 className="section-title">3. ESTADO DEL BIEN</h3>
            <div className="estado-box">
              <p>El receptor declara que recibe el equipo en las siguientes condiciones:</p>
              <ul>
                <li><strong>Estado Físico:</strong> OPERATIVO</li>
                <li><strong>Funcionamiento:</strong> Verificado por el usuario al 100%</li>
              </ul>
            </div>
          </section>

          <section className="acta-section">
            <h3 className="section-title">4. COMPROMISOS Y RESPONSABILIDADES</h3>
            <div className="estado-box">
              <p>Al firmar el documento el receptor acepta que:</p>
              <ul>
                <li>1. El equipo es propiedad exclusiva de Transportes Moquegua Turismo SRL. y se entrega para el uso estrictamente laboral</li>
                <li>2. Es responsable del cuidado, custodia y buen uso del equipo y sus accesorios.</li>
                <li>3. En caso de pérdida, robo o daño por negligencia se aplicarán las políticas de la empresa (reposición o descuento por planilla)</li>
                <li>4. Queda prohibida la instalación de software sin licencia o la manipulación técnica del hardware por personal ajeno a la empresa.</li>              </ul>
            </div>
          </section>

          <section className="acta-section signatures">
            <div className="sig-container">
              <div className="sig-box">
                <div className="sig-line"></div>
                <p><strong>ENTREGADO POR (FIRMA)</strong></p>
                <p>Nombre: David Aduviri Feliciano</p>
                <p>DNI: 40888372</p>
              </div>
              <div className="sig-box">
                <div className="sig-line"></div>
                <p><strong>RECIBIDO POR (FIRMA)</strong></p>
                <p>Nombre: {asignacion.personal?.nombre} {asignacion.personal?.apellido}</p>
                <p>DNI: {asignacion.personal?.dni || '___________'}</p>
              </div>
            </div>
          </section>
          
          <footer className="acta-footer">
            <p>Documento emitido por el área de Informática</p>
          </footer>

        </div>
      </div>
    </div>
  );
};

export default ActaDeEntrega;