import React, { useEffect, useState } from 'react';
import { getGoogleConfig } from '../../config/google-config';
import { buildApiUrl, API_CONFIG } from '../../config/api';

// Tipos para la autenticación de Google
interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface GoogleAuthResponse {
  success: boolean;
  user?: GoogleUser;
  error?: string;
}

// Declaración global para Google Identity Services
declare global {
  interface Window {
    google: any;
  }
}

// Hook personalizado para Google Auth con la nueva API
export const useGoogleAuth = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar el SDK de Google Identity Services
  useEffect(() => {
    const loadGoogleSDK = () => {
      // Verificar si ya está cargado
      if (window.google) {
        setIsLoaded(true);
        return;
      }

      // Crear script para cargar Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsLoaded(true);
      };
      script.onerror = () => {
        console.error('Error cargando Google Identity Services');
      };
      document.head.appendChild(script);
    };

    loadGoogleSDK();
  }, []);

  // Función para iniciar sesión con Google usando la nueva API
  const signInWithGoogle = async (): Promise<GoogleAuthResponse> => {
    if (!isLoaded || !window.google) {
      return { success: false, error: 'Google Identity Services no está cargado' };
    }

    setIsLoading(true);

    return new Promise((resolve) => {
      const config = getGoogleConfig();
      
      // Crear el botón de Google One Tap
      const googleButton = window.google.accounts.id.initialize({
        client_id: config.CLIENT_ID,
        callback: (response: any) => {
          if (response.credential) {
            // Decodificar el JWT token
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            
            const user: GoogleUser = {
              id: payload.sub,
              name: payload.name,
              email: payload.email,
              picture: payload.picture
            };

            setIsSignedIn(true);
            setCurrentUser(user);
            resolve({ success: true, user });
          } else {
            resolve({ success: false, error: 'No se pudo obtener las credenciales' });
          }
          setIsLoading(false);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Mostrar el prompt de selección de cuenta
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Si no se puede mostrar el prompt, usar el método alternativo
          window.google.accounts.oauth2.initTokenClient({
            client_id: config.CLIENT_ID,
            scope: config.SCOPES,
            callback: (response: any) => {
              if (response.access_token) {
                // Obtener información del usuario usando el token
                fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
                  .then(res => res.json())
                  .then(userData => {
                    const user: GoogleUser = {
                      id: userData.id,
                      name: userData.name,
                      email: userData.email,
                      picture: userData.picture
                    };
                    setIsSignedIn(true);
                    setCurrentUser(user);
                    resolve({ success: true, user });
                  })
                  .catch(error => {
                    console.error('Error obteniendo datos del usuario:', error);
                    resolve({ success: false, error: 'Error obteniendo datos del usuario' });
                  });
              } else {
                resolve({ success: false, error: 'No se pudo obtener el token de acceso' });
              }
              setIsLoading(false);
            },
          }).requestAccessToken();
        }
      });
    });
  };

  // Función para cerrar sesión
  const signOut = async (): Promise<void> => {
    if (!isLoaded || !window.google) return;

    try {
      window.google.accounts.id.disableAutoSelect();
      setIsSignedIn(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Función para obtener el token de acceso
  const getAccessToken = async (): Promise<string | null> => {
    if (!isLoaded || !isSignedIn) return null;
    
    // Con la nueva API, necesitarías implementar esto de manera diferente
    // Por ahora retornamos null
    return null;
  };

  return {
    isLoaded,
    isSignedIn,
    currentUser,
    isLoading,
    signInWithGoogle,
    signOut,
    getAccessToken
  };
};

// Componente principal de Google Auth
interface GoogleAuthProps {
  onLoginSuccess?: (user: GoogleUser) => void;
  onLoginError?: (error: string) => void;
  onLogout?: () => void;
  children?: React.ReactNode;
}

export const GoogleAuthProvider: React.FC<GoogleAuthProps> = ({
  onLoginSuccess,
  onLoginError,
  onLogout,
  children
}) => {
  const { isLoaded, isSignedIn, currentUser, isLoading, signInWithGoogle, signOut } = useGoogleAuth();

  const handleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.success && result.user) {
      onLoginSuccess?.(result.user);
    } else {
      onLoginError?.(result.error || 'Error desconocido');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onLogout?.();
  };

  return (
    <div className="google-auth-provider">
      {children}
      {isLoaded && (
        <div className="google-auth-status">
          {isSignedIn ? (
            <div className="google-user-info">
              <img 
                src={currentUser?.picture} 
                alt={currentUser?.name} 
                className="google-user-avatar"
              />
              <span className="google-user-name">{currentUser?.name}</span>
              <button onClick={handleSignOut} className="google-signout-button">
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <button 
              onClick={handleSignIn} 
              disabled={isLoading}
              className="google-signin-button"
            >
              {isLoading ? 'Conectando...' : 'Iniciar Sesión con Google'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Función para manejar el login desde el botón del formulario
export const handleGoogleLogin = async (): Promise<GoogleAuthResponse> => {
  return new Promise((resolve) => {
    const loadGoogleSDK = () => {
      if (window.google) {
        // Si ya está cargado, proceder con el login
        performGoogleLogin(resolve);
        return;
      }

      // Crear script para cargar Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        performGoogleLogin(resolve);
      };
      script.onerror = () => {
        console.error('Error cargando Google Identity Services');
        resolve({ success: false, error: 'Error cargando Google Identity Services' });
      };
      document.head.appendChild(script);
    };

    const performGoogleLogin = async (resolve: (value: GoogleAuthResponse) => void) => {
      const config = getGoogleConfig();
      
      // Usar directamente el método OAuth2 que funciona mejor
      window.google.accounts.oauth2.initTokenClient({
        client_id: config.CLIENT_ID,
        scope: config.SCOPES,
        callback: async (response: any) => {
          if (response.access_token) {
            try {
              // Obtener información del usuario usando el token
              const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`);
              const userData = await userInfoResponse.json();
              
              // Preparar datos para enviar al backend (formato exacto que espera tu backend)
              const googleData = {
                googleId: userData.id.toString(), // Asegurar que sea string
                email: userData.email,
                name: userData.name,
                givenName: userData.given_name || userData.name.split(' ')[0],
                familyName: userData.family_name || userData.name.split(' ').slice(1).join(' '),
                picture: userData.picture,
                accessToken: response.access_token
              };


              // Enviar datos al backend
              const backendResponse = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.GOOGLE_LOGIN), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(googleData)
              });

              const backendData = await backendResponse.json();
              
              if (backendData.success) {
                // Usar el servicio JWT para guardar el token (el backend ya envía con 1 minuto)
                const { saveToken } = await import('../../services/jwtService');
                saveToken(backendData.data.token);
                localStorage.setItem('user', JSON.stringify(backendData.data.user));
                
                const user: GoogleUser = {
                  id: userData.id,
                  name: userData.name,
                  email: userData.email,
                  picture: userData.picture
                };

                resolve({ success: true, user });
              } else {
                console.error('Error en backend:', backendData.message);
                resolve({ success: false, error: backendData.message });
              }
            } catch (error) {
              console.error('Error obteniendo datos del usuario:', error);
              resolve({ success: false, error: 'Error obteniendo datos del usuario' });
            }
          } else {
            resolve({ success: false, error: 'No se pudo obtener el token de acceso' });
          }
        },
      }).requestAccessToken();
    };

    loadGoogleSDK();
  });
};

export default GoogleAuthProvider;
