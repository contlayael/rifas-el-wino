import React from 'react';
import './InfoSection.css';

function InfoSection() {
  return (
    <div className="info-section">
      <div className="info-container">
        <h3 className="date-highlight">
          📆 ¡Se va este 15 de Septiembre con base a L.N. Tris Clásico! 🥇
        </h3>

        <ul className="bonus-list">
          <li>
            <p>
              <span>💰🎁 30mil de Regalo</span> Si adquieres 30 boletos y resultas ganador.
            </p>
          </li>
          <li>
            <p>
              <span>💰🎁 10mil de Regalo</span> Al compartir nuestras publicaciones en modo público (solo si ganas).
            </p>
          </li>
          <li>
            <p><span>😮‍💨 Placas a tu Nombre</span> Nos encargamos del trámite.</p>
          </li>
          <li>
            <p><span>⛽️ Tanque Lleno</span> Recíbela lista para la aventura.</p>
          </li>
        </ul>

        <p className="final-message">🍀 ¡Mucho ánimo y suerte a todos! 🍀</p>
      </div>
    </div>
  );
}

export default InfoSection;