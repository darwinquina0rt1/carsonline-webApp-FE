import React from 'react';
import '../layouts/homepage.css';

const Homepage: React.FC = () => {
  const featuredVehicles = [
    {
      id: 1,
      name: 'Toyota Camry 2024',
      price: '$25,000',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
      year: '2024',
      mileage: '15,000 km'
    },
    {
      id: 2,
      name: 'Honda Civic Sport',
      price: '$22,500',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      year: '2023',
      mileage: '8,500 km'
    },
    {
      id: 3,
      name: 'BMW X3 xDrive30i',
      price: '$45,000',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
      year: '2024',
      mileage: '12,000 km'
    },
    {
      id: 4,
      name: 'Mercedes-Benz C-Class',
      price: '$38,000',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop',
      year: '2023',
      mileage: '18,000 km'
    }
  ];

  return (
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
                <option value="10000">$10,000</option>
                <option value="20000">$20,000</option>
                <option value="30000">$30,000</option>
                <option value="50000">$50,000</option>
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
                <li>📞 (123) 456-7890</li>
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
  );
};

export default Homepage;
