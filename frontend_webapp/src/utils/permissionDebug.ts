// Utilidad para debug de permisos
import { getUserPermissions, hasPermission } from '../services/userService';
import { isMfaCompleted, getTokenStats } from '../services/jwtService';

export interface PermissionDebugInfo {
  mfaCompleted: boolean;
  tokenValid: boolean;
  tokenStats: any;
  userPermissions: string[];
  hasCreatePermission: boolean;
  hasUpdatePermission: boolean;
  hasDeletePermission: boolean;
  errors: string[];
}

export const debugPermissions = async (): Promise<PermissionDebugInfo> => {
  const errors: string[] = [];
  let userPermissions: string[] = [];
  let hasCreatePermission = false;
  let hasUpdatePermission = false;
  let hasDeletePermission = false;
  let tokenStats: any = null;

  try {
    // Verificar MFA
    const mfaCompleted = isMfaCompleted();
    console.log('🔐 MFA completado:', mfaCompleted);

    // Verificar token
    tokenStats = getTokenStats();
    console.log('🎫 Estado del token:', tokenStats);

    if (!tokenStats.isValid) {
      errors.push('Token no válido');
    }

    if (!mfaCompleted) {
      errors.push('MFA no completado');
    }

    // Obtener permisos
    try {
      userPermissions = await getUserPermissions();
      console.log('📋 Permisos del usuario:', userPermissions);

      // Verificar permisos específicos usando el array de permisos directamente
      // en lugar de hacer llamadas individuales al backend
      hasCreatePermission = userPermissions.includes('create:vehicle');
      hasUpdatePermission = userPermissions.includes('update:vehicle');
      hasDeletePermission = userPermissions.includes('delete:vehicle');

      console.log('🔑 Permisos específicos (verificación local):', {
        create: hasCreatePermission,
        update: hasUpdatePermission,
        delete: hasDeletePermission,
        userPermissions: userPermissions
      });

      // También verificar con el backend para comparar
      try {
        const backendCreate = await hasPermission('create:vehicle');
        const backendUpdate = await hasPermission('update:vehicle');
        const backendDelete = await hasPermission('delete:vehicle');
        
        console.log('🔑 Permisos específicos (verificación backend):', {
          create: backendCreate,
          update: backendUpdate,
          delete: backendDelete
        });
      } catch (backendError) {
        console.warn('⚠️ Error verificando permisos con backend:', backendError);
      }
    } catch (error) {
      console.error('❌ Error obteniendo permisos:', error);
      errors.push(`Error obteniendo permisos: ${error}`);
    }

  } catch (error) {
    console.error('❌ Error en debug de permisos:', error);
    errors.push(`Error general: ${error}`);
  }

  const debugInfo: PermissionDebugInfo = {
    mfaCompleted: isMfaCompleted(),
    tokenValid: getTokenStats().isValid,
    tokenStats,
    userPermissions,
    hasCreatePermission,
    hasUpdatePermission,
    hasDeletePermission,
    errors
  };

  console.log('🔍 Debug completo de permisos:', debugInfo);
  return debugInfo;
};

// Función para mostrar información de permisos en la consola
export const logPermissionStatus = async () => {
  const debug = await debugPermissions();
  
  console.group('🔐 Estado de Permisos');
  console.log('MFA:', debug.mfaCompleted ? '✅ Completado' : '❌ No completado');
  console.log('Token:', debug.tokenValid ? '✅ Válido' : '❌ Inválido');
  console.log('Permisos:', debug.userPermissions);
  console.log('Crear:', debug.hasCreatePermission ? '✅' : '❌');
  console.log('Actualizar:', debug.hasUpdatePermission ? '✅' : '❌');
  console.log('Eliminar:', debug.hasDeletePermission ? '✅' : '❌');
  
  if (debug.errors.length > 0) {
    console.log('Errores:', debug.errors);
  }
  
  console.groupEnd();
  
  return debug;
};

// Función para probar el endpoint de permisos directamente
export const testPermissionsEndpoint = async () => {
  try {
    console.log('🧪 Probando endpoint de permisos...');
    
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token disponible');
    }

    const response = await fetch('http://localhost:3005/api/permissions/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Respuesta del endpoint:', {
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    const data = await response.json();
    console.log('📋 Datos de permisos:', data);

    return data;
  } catch (error) {
    console.error('❌ Error probando endpoint:', error);
    throw error;
  }
};

// Función para limpiar y reiniciar permisos
export const resetPermissions = async () => {
  try {
    console.log('🔄 Reiniciando verificación de permisos...');
    
    // Limpiar cache de permisos
    localStorage.removeItem('permissions_cache');
    
    // Verificar permisos nuevamente
    const debug = await debugPermissions();
    
    console.log('✅ Permisos reiniciados:', debug);
    return debug;
  } catch (error) {
    console.error('❌ Error reiniciando permisos:', error);
    throw error;
  }
};

// Exportar funciones para uso en consola del navegador
if (typeof window !== 'undefined') {
  (window as any).debugPermissions = debugPermissions;
  (window as any).logPermissionStatus = logPermissionStatus;
  (window as any).testPermissionsEndpoint = testPermissionsEndpoint;
  (window as any).resetPermissions = resetPermissions;
}
