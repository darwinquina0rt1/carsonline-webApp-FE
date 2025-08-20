import React from 'react';

const Homepage: React.FC = () => {
  // Lista de vehículos destacados con precios en Quetzales (Q)
  const featuredVehicles = [
    {
      id: 1,
      name: 'Toyota Camry 2024',
      price: 'Q195,000', // Precio actualizado a Quetzales
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
      year: '2024',
      mileage: '15,000 km'
    },
    {
      id: 2,
      name: 'Honda Civic Sport',
      price: 'Q175,500', // Precio actualizado a Quetzales
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit-crop',
      year: '2023',
      mileage: '8,500 km'
    },
    {
      id: 3,
      name: 'BMW X3 xDrive30i',
      price: 'Q350,000', // Precio actualizado a Quetzales
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
      year: '2024',
      mileage: '12,000 km'
    },
    {
      id: 4,
      name: 'Mercedes-Benz C-Class',
      price: 'Q296,000', // Precio actualizado a Quetzales
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop',
      year: '2023',
      mileage: '18,000 km'
    }
  ];

  return (
    <>
      <style>{`
        /* Importación de una fuente para el diseño moderno */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        /* Reseteo y estilos generales */
        :root {
          --primary-color: #007bff;
          --primary-hover-color: #0056b3;
          --secondary-color: #6c757d;
          --secondary-hover-color: #5a6268;
          --light-bg-color: #f8f9fa;
          --dark-text-color: #212529;
          --light-text-color: #ffffff;
          --border-color: #e2e8f0;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          background-color: var(--light-bg-color);
          color: var(--dark-text-color);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Estilos para el encabezado */
        .homepage .header {
          background-color: #fff;
          padding: 1rem 0;
          border-bottom: 1px solid var(--border-color);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .homepage .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .homepage .logo h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-color);
        }

        .homepage .nav a {
          margin-left: 2rem;
          color: var(--dark-text-color);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .homepage .nav a:hover {
          color: var(--primary-color);
        }

        .homepage .header-actions .btn-secondary,
        .homepage .header-actions .btn-primary {
          margin-left: 0.5rem;
        }

        /* Estilos para los botones */
        .homepage .btn-primary, .homepage .btn-secondary, .homepage .btn-outline {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }

        .homepage .btn-primary {
          background-color: var(--primary-color);
          color: var(--light-text-color);
        }

        .homepage .btn-primary:hover {
          background-color: var(--primary-hover-color);
        }

        .homepage .btn-secondary {
          background-color: var(--secondary-color);
          color: var(--light-text-color);
        }

        .homepage .btn-secondary:hover {
          background-color: var(--secondary-hover-color);
        }

        .homepage .btn-outline {
          background-color: transparent;
          color: var(--primary-color);
          border: 2px solid var(--primary-color);
        }

        .homepage .btn-outline:hover {
          background-color: var(--primary-color);
          color: var(--light-text-color);
        }

        .homepage .btn-large {
          padding: 1rem 2rem;
          font-size: 1rem;
        }

        /* Estilos para la sección Hero */
        .homepage .hero {
          background-color: #f0f4f8;
          padding: 4rem 0;
          text-align: center;
        }

        .homepage .hero-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        @media (min-width: 768px) {
          .homepage .hero-container {
            flex-direction: row;
            text-align: left;
          }
        }

        .homepage .hero-content {
          flex: 1;
        }

        .homepage .hero-title {
          font-size: 3rem;
          font-weight: 700;
          color: var(--dark-text-color);
          margin-bottom: 1rem;
        }

        .homepage .hero-subtitle {
          font-size: 1.2rem;
          color: var(--secondary-color);
          margin-bottom: 2rem;
        }

        .homepage .hero-actions .btn-primary,
        .homepage .hero-actions .btn-outline {
          margin-right: 1rem;
        }

        .homepage .hero-image {
          flex: 1;
          text-align: center;
        }

        .homepage .hero-image img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        /* Estilos para la sección de búsqueda */
        .homepage .search-section {
          background-color: #fff;
          padding: 2rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .homepage .search-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .homepage .search-box {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background-color: #fff;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        @media (min-width: 768px) {
          .homepage .search-box {
            flex-direction: row;
            align-items: center;
          }
        }

        .homepage .search-input {
          flex: 1;
        }

        .homepage .search-input input,
        .homepage .search-input select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 1rem;
        }

        /* Secciones generales */
        .homepage .featured-section,
        .homepage .services-section {
          padding: 4rem 0;
        }

        .homepage .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .homepage .section-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .homepage .section-header p {
          font-size: 1.1rem;
          color: var(--secondary-color);
        }

        .homepage .vehicles-grid,
        .homepage .services-grid {
          display: grid;
          gap: 2rem;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }

        /* Estilos para las tarjetas de vehículos */
        .homepage .vehicle-card {
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.3s ease;
        }

        .homepage .vehicle-card:hover {
          transform: translateY(-5px);
        }

        .homepage .vehicle-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .homepage .vehicle-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .homepage .vehicle-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background-color: var(--primary-color);
          color: var(--light-text-color);
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .homepage .vehicle-info {
          padding: 1.5rem;
        }

        .homepage .vehicle-info h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .homepage .vehicle-details {
          display: flex;
          gap: 1rem;
          color: var(--secondary-color);
          font-size: 0.9rem;
        }

        .homepage .vehicle-price {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
        }

        .homepage .vehicle-price .price {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-color);
        }

        /* Estilos para las tarjetas de servicios */
        .homepage .service-card {
          background-color: #fff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
          transition: transform 0.3s ease;
        }

        .homepage .service-card:hover {
          transform: translateY(-5px);
        }

        .homepage .service-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .homepage .service-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .homepage .service-card p {
          color: var(--secondary-color);
        }

        /* Estilos para el pie de página */
        .homepage .footer {
          background-color: #343a40;
          color: #fff;
          padding: 3rem 0;
          font-size: 0.9rem;
        }

        .homepage .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #495057;
        }

        .homepage .footer-section h3,
        .homepage .footer-section h4 {
          font-weight: 600;
          margin-bottom: 1rem;
          color: #fff;
        }

        .homepage .footer-section ul {
          list-style: none;
        }

        .homepage .footer-section ul li {
          margin-bottom: 0.5rem;
        }

        .homepage .footer-section a {
          color: #adb5bd;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .homepage .footer-section a:hover {
          color: var(--primary-color);
        }

        .homepage .social-links a {
          font-size: 1.5rem;
          margin-right: 1rem;
        }

        .homepage .footer-bottom {
          text-align: center;
          margin-top: 2rem;
        }
      `}</style>
      <div className="homepage">
        {/* Header */}
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

        {/* Hero Section */}
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

        {/* Search Section */}
        <section className="search-section">
          <div className="search-container">
            <div className="search-box">
              <div className="search-input">
                <input type="text" placeholder="Marca, modelo o palabra clave" />
              </div>
              <div className="search-input">
                <select>
                  <option value="">Precio máximo</option>
                  {/* Opciones de precio en Quetzales */}
                  <option value="50000">Q50,000</option>
                  <option value="100000">Q100,000</option>
                  <option value="200000">Q200,000</option>
                  <option value="300000">Q300,000</option>
                </select>
              </div>
              <div className="search-input">
                <select>
                  <option value="">Año</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
              </div>
              <button className="btn-primary">Buscar</button>
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2>Vehículos Destacados</h2>
              <p>Los mejores vehículos seleccionados para ti</p>
            </div>
            <div className="vehicles-grid">
              {featuredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="vehicle-card">
                  <div className="vehicle-image">
                    <img src={vehicle.image} alt={vehicle.name} />
                    <div className="vehicle-badge">Destacado</div>
                  </div>
                  <div className="vehicle-info">
                    <h3>{vehicle.name}</h3>
                    <div className="vehicle-details">
                      <span>{vehicle.year}</span>
                      <span>{vehicle.mileage}</span>
                    </div>
                    <div className="vehicle-price">
                      {/* Muestra el precio con el símbolo de Quetzales */}
                      <span className="price">{vehicle.price}</span>
                      <button className="btn-outline">Ver Detalles</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="section-footer">
              <button className="btn-outline btn-large">Ver Todos los Vehículos</button>
            </div>
          </div>
        </section>

        {/* Services Section */}
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

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-section">
                <h3>CarOnline</h3>
                <p>Tu plataforma confiable para comprar, vender y gestionar vehículos.</p>
                <div className="social-links">
                  <a href="#" className="social-link">📘</a>
                  <a href="#" className="social-link">📷</a>
                  <a href="#" className="social-link">🐦</a>
                  <a href="#" className="social-link">💼</a>
                </div>
              </div>
              <div className="footer-section">
                <h4>Vehículos</h4>
                <ul>
                  <li><a href="#">Comprar</a></li>
                  <li><a href="#">Vender</a></li>
                  <li><a href="#">Alquilar</a></li>
                  <li><a href="#">Evaluar</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Servicios</h4>
                <ul>
                  <li><a href="#">Financiamiento</a></li>
                  <li><a href="#">Seguros</a></li>
                  <li><a href="#">Mantenimiento</a></li>
                  <li><a href="#">Asesoría</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Contacto</h4>
                <ul>
                  <li>� (123) 456-7890</li>
                  <li>📧 info@caronline.com</li>
                  <li>📍 Calle Principal 123</li>
                  <li>🕒 Lun-Vie 9:00-18:00</li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 CarOnline. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Homepage;