import React from 'react';
import './PrizeGallery.css';

const images = [
  '/images/camioneta-1.jpeg',
  '/images/camioneta-2.jpeg',
  '/images/camioneta-3.jpeg',
  '/images/camioneta-4.jpeg',
  '/images/camioneta-5.jpeg',
];

function PrizeGallery() {
  return (
    <div className="gallery-section">
      <h2>Conoce a la Palomita</h2>
      <div className="gallery-grid">
        {images.map((src, index) => (
          <div key={index} className="gallery-item">
            <img src={src} alt={`Camioneta - Vista ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrizeGallery;