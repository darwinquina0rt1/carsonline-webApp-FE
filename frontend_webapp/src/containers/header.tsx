import React, { useState } from 'react';
import '../layouts/header.css';

interface HeaderContainerProps {
  onLogout: () => void;
}

const HeaderContainer: React.FC<HeaderContainerProps> = ({ onLogout }) => {
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    document.body.classList.toggle('dark-mode');
    setDark(!dark);
  };

  const handleLogout = () => {
    onLogout();
  };

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
          <button className="btn-theme-toggle" onClick={toggleTheme}>
            {dark ? '☀️ Claro' : '🌙 Oscuro'}
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderContainer;
