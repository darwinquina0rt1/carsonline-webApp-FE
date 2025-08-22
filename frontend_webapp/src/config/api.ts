// Configuración de la API
export const API_CONFIG = {
  // URL base de la API
  BASE_URL: import.meta.env.VITE_API_URL ?? "http://localhost:3005/api",
  
  // Endpoints de autenticación
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    VERIFY_TOKEN: "/auth/verify",
  },
  
  // Endpoints de usuarios
  USERS: {
    PROFILE: "/users/profile",
    UPDATE: "/users/update",
  },
  
  // Endpoints de vehículos
  VEHICLES: {
    LIST: "/vehicles",
    DETAIL: "/vehicles/:id",
    CREATE: "/vehicles",
    UPDATE: "/vehicles/:id",
    DELETE: "/vehicles/:id",
  },
  
  // Configuración de headers por defecto
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
  
  // Timeout para las peticiones (en milisegundos)
  TIMEOUT: 10000,
};

// Función para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Función para obtener el token de autenticación
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Función para establecer el token de autenticación
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Función para eliminar el token de autenticación
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};
