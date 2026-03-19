import React from 'react';
import './CartaDeCargo.css';

const CartaDeCargo = ({ asignacion, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay no-print" onClick={onClose}>
      <div className="carta-container" onClick={(e) => e.stopPropagation()}>
        <div className="carta-actions no-print">
          <button className="btn btn-primary" onClick={handlePrint}>
            🖨️ Imprimir
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="carta-content">
          <div className="carta-header">
            <div className="logo-carta">TM</div>
            <div className="carta-title">
              <h1>TRANSPORTES MOQUEGUA</h1>
              <h2>CARTA DE CARGO DE ACTIVOS</h2>
            </div>
          </div>

          <div className="carta-info">
            <p><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-PE')}</p>
            <p><strong>Fecha de Asignación:</strong> {new Date(asignacion.fechaAsignacion).toLocaleDateString('es-PE')}</p>
          </div>

          <div className="carta-section">
            <h3>DATOS DEL RESPONSABLE</h3>
            <table className="carta-table">
              <tbody>
                <tr>
                  <td className="label">Nombre Completo:</td>
                  <td>{asignacion.personal?.nombre} {asignacion.personal?.apellido}</td>
                </tr>
                <tr>
                  <td className="label">DNI:</td>
                  <td>{asignacion.personal?.dni}</td>
                </tr>
                <tr>
                  <td className="label">Cargo:</td>
                  <td>{asignacion.personal?.cargo}</td>
                </tr>
                <tr>
                  <td className="label">Agencia:</td>
                  <td>{asignacion.personal?.agencia?.nombre}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="carta-section">
            <h3>DETALLE DEL ACTIVO ASIGNADO</h3>
            <table className="carta-table">
              <tbody>
                <tr>
                  <td className="label">Código:</td>
                  <td>{asignacion.activo?.codigo}</td>
                </tr>
                <tr>
                  <td className="label">Nombre:</td>
                  <td>{asignacion.activo?.nombre}</td>
                </tr>
                <tr>
                  <td className="label">Tipo:</td>
                  <td>{asignacion.activo?.tipo}</td>
                </tr>
                <tr>
                  <td className="label">Marca:</td>
                  <td>{asignacion.activo?.marca || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="label">Modelo:</td>
                  <td>{asignacion.activo?.modelo || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="label">Serie:</td>
                  <td>{asignacion.activo?.serie || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {asignacion.observaciones && (
            <div className="carta-section">
              <h3>OBSERVACIONES</h3>
              <p>{asignacion.observaciones}</p>
            </div>
          )}

          <div className="carta-declaration">
            <p>
              Yo, <strong>{asignacion.personal?.nombre} {asignacion.personal?.apellido}</strong>, identificado(a) con DNI N° <strong>{asignacion.personal?.dni}</strong>,
              declaro haber recibido en perfectas condiciones el activo descrito anteriormente y me comprometo a:
            </p>
            <ul>
              <li>Utilizar el activo únicamente para fines laborales autorizados por la empresa.</li>
              <li>Mantener el activo en buen estado de conservación y funcionamiento.</li>
              <li>Reportar inmediatamente cualquier daño, pérdida o mal funcionamiento.</li>
              <li>Devolver el activo cuando la empresa lo requiera o al finalizar mi relación laboral.</li>
              <li>Asumir la responsabilidad por el uso indebido o extravío del activo asignado.</li>
            </ul>
          </div>

          <div className="carta-signatures">
            <div className="signature-box">
              <div className="signature-line"></div>
              <p><strong>{asignacion.personal?.nombre} {asignacion.personal?.apellido}</strong></p>
              <p>DNI: {asignacion.personal?.dni}</p>
              <p>Firma del Responsable</p>
            </div>

            <div className="signature-box">
              <div className="signature-line"></div>
              <p><strong>Jefe de Área</strong></p>
              <p>Transportes Moquegua</p>
              <p>Firma y Sello</p>
            </div>
          </div>

          <div className="carta-footer">
            <p>Este documento es de carácter obligatorio y debe ser firmado por ambas partes.</p>
            <p>Generado electrónicamente por el Sistema de Control de Activos - Transportes Moquegua</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartaDeCargo;
