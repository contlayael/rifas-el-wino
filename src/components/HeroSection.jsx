import React from 'react';
import './HeroSection.css';

function HeroSection() {
  return (
    <div className="hero-container">
      <video className="hero-video" autoPlay loop muted playsInline>
        <source src="/videos/video-principal.mp4" type="video/mp4" />
        Tu navegador no soporta el video.
      </video>
      <div className="hero-overlay"></div>
      <div className="hero-text">
        <h1>¡La Palomita se va!</h1>
        <h2>Chevrolet 2011 por solo $10 pesos</h2>
      </div>
    </div>
  );
}

export default HeroSection;