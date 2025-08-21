import React from 'react';
import '../layouts/services.css';

const ServicesContainer: React.FC = () => {
  return (
    <section className="services-section">
      <div className="container">
        <div className="section-header">
          <h2>Nuestros Servicios</h2>
          <p>Todo lo que necesitas para tu vehículo</p>
        </div>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">🚗</div>
            <h3>Compra de Vehículos</h3>
            <p>Encuentra el vehículo perfecto con nuestras opciones de financiamiento flexibles.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">💰</div>
            <h3>Venta de Vehículos</h3>
            <p>Vende tu vehículo de forma rápida y segura con nuestra plataforma.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">🔧</div>
            <h3>Servicios Mecánicos</h3>
            <p>Mantenimiento y reparación con técnicos certificados y garantía.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">📋</div>
            <h3>Evaluaciones</h3>
            <p>Evaluaciones profesionales para conocer el estado real de tu vehículo.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesContainer;
