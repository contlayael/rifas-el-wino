import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import logo from '../assets/images/RifasElWino.jpeg';

// Este componente decide si el enlace de "Boletos" es un ancla o un link a la home
const BoletosLink = () => {
  const location = useLocation();

  if (location.pathname === '/') {
    // Si ya estamos en la home, el link es un ancla que hace scroll
    return <a href="#boletos" className="nav-link">Boletos Disponibles</a>;
  }
  
  // Si estamos en otra página, nos lleva a la home y al ancla
  return <Link to="/#boletos" className="nav-link">Boletos Disponibles</Link>;
};

function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        
        {/* --- COLUMNA IZQUIERDA --- */}
        <div className="nav-left">
          <Link to="/pagos" className="nav-link">
            Métodos de Pago
          </Link>
        </div>

        {/* --- COLUMNA CENTRAL (LOGO) --- */}
        <div className="nav-center">
          <Link to="/" className="logo-link-center">
            <img src={logo} alt="Rifas El Wino Logo" className="logo" />
          </Link>
        </div>

        {/* --- COLUMNA DERECHA --- */}
        <div className="nav-right">
          <BoletosLink />
        </div>

      </div>
    </header>
  );
}

export default Header;