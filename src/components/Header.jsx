import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import logo from '../assets/images/RifasElWino.jpeg';

function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="logo-link">
          <img src={logo} alt="Rifas El Wino Logo" className="logo" />
          <h1>Rifas El Wino</h1>
        </Link>

        <div className="header-nav">
          <Link to="/pagos" className="payment-button">
            {/* Separamos el ícono y el texto en spans para controlarlos mejor */}
            <span className="payment-icon">💳</span>
            <span className="payment-text">Métodos de Pago</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;