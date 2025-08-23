import React, { useState, useEffect } from 'react';
import Homepage from './components/homepage';
import Login from './components/Loginpage';
import { isUserAuthenticated, logoutUser } from './services/userService';
import { logger } from './utils/logger';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si el usuario está autenticado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = isUserAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Manejador para el login exitoso (tradicional)
  const handleLogin = async (email: string, password: string) => {
    try {
      logger.logInfo('Login exitoso en App.tsx, estableciendo autenticación...');
      // El servicio ya maneja la validación y almacenamiento del token
      setIsAuthenticated(true);
      logger.logInfo('Estado de autenticación establecido a true');
    } catch (error) {
      logger.logError('Error en login:', error);
      setIsAuthenticated(false);
    }
  };

  // Manejador específico para login con Google
  const handleGoogleLogin = async (email: string) => {
    try {
      logger.logInfo('Login exitoso con Google en App.tsx, estableciendo autenticación...');
      // Para Google, el token ya está guardado en localStorage por handleGoogleLogin
      // Solo necesitamos actualizar el estado de autenticación
      setIsAuthenticated(true);
      logger.logInfo('Estado de autenticación establecido a true para Google');
    } catch (error) {
      logger.logError('Error en login con Google:', error);
      setIsAuthenticated(false);
    }
  };

  // Manejador para cerrar sesión
  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
  };

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  logger.logDebug('Estado actual de autenticación:', isAuthenticated);

  return (
    <div className="App">
      {isAuthenticated ? (
        <Homepage onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} />
      )}
    </div>
  );
}

export default App;
