import React from 'react';
import '../layouts/initialview.css';

//función reutilizable para el manejo de la vista pricipal
const InitialView: React.FC = () => {
  return (
    <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Encuentra tu vehículo perfecto
            </h1>
            <p className="hero-subtitle">
              Miles de vehículos usados y nuevos en un solo lugar.
              Compra, vende o alquila con confianza.
            </p>
            <div className="hero-actions">
              <button className="btn-primary btn-large">Buscar Vehículos</button>
              <button className="btn-outline btn-large">Vender mi Auto</button>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop"
              alt="Vehículos destacados"
            />
          </div>
        </div>
      </section>
  );
};

export default InitialView;
