import React from 'react';
import './Legend.css';

function Legend() {
  return (
    <div className="legend-container">
      <div className="legend-item">
        {/* Usamos la clase 'ticket' para que tome el estilo base del boleto */}
        <div className="legend-color-box ticket available">
          00001
        </div>
        <span>Disponible</span>
      </div>
      <div className="legend-item">
        <div className="legend-color-box ticket pending">
          00001
        </div>
        <span>Apartado (24h)</span>
      </div>
      <div className="legend-item">
        <div className="legend-color-box ticket sold">
          00001
        </div>
        <span>Vendido</span>
      </div>
    </div>
  );
}

export default Legend;