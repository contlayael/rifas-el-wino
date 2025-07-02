import React from 'react';
import './Legend.css';

function Legend() {
  return (
    <div className="legend-container">
      <div className="legend-item">
        <div className="legend-color-box available"></div>
        <span>Disponible</span>
      </div>
      <div className="legend-item">
        <div className="legend-color-box pending"></div>
        <span>Apartado (24h)</span>
      </div>
      <div className="legend-item">
        <div className="legend-color-box sold"></div>
        <span>Vendido</span>
      </div>
    </div>
  );
}

export default Legend;