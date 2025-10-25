import { useEffect, useRef, useState } from 'react';
import Homepage from './components/homepage';
import Login from './components/Loginpage';
import { logoutUser } from './services/userService';
import { jwtService } from './services/jwtService';
import './App.css';
import DashboardML from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const logoutTimerRef = useRef<number | null>(null);

  // Usar el servicio JWT mejorado
  const isTokenValid = (): boolean => {
    return jwtService.isTokenValid();
  };

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const scheduleAutoLogoutFromToken = () => {
    clearLogoutTimer();
    
    logoutTimerRef.current = jwtService.scheduleAutoLogout(() => {
      logoutUser();
      setIsAuthenticated(false);
      if (!location.pathname.includes('/login')) location.replace('/login');
    });
  };

  const recheckAuth = (): boolean => {
    if (isTokenValid()) {
      setIsAuthenticated(true);
      scheduleAutoLogoutFromToken();
      return true;
    }

    clearLogoutTimer();
    logoutUser(); 
    setIsAuthenticated(false);
    return false;
  };

  useEffect(() => {
    recheckAuth();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        recheckAuth();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === 'token') recheckAuth();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogin = async () => {
    const isAuth = recheckAuth();
    if (isAuth) {
      setIsAuthenticated(true);
    } else {
      // Forzar verificación después de un breve delay
      setTimeout(() => {
        const isAuthDelayed = recheckAuth();
        if (isAuthDelayed) {
          setIsAuthenticated(true);
        }
      }, 100);
    }
  };

  const handleGoogleLogin = async () => {
    const isAuth = recheckAuth();
    if (isAuth) {
      setIsAuthenticated(true);
    } else {
      // Forzar verificación después de un breve delay
      setTimeout(() => {
        const isAuthDelayed = recheckAuth();
        if (isAuthDelayed) {
          setIsAuthenticated(true);
        }
      }, 100);
    }
  };

  const handleLogout = () => {
    clearLogoutTimer();
    logoutUser();
    setIsAuthenticated(false);
  };

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


  return (
    <div className="App">
      {isAuthenticated ? (
        <Homepage onLogout={handleLogout} />
      ) : (
        // <DashboardML></DashboardML>
        <Login onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} />
      )}
    </div>
  );
}

export default App;
