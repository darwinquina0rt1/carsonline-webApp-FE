// Utilidades para debug de tokens
import { jwtService, clearOldTokens, checkAndCleanOldTokens } from '../services/jwtService';

// Función para debug de tokens desde la consola
export const debugTokens = () => {
  // Verificar tokens almacenados
  localStorage.getItem('token');
  localStorage.getItem('access_token');
  localStorage.getItem('user');
  
  // Verificar contenido de tokens
  const oldToken = localStorage.getItem('token');
  if (oldToken) {
    try {
      jwtService.decodeToken(oldToken);
    } catch (error) {
      // Error decodificando token viejo
    }
  }
  
  const newToken = localStorage.getItem('access_token');
  if (newToken) {
    try {
      jwtService.decodeToken(newToken);
    } catch (error) {
      // Error decodificando token nuevo
    }
  }
  
  // Verificar estado del servicio JWT
  jwtService.getTokenStats();
};

// Función para limpiar tokens desde la consola
export const cleanTokens = () => {
  clearOldTokens();
};

// Función para verificar y limpiar tokens automáticamente
export const checkTokens = () => {
  checkAndCleanOldTokens();
};

// Función para mostrar información completa del token
export const showTokenInfo = () => {
  const payload = jwtService.getCurrentPayload();
  
  if (!payload) {
    return;
  }
};

// Función para probar el endpoint de permisos directamente
export const testPermissionsEndpoint = async () => {
  try {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    
    if (!token) {
      return;
    }
    
    const response = await fetch('http://localhost:3005/api/permissions/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    // Error probando endpoint
  }
};

// Hacer las funciones disponibles globalmente para uso desde la consola
if (typeof window !== 'undefined') {
  (window as any).debugTokens = debugTokens;
  (window as any).cleanTokens = cleanTokens;
  (window as any).checkTokens = checkTokens;
  (window as any).showTokenInfo = showTokenInfo;
  (window as any).testPermissionsEndpoint = testPermissionsEndpoint;
}
