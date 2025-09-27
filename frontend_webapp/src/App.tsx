import { useEffect, useRef, useState } from 'react';
import Homepage from './components/homepage';
import Login from './components/Loginpage';
import { logoutUser } from './services/userService'; // asegúrate que borra access_token
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const logoutTimerRef = useRef<number | null>(null);

  const getToken = () => localStorage.getItem('access_token');

  const parseJwt = (token: string): { exp?: number; mfa?: boolean } | null => {
    try {
      const [, b64] = token.split('.');
      const json = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const isTokenValid = (token: string): boolean => {
    const p = parseJwt(token);
    if (!p?.exp) return false;
    
    const notExpired = p.exp * 1000 > Date.now();
    const hasMfa = p.mfa === true;
    
    // Si no hay MFA en el token, asumir que está OK (MFA simulado)
    return notExpired && (hasMfa || p.mfa === undefined);
  };

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const scheduleAutoLogoutFromToken = (token: string) => {
    clearLogoutTimer();
    const p = parseJwt(token);
    if (!p?.exp) return;
    const msLeft = p.exp * 1000 - Date.now();


    logoutTimerRef.current = window.setTimeout(() => {
      logoutUser();            // borra access_token
      setIsAuthenticated(false);
      if (!location.pathname.includes('/login')) location.replace('/login');
    }, Math.max(msLeft, 0));
  };

  const recheckAuth = (): boolean => {
    const token = getToken();

    if (token && isTokenValid(token)) {
      setIsAuthenticated(true);
      scheduleAutoLogoutFromToken(token);
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
      if (e.key === 'access_token') recheckAuth();
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
        <Login onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} />
      )}
    </div>
  );
}

export default App;
