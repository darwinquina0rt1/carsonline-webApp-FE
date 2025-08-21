import React from 'react';
import '../layouts/footer.css';

const FooterContainer: React.FC = () => {
  return (
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
  );
};

export default FooterContainer;
