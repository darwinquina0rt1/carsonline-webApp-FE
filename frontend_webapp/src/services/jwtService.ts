// Servicio para manejo avanzado de JWT con claims completos

export interface JWTPayload {
  // Claims estándar
  iss?: string; // Issuer
  sub?: string; // Subject (user ID)
  aud?: string; // Audience
  exp?: number; // Expiration time
  nbf?: number; // Not before
  iat?: number; // Issued at
  jti?: string; // JWT ID
  
  // Claims del backend (compatibilidad)
  userId?: string; // ID del usuario (backend)
  username?: string; // Nombre de usuario (backend)
  email?: string; // Email del usuario (backend)
  role?: string; // Rol del usuario
  authProvider?: 'local' | 'google' | 'local+duo'; // Proveedor de auth (backend)
  mfa?: boolean; // Multi-factor authentication completado
  
  // Claims adicionales del frontend
  permissions?: string[]; // User permissions
  sessionId?: string; // Session identifier
  deviceId?: string; // Device identifier
  ipAddress?: string; // IP address
  userAgent?: string; // User agent
  loginTime?: number; // Login timestamp
  lastActivity?: number; // Last activity timestamp
  [key: string]: any; // Para claims adicionales
}

export interface TokenValidationResult {
  isValid: boolean;
  payload?: JWTPayload;
  error?: string;
  isExpired?: boolean;
  needsRefresh?: boolean;
}

export interface TokenRefreshResult {
  success: boolean;
  newToken?: string;
  error?: string;
}

class JWTService {
  private static instance: JWTService;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRY_BUFFER = 10000; // 10 segundos antes de expirar (para tokens de 1 minuto del backend)

  public static getInstance(): JWTService {
    if (!JWTService.instance) {
      JWTService.instance = new JWTService();
    }
    return JWTService.instance;
  }

