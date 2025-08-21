import React from 'react';
import '../layouts/header.css';

const HeaderContainer: React.FC = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>CarOnline</h1>
        </div>
        <nav className="nav">
          <a href="#inicio" className="nav-link">Inicio</a>
          <a href="#vehiculos" className="nav-link">Vehículos</a>
          <a href="#servicios" className="nav-link">Servicios</a>
          <a href="#contacto" className="nav-link">Contacto</a>
        </nav>
        <div className="header-actions">
          <button className="btn-secondary">Iniciar Sesión</button>
          <button className="btn-primary">Registrarse</button>
        </div>
      </div>
    </header>
  );
};

export default HeaderContainer;
