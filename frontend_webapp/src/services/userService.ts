import { registerInsecure, registerHashed, loginUser } from '../API/FaleApiAuth';
import type { AuthResponse, HashAlgo } from '../API/FaleApiAuth';
import { jwtService, checkAndCleanOldTokens } from './jwtService';
import { fetchUserPermissions, checkPermission } from '../config/api';

// Tipos para el servicio de usuarios
export interface User {
  _id?: string;
  id?: number;
  email: string;
  username?: string;
  name?: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfa:string
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface UserValidationResult {
  isValid: boolean;
  user?: User;
  error?: string;
  urlDuo?: string;
  success?: boolean;
  data?: any;
}
// Función parseJwt movida al servicio jwtService.ts
// Clase para manejar el servicio de usuarios
class UserService {
  private static instance: UserService;
  private currentUser: User | null = null;

  // Singleton pattern
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }


  // Validar si el usuario está autenticado
  public isAuthenticated(): boolean {
    return jwtService.isTokenValid();
  }

  // Obtener el usuario actual
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Validar credenciales de login
  public async validateLogin(credentials: LoginCredentials, mfa: boolean = true): Promise<UserValidationResult> {
    try {
      if (mfa) {
        credentials.mfa = "S";
      }
      // Validar formato de email
      if (!this.isValidEmail(credentials.email)) {
        return {
          isValid: false,
          error: 'Formato de email inválido'
        };
      }

      // Validar que la contraseña tenga al menos 6 caracteres
      if (credentials.password.length < 6) {
        return {
          isValid: false,
          error: 'La contraseña debe tener al menos 6 caracteres'
        };
      }

      // Intentar hacer login usando tu endpoint específico
      const response = await loginUser({
        email: credentials.email,
        password: credentials.password,
        mfa: credentials.mfa || "S"
      });
      if (response.success && response.data?.token) {
        // Guardar token usando el servicio JWT mejorado
        jwtService.saveToken(response.data.token);
        
        // Crear usuario desde el token o datos disponibles
        const safeUser = this.sanitizeUserData(response.data.user || {
          email: credentials.email,
          username: 'admin',
          role: 'admin'
        });
        this.currentUser = safeUser;


        return {
          isValid: true,
          user: safeUser,
          success: true,
          data: response.data
        };
      } else {
        // Manejar error según tu formato de API
        const errorMessage = response.message || 'Credenciales inválidas';
        return {
          isValid: false,
          error: errorMessage,
          urlDuo :response.data.duoAuthUrl

        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Error de conexión. Intenta nuevamente.'
      };
    }
  }

  // Registrar nuevo usuario
  public async registerUser(credentials: RegisterCredentials, useHashed: boolean = false, hashAlgo?: HashAlgo): Promise<UserValidationResult> {
    try {
      // Validar formato de email
      if (!this.isValidEmail(credentials.email)) {
        return {
          isValid: false,
          error: 'Formato de email inválido'
        };
      }

      // Validar que la contraseña tenga al menos 6 caracteres
      if (credentials.password.length < 6) {
        return {
          isValid: false,
          error: 'La contraseña debe tener al menos 6 caracteres'
        };
      }

      // Validar que el nombre no esté vacío si se proporciona
      if (credentials.name && credentials.name.trim().length === 0) {
        return {
          isValid: false,
          error: 'El nombre no puede estar vacío'
        };
      }

      // Intentar registrar usuario
      let response: AuthResponse;
      
      if (useHashed && hashAlgo) {
        response = await registerHashed({
          ...credentials,
          algo: hashAlgo
        });
      } else {
        response = await registerInsecure(credentials);
      }

      if (response.success && response.data?.user) {
        // Guardar token si existe en la respuesta
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        // Sanitizar y guardar información del usuario
        const safeUser = this.sanitizeUserData(response.data.user);
        this.currentUser = safeUser;

        return {
          isValid: true,
          user: safeUser
        };
      } else {
        // Manejar error según tu formato de API
        const errorMessage = response.message || 'Error al registrar usuario';
        return {
          isValid: false,
          error: errorMessage
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Error de conexión. Intenta nuevamente.'
      };
    }
  }

  // Registrar nuevo usuario usando el endpoint específico
  public async createUser(userData: {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    isActive: boolean;
  }): Promise<UserValidationResult> {
    try {
      // Validar formato de email
      if (!this.isValidEmail(userData.email)) {
        return {
          isValid: false,
          error: 'Formato de email inválido'
        };
      }

      // Validar que la contraseña tenga al menos 6 caracteres
      if (userData.password.length < 6) {
        return {
          isValid: false,
          error: 'La contraseña debe tener al menos 6 caracteres'
        };
      }

      // Validar que el username no esté vacío
      if (!userData.username.trim()) {
        return {
          isValid: false,
          error: 'El nombre de usuario es requerido'
        };
      }

      // Llamar al endpoint de registro
      const response = await fetch('http://localhost:3005/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          isActive: userData.isActive
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Guardar token si existe en la respuesta
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Sanitizar y guardar información del usuario
        const safeUser = this.sanitizeUserData(data.user || data);
        this.currentUser = safeUser;

        return {
          isValid: true,
          user: safeUser
        };
      } else {
        // Manejar error según la respuesta de la API
        const errorMessage = data.message || data.error || 'Error al crear usuario';
        return {
          isValid: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return {
        isValid: false,
        error: 'Error de conexión. Intenta nuevamente.'
      };
    }
  }

  // Verificar si el token es válido (opcional - para validación adicional)
  public async validateToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      // Aquí podrías hacer una llamada al backend para validar el token
      // Por ahora, solo verificamos que existe
      return true;
    } catch (error) {
      return false;
    }
  }

  // Cerrar sesión
  public logout(): void {
    jwtService.clearTokens();
    localStorage.removeItem('user');
    localStorage.removeItem('puser');
    this.currentUser = null;
  }

  // Validar formato de email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Sanitizar datos del usuario para remover información sensible
  private sanitizeUserData(user: any): User {
    return {
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role
      // NO incluir _id, id, userId, loginTime, etc.
    };
  }

  // Verificar si el usuario existe (para validación previa al registro)
  public async checkUserExists(email: string): Promise<boolean> {
    try {
      // Intentar hacer login con credenciales falsas para verificar si el usuario existe
      const response = await loginUser({
        email,
        password: 'dummy_password_for_check',
        mfa: 'S'
      });

      // Si el error es específico sobre credenciales incorrectas, el usuario existe
      // Si el error es sobre usuario no encontrado, el usuario no existe
      const errorMessage = response.message || '';
      return errorMessage.includes('contraseña') || errorMessage.includes('password') || false;
    } catch (error) {
      return false;
    }
  }

  // Obtener información del usuario desde el token (si el backend lo soporta)
  public async getUserInfo(): Promise<User | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }

      // Aquí podrías hacer una llamada al backend para obtener información del usuario
      // Por ahora, retornamos el usuario almacenado localmente
      return this.currentUser;
    } catch (error) {
      return null;
    }
  }

  // Obtener permisos del usuario actual
  public async getUserPermissions(): Promise<string[]> {
    try {
      console.log('🔍 Solicitando permisos del usuario...');
      
      // Limpiar tokens viejos antes de hacer la petición
      checkAndCleanOldTokens();
      
      const data = await fetchUserPermissions();
      
      // Debug detallado del procesamiento
      console.log('📋 Respuesta de permisos:', data);
      
      // Intentar extraer permisos de diferentes ubicaciones posibles
      const permissions = data.data?.permissions || data.permissions || [];
      
      console.log('🔐 Permisos extraídos:', { 
        permissions, 
        count: permissions.length,
        hasData: !!data.data,
        hasPermissions: !!data.permissions
      });
      
      return permissions;
    } catch (error) {
      console.error('❌ Error obteniendo permisos:', error);
      return [];
    }
  }

  // Verificar si el usuario tiene un permiso específico
  public async hasPermission(permission: string): Promise<boolean> {
    try {
      const data = await checkPermission(permission);
      return data.hasPermission || false;
    } catch (error) {
      console.error('Error verificando permiso:', error);
      return false;
    }
  }
}

// Exportar una instancia del servicio
export const userService = UserService.getInstance();

// Funciones de utilidad para facilitar el uso
export const validateAndLogin = async (email: string, password: string, mfa: boolean = true) => {
  return userService.validateLogin({ email, password, mfa: mfa ? "S" : "N" }, mfa);
};

export const registerNewUser = async (email: string, password: string, name?: string, useHashed: boolean = false, hashAlgo?: HashAlgo) => {
  return userService.registerUser({ email, password, name }, useHashed, hashAlgo);
};

export const isUserAuthenticated = () => userService.isAuthenticated();

export const getCurrentUser = () => userService.getCurrentUser();

export const logoutUser = () => userService.logout();

export const checkUserExists = (email: string) => userService.checkUserExists(email);

export const createNewUser = (userData: {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  isActive: boolean;
}) => userService.createUser(userData);

// Funciones de permisos
export const getUserPermissions = () => userService.getUserPermissions();
export const hasPermission = (permission: string) => userService.hasPermission(permission);
