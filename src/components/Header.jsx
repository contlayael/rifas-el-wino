import React from 'react';
import logo from '../assets/images/RifasElWino.jpeg';
import './Header.css';

function Header() {
  return (
    <header className="app-header">
      <img src={logo} alt="Rifas El Wino Logo" className="logo" />
      <h1>Rifas "El Wino"</h1>
    </header>
  );
}

export default Header;