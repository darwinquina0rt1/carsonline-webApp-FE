// Configuración para Google OAuth
export const GOOGLE_CONFIG = {
  // Client ID desde variables de entorno
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'TU_GOOGLE_CLIENT_ID_AQUI',
  
  // Client Secret desde variables de entorno
  CLIENT_SECRET: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  
  // Redirect URI desde variables de entorno
  REDIRECT_URI: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback',
  
  // Scopes que necesitamos
  SCOPES: 'email profile',
  
  // URLs autorizadas (después de configurar en Google Cloud Console)
  AUTHORIZED_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:5173', // Vite default
    'https://tu-dominio.com' // Tu dominio de producción
  ]
};

// Función para inicializar la configuración
export const initializeGoogleConfig = (clientId: string) => {
  GOOGLE_CONFIG.CLIENT_ID = clientId;
};

// Función para obtener la configuración
export const getGoogleConfig = () => {
  // Verificar si las variables de entorno están configuradas
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    console.warn('⚠️ VITE_GOOGLE_CLIENT_ID no está configurado en el archivo .env');
  }
  
  if (!import.meta.env.VITE_GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️ VITE_GOOGLE_CLIENT_SECRET no está configurado en el archivo .env');
  }
  
  if (!import.meta.env.VITE_GOOGLE_REDIRECT_URI) {
    console.warn('⚠️ VITE_GOOGLE_REDIRECT_URI no está configurado en el archivo .env');
  }
  
  return GOOGLE_CONFIG;
};