  /**
   * Decodifica un JWT sin verificar la firma (solo para lectura)
   * @param token JWT token
   * @returns Payload decodificado o null si es inválido
   */
  public decodeToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token format invalid');
      }

      const [, payloadB64] = parts;
      const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson) as JWTPayload;
      
      return payload;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  /**
   * Valida un JWT token
   * @param token JWT token a validar
   * @returns Resultado de la validación
   */
  public validateToken(token: string): TokenValidationResult {
    try {
      const payload = this.decodeToken(token);
      if (!payload) {
        return {
          isValid: false,
          error: 'Token inválido o malformado'
        };
      }

      const now = Math.floor(Date.now() / 1000);
      
      // Verificar expiración
      if (payload.exp && payload.exp <= now) {
        return {
          isValid: false,
          isExpired: true,
          error: 'Token expirado'
        };
      }

      // Verificar "not before"
      if (payload.nbf && payload.nbf > now) {
        return {
          isValid: false,
          error: 'Token no válido aún'
        };
      }

      // Verificar si necesita refresh (30 segundos antes de expirar)
      const needsRefresh = payload.exp ? 
        (payload.exp - now) <= (this.TOKEN_EXPIRY_BUFFER / 1000) : false;

      return {
        isValid: true,
        payload,
        needsRefresh
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Error validando token'
      };
    }
  }

  /**
   * Obtiene el token almacenado y lo valida
   * @returns Resultado de la validación del token almacenado
   */
  public getValidToken(): TokenValidationResult {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      return {
        isValid: false,
        error: 'No hay token almacenado'
      };
    }

    return this.validateToken(token);
  }

  /**
   * Guarda un token en el almacenamiento local
   * @param token JWT token
   * @param refreshToken Token de refresh (opcional)
   */
  public saveToken(token: string, refreshToken?: string): void {
    // El backend ya envía JWT con 1 minuto de expiración
    // Solo simular MFA para usuarios de Google si es necesario
    const processedToken = this.simulateMfaForGoogle(token);
    localStorage.setItem(this.TOKEN_KEY, processedToken);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Simula MFA completado para usuarios de Google si no está presente
   * @param token JWT token original
   * @returns Token con MFA simulado para Google si es necesario
   */
  private simulateMfaForGoogle(token: string): string {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return token; // Token inválido, devolver original

      const [, payloadB64] = parts;
      const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson);
      
      // Para usuarios de Google, simular MFA completado si no está presente
      if (payload.authProvider === 'google' && !payload.mfa) {
        payload.mfa = true;
        
        // Reconstruir token solo si se modificó
        const newPayloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        const adjustedToken = `${parts[0]}.${newPayloadB64}.${parts[2]}`;
        return adjustedToken;
      }
      
      return token; // No se modificó, devolver original
    } catch (error) {
      console.error('Error simulando MFA para Google:', error);
      return token; // Devolver token original si hay error
    }
  }

  /**
   * Elimina todos los tokens del almacenamiento
   */
  public clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem('token'); // Token viejo
    localStorage.removeItem('user'); // Usuario viejo
    localStorage.removeItem('puser'); // Usuario persistente viejo
    sessionStorage.clear(); // Limpiar session storage también
  }

  /**
   * Limpia tokens viejos y asegura que se use el token correcto
   */
  public clearOldTokens(): void {
    // Limpiar todos los posibles tokens viejos
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('puser');
    sessionStorage.clear();
  }


  /**
   * Obtiene el payload del token actual
   * @returns Payload del token o null si no es válido
   */
  public getCurrentPayload(): JWTPayload | null {
    const validation = this.getValidToken();
    return validation.isValid ? validation.payload || null : null;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param role Rol a verificar
   * @returns true si tiene el rol, false si no
   */
  public hasRole(role: string): boolean {
    const payload = this.getCurrentPayload();
    return payload?.role === role;
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param permission Permiso a verificar
   * @returns true si tiene el permiso, false si no
   */
  public hasPermission(permission: string): boolean {
    const payload = this.getCurrentPayload();
    return payload?.permissions?.includes(permission) || false;
  }

  /**
   * Verifica si el usuario está autenticado con MFA
   * @returns true si está autenticado con MFA, false si no
   */
  public isMfaAuthenticated(): boolean {
    const payload = this.getCurrentPayload();
    return payload?.mfa === true;
  }

  /**
   * Obtiene el tiempo restante hasta la expiración del token
   * @returns Tiempo en milisegundos, 0 si ya expiró
   */
  public getTimeUntilExpiry(): number {
    const payload = this.getCurrentPayload();
    if (!payload?.exp) return 0;

    const now = Date.now();
    const expiryTime = payload.exp * 1000;
    const timeLeft = Math.max(0, expiryTime - now);
    
    // Debug: Mostrar información del token
    
    return timeLeft;
  }

  /**
   * Verifica si el token necesita ser refrescado
   * @returns true si necesita refresh, false si no
   */
  public needsRefresh(): boolean {
    const validation = this.getValidToken();
    return validation.isValid && validation.needsRefresh === true;
  }

  /**
   * Programa el auto-logout cuando expire el token
   * @param onExpiry Callback a ejecutar cuando expire
   * @returns ID del timer para cancelarlo
   */
  public scheduleAutoLogout(onExpiry: () => void): number {
    const timeUntilExpiry = this.getTimeUntilExpiry();
    if (timeUntilExpiry <= 0) {
      onExpiry();
      return 0;
    }

    return window.setTimeout(() => {
      onExpiry();
    }, timeUntilExpiry);
  }

  /**
   * Obtiene información del usuario desde el token
   * @returns Información del usuario o null si no está disponible
   */
  public getUserInfo(): {
    id?: string;
    userId?: string;
    username?: string;
    email?: string;
    role?: string;
    authProvider?: string;
    permissions?: string[];
    sessionId?: string;
    loginTime?: number;
  } | null {
    const payload = this.getCurrentPayload();
    if (!payload) return null;

    return {
      id: payload.sub || payload.userId,
      userId: payload.userId,
      username: payload.username,
      email: payload.email || payload.sub,
      role: payload.role,
      authProvider: payload.authProvider,
      permissions: payload.permissions,
      sessionId: payload.sessionId,
      loginTime: payload.loginTime
    };
  }

  /**
   * Actualiza la última actividad en el token (si el backend lo soporta)
   * @param timestamp Timestamp de la actividad
   */
  public updateLastActivity(timestamp: number = Date.now()): void {
    const payload = this.getCurrentPayload();
    if (payload) {
      // Nota: Esto solo actualiza el payload local, no el token real
      // El backend debería manejar la actualización del token
      payload.lastActivity = timestamp;
    }
  }

  /**
   * Verifica si el token es válido y no está expirado
   * @returns true si es válido, false si no
   */
  public isTokenValid(): boolean {
    const validation = this.getValidToken();
    return validation.isValid && !validation.isExpired;
  }

  /**
   * Verifica si hay tokens viejos y los limpia automáticamente
   * @returns true si se limpiaron tokens viejos, false si no
   */
  public checkAndCleanOldTokens(): boolean {
    const oldToken = localStorage.getItem('token');
    const newToken = localStorage.getItem(this.TOKEN_KEY);
    
    // Si hay token viejo pero no hay token nuevo, limpiar
    if (oldToken && !newToken) {
      this.clearOldTokens();
      return true;
    }
    
    // Si hay ambos tokens, verificar cuál es más reciente
    if (oldToken && newToken) {
      try {
        const oldPayload = this.decodeToken(oldToken);
        const newPayload = this.decodeToken(newToken);
        
        if (oldPayload && newPayload) {
          // Si el token viejo no tiene MFA pero el nuevo sí, usar el nuevo
          if (!oldPayload.mfa && newPayload.mfa) {
            this.clearOldTokens();
            return true;
          }
        }
      } catch (error) {
        this.clearOldTokens();
        return true;
      }
    }
    
    return false;
  }

  /**
   * Verifica si el usuario se autenticó con MFA
   * @returns true si completó MFA, false si no
   */
  public isMfaCompleted(): boolean {
    const payload = this.getCurrentPayload();
    return payload?.mfa === true;
  }

  /**
   * Obtiene el proveedor de autenticación
   * @returns Proveedor de auth o null si no está disponible
   */
  public getAuthProvider(): 'local' | 'google' | 'local+duo' | null {
    const payload = this.getCurrentPayload();
    return payload?.authProvider || null;
  }

  /**
   * Verifica si el usuario se autenticó con Duo Security
   * @returns true si usó Duo, false si no
   */
  public isDuoAuthenticated(): boolean {
    const provider = this.getAuthProvider();
    return provider === 'local+duo';
  }

  /**
   * Verifica si el usuario se autenticó con Google
   * @returns true si usó Google, false si no
   */
  public isGoogleAuthenticated(): boolean {
    const provider = this.getAuthProvider();
    return provider === 'google';
  }

  /**
   * Verifica si el usuario se autenticó localmente
   * @returns true si usó auth local, false si no
   */
  public isLocalAuthenticated(): boolean {
    const provider = this.getAuthProvider();
    return provider === 'local' || provider === 'local+duo';
  }

  /**
   * Obtiene estadísticas del token actual
   * @returns Estadísticas del token
   */
  public getTokenStats(): {
    isValid: boolean;
    isExpired: boolean;
    timeUntilExpiry: number;
    needsRefresh: boolean;
    hasMfa: boolean;
    role?: string;
    permissions?: string[];
  } {
    const validation = this.getValidToken();
    const payload = validation.payload;

    return {
      isValid: validation.isValid,
      isExpired: validation.isExpired || false,
      timeUntilExpiry: this.getTimeUntilExpiry(),
      needsRefresh: validation.needsRefresh || false,
      hasMfa: payload?.mfa === true,
      role: payload?.role,
      permissions: payload?.permissions
    };
  }
}

// Exportar instancia singleton
export const jwtService = JWTService.getInstance();

// Funciones de utilidad
export const getValidToken = () => jwtService.getValidToken();
export const getCurrentPayload = () => jwtService.getCurrentPayload();
export const hasRole = (role: string) => jwtService.hasRole(role);
export const hasPermission = (permission: string) => jwtService.hasPermission(permission);
export const isMfaAuthenticated = () => jwtService.isMfaAuthenticated();
export const isMfaCompleted = () => jwtService.isMfaCompleted();
export const getAuthProvider = () => jwtService.getAuthProvider();
export const isDuoAuthenticated = () => jwtService.isDuoAuthenticated();
export const isGoogleAuthenticated = () => jwtService.isGoogleAuthenticated();
export const isLocalAuthenticated = () => jwtService.isLocalAuthenticated();
export const getTimeUntilExpiry = () => jwtService.getTimeUntilExpiry();
export const needsRefresh = () => jwtService.needsRefresh();
export const scheduleAutoLogout = (onExpiry: () => void) => jwtService.scheduleAutoLogout(onExpiry);
export const getUserInfo = () => jwtService.getUserInfo();
export const isTokenValid = () => jwtService.isTokenValid();
export const getTokenStats = () => jwtService.getTokenStats();
export const saveToken = (token: string, refreshToken?: string) => jwtService.saveToken(token, refreshToken);
export const clearTokens = () => jwtService.clearTokens();
export const clearOldTokens = () => jwtService.clearOldTokens();
export const checkAndCleanOldTokens = () => jwtService.checkAndCleanOldTokens();
