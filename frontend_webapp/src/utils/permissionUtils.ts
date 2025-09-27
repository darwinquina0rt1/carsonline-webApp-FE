// Utilidades para manejo de permisos
import { getUserPermissions } from '../services/userService';

export interface PermissionCheck {
  hasPermission: boolean;
  permission: string;
  userPermissions: string[];
}

/**
 * Verifica si el usuario tiene un permiso específico usando el array local
 * en lugar de hacer llamadas al backend
 */
export const checkPermissionLocal = async (permission: string): Promise<PermissionCheck> => {
  try {
    const userPermissions = await getUserPermissions();
    const hasPermission = userPermissions.includes(permission);
    
    console.log(`🔍 Verificando permiso local: ${permission}`, {
      hasPermission,
      userPermissions,
      found: userPermissions.includes(permission)
    });
    
    return {
      hasPermission,
      permission,
      userPermissions
    };
  } catch (error) {
    console.error(`❌ Error verificando permiso local: ${permission}`, error);
    return {
      hasPermission: false,
      permission,
      userPermissions: []
    };
  }
};

/**
 * Verifica múltiples permisos de una vez
 */
export const checkMultiplePermissions = async (permissions: string[]): Promise<Record<string, boolean>> => {
  try {
    const userPermissions = await getUserPermissions();
    const results: Record<string, boolean> = {};
    
    permissions.forEach(permission => {
      results[permission] = userPermissions.includes(permission);
    });
    
    console.log('🔍 Verificando múltiples permisos:', {
      permissions,
      results,
      userPermissions
    });
    
    return results;
  } catch (error) {
    console.error('❌ Error verificando múltiples permisos:', error);
    const results: Record<string, boolean> = {};
    permissions.forEach(permission => {
      results[permission] = false;
    });
    return results;
  }
};

/**
 * Verifica permisos de vehículos específicos
 */
export const checkVehiclePermissions = async (): Promise<{
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canPublish: boolean;
  userPermissions: string[];
}> => {
  try {
    const userPermissions = await getUserPermissions();
    
    const permissions = {
      canCreate: userPermissions.includes('create:vehicle'),
      canRead: userPermissions.includes('read:vehicle'),
      canUpdate: userPermissions.includes('update:vehicle'),
      canDelete: userPermissions.includes('delete:vehicle'),
      canPublish: userPermissions.includes('publish:vehicle'),
      userPermissions
    };
    
    console.log('🚗 Permisos de vehículos verificados:', permissions);
    
    return permissions;
  } catch (error) {
    console.error('❌ Error verificando permisos de vehículos:', error);
    return {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      canPublish: false,
      userPermissions: []
    };
  }
};

/**
 * Función de utilidad para debug rápido
 */
export const quickPermissionCheck = async () => {
  console.group('🔍 Verificación Rápida de Permisos');
  
  try {
    const userPermissions = await getUserPermissions();
    console.log('📋 Permisos del usuario:', userPermissions);
    
    const vehiclePermissions = await checkVehiclePermissions();
    console.log('🚗 Permisos de vehículos:', vehiclePermissions);
    
    const specificChecks = await checkMultiplePermissions([
      'create:vehicle',
      'read:vehicle', 
      'update:vehicle',
      'delete:vehicle',
      'publish:vehicle'
    ]);
    console.log('🔑 Verificaciones específicas:', specificChecks);
    
  } catch (error) {
    console.error('❌ Error en verificación rápida:', error);
  }
  
  console.groupEnd();
};

// Exportar funciones para uso en consola del navegador
if (typeof window !== 'undefined') {
  (window as any).checkPermissionLocal = checkPermissionLocal;
  (window as any).checkMultiplePermissions = checkMultiplePermissions;
  (window as any).checkVehiclePermissions = checkVehiclePermissions;
  (window as any).quickPermissionCheck = quickPermissionCheck;
}
