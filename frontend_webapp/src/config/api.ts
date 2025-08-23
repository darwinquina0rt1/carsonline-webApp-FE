// Configuración de la API del backend
export const API_CONFIG = {
  // URL base del backend
  BASE_URL: 'http://localhost:3005/api',
  
  // Endpoints de autenticación
  ENDPOINTS: {
    // Google OAuth
    GOOGLE_LOGIN: '/auth/google/login',
    GOOGLE_VERIFY: '/auth/google/verify',
    GOOGLE_HEALTH: '/auth/google/health',
    
    // Autenticación local
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    AUTH_HEALTH: '/auth/health',
    
    // Vehículos
    VEHICLES: '/vehicles',
    VEHICLES_BY_BRAND: '/vehicles/brand',
    BRANDS: '/brands',
    STATS: '/stats',
    
    // Health checks
    HEALTH: '/health'
  }
};

// Función para construir URLs completas
export const buildApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params) {
    const queryParams = new URLSearchParams(params);
    url += `?${queryParams.toString()}`;
  }
  
  return url;
};

// Función para hacer peticiones autenticadas
export const authenticatedFetch = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  return fetch(url, {
    ...options,
    headers
  });
};

// Función para manejar respuestas de la API
export const handleApiResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
  }
  
  return data;
};

// Función para obtener el usuario actual
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  return !!(token && user);
};

// Función para cerrar sesión
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Redirigir al login o página principal
  window.location.href = '/login';
};

// Función para obtener vehículos
export const fetchVehicles = async () => {
  const response = await authenticatedFetch(buildApiUrl(API_CONFIG.ENDPOINTS.VEHICLES));
  return handleApiResponse(response);
};

// Función para obtener vehículos por marca
export const fetchVehiclesByBrand = async (brand: string) => {
  const response = await authenticatedFetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.VEHICLES_BY_BRAND}/${brand}`));
  return handleApiResponse(response);
};

// Función para obtener marcas
export const fetchBrands = async () => {
  const response = await authenticatedFetch(buildApiUrl(API_CONFIG.ENDPOINTS.BRANDS));
  return handleApiResponse(response);
};

// Función para obtener estadísticas
export const fetchStats = async () => {
  const response = await authenticatedFetch(buildApiUrl(API_CONFIG.ENDPOINTS.STATS));
  return handleApiResponse(response);
};

// Función para verificar el estado de la API
export const checkApiHealth = async () => {
  const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH));
  return handleApiResponse(response);
};
