import { loginUser } from '../API/FaleApiAuth';

// Interfaz para el manejo de intentos de login
interface LoginAttempt {
  email: string;
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

// Interfaz para la respuesta de autenticación con backoff
interface AuthWithBackoffResponse {
  success: boolean;
  data?: {
    token?: string;
    user?: any;
    mfaRequired?: boolean;
    duoAuthUrl?: string;
    [key: string]: any;
  };
  error?: string;
  retryAfter?: number; // Tiempo en segundos antes del siguiente intento
  isBlocked: boolean;
}

// Clase para manejar Exponential Backoff
class AuthService {
  private static instance: AuthService;
  private loginAttempts: Map<string, LoginAttempt> = new Map();
  
  // Configuración del Exponential Backoff
  private readonly MAX_ATTEMPTS = 5;
  private readonly BASE_DELAY = 1000; // 1 segundo
  private readonly MAX_DELAY = 300000; // 5 minutos
  private readonly BLOCK_DURATION = 900000; // 15 minutos

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Calcula el delay para el siguiente intento usando Exponential Backoff
   * @param attempts Número de intentos fallidos
   * @returns Delay en milisegundos
   */
  private calculateBackoffDelay(attempts: number): number {
    const delay = Math.min(
      this.BASE_DELAY * Math.pow(2, attempts - 1),
      this.MAX_DELAY
    );
    
    // Agregar jitter para evitar thundering herd
    const jitter = Math.random() * 0.1 * delay;
    return Math.floor(delay + jitter);
  }

  /**
   * Verifica si un email está bloqueado por demasiados intentos
   * @param email Email a verificar
   * @returns true si está bloqueado, false si no
   */
  private isEmailBlocked(email: string): boolean {
    const attempt = this.loginAttempts.get(email);
    if (!attempt) return false;

    const now = Date.now();
    
    // Si está bloqueado temporalmente
    if (attempt.blockedUntil && now < attempt.blockedUntil) {
      return true;
    }

    // Si excedió el máximo de intentos, bloquear por BLOCK_DURATION
    if (attempt.attempts >= this.MAX_ATTEMPTS) {
      if (!attempt.blockedUntil) {
        attempt.blockedUntil = now + this.BLOCK_DURATION;
        this.loginAttempts.set(email, attempt);
      }
      return now < attempt.blockedUntil;
    }

    return false;
  }

  /**
   * Registra un intento de login fallido
   * @param email Email que intentó hacer login
   */
  private recordFailedAttempt(email: string): void {
    const now = Date.now();
    const attempt = this.loginAttempts.get(email) || {
      email,
      attempts: 0,
      lastAttempt: now
    };

    attempt.attempts += 1;
    attempt.lastAttempt = now;

    // Si excedió el máximo de intentos, bloquear
    if (attempt.attempts >= this.MAX_ATTEMPTS) {
      attempt.blockedUntil = now + this.BLOCK_DURATION;
    }

    this.loginAttempts.set(email, attempt);
  }

  /**
   * Limpia los intentos exitosos para un email
   * @param email Email que hizo login exitosamente
   */
  private clearAttempts(email: string): void {
    this.loginAttempts.delete(email);
  }

  /**
   * Obtiene el tiempo restante de bloqueo para un email
   * @param email Email a verificar
   * @returns Tiempo restante en segundos, 0 si no está bloqueado
   */
  public getRemainingBlockTime(email: string): number {
    const attempt = this.loginAttempts.get(email);
    if (!attempt || !attempt.blockedUntil) return 0;

    const now = Date.now();
    const remaining = Math.max(0, attempt.blockedUntil - now);
    return Math.ceil(remaining / 1000);
  }

  /**
   * Obtiene el tiempo de espera antes del siguiente intento
   * @param email Email a verificar
   * @returns Tiempo en segundos antes del siguiente intento
   */
  public getRetryAfterTime(email: string): number {
    const attempt = this.loginAttempts.get(email);
    if (!attempt) return 0;

    const now = Date.now();
    const timeSinceLastAttempt = now - attempt.lastAttempt;
    const requiredDelay = this.calculateBackoffDelay(attempt.attempts);
    
    const remainingDelay = Math.max(0, requiredDelay - timeSinceLastAttempt);
    return Math.ceil(remainingDelay / 1000);
  }

  /**
   * Realiza login con protección de Exponential Backoff
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @param mfa Código MFA
   * @returns Respuesta de autenticación con información de backoff
   */
  public async loginWithBackoff(
    email: string, 
    password: string, 
    mfa: string = "S"
  ): Promise<AuthWithBackoffResponse> {
    const normalizedEmail = email.toLowerCase().trim();

    // Verificar si el email está bloqueado
    if (this.isEmailBlocked(normalizedEmail)) {
      const remainingTime = this.getRemainingBlockTime(normalizedEmail);
      return {
        success: false,
        error: `Demasiados intentos fallidos. Intenta nuevamente en ${Math.ceil(remainingTime / 60)} minutos.`,
        isBlocked: true,
        retryAfter: remainingTime
      };
    }

    // Verificar si necesita esperar antes del siguiente intento
    const retryAfter = this.getRetryAfterTime(normalizedEmail);
    if (retryAfter > 0) {
      return {
        success: false,
        error: `Espera ${retryAfter} segundos antes del siguiente intento.`,
        isBlocked: false,
        retryAfter
      };
    }

    try {
      // Intentar hacer login
      const response = await loginUser({
        email: normalizedEmail,
        password,
        mfa
      });

      if (response.success) {
        // Verificar si requiere MFA (usando any para flexibilidad con el backend)
        const data = response.data as any;
        if (data?.mfaRequired && data?.duoAuthUrl) {
          // MFA requerido - no registrar como fallido
          return {
            success: true,
            data: {
              mfaRequired: true,
              duoAuthUrl: data.duoAuthUrl
            },
            isBlocked: false
          };
        }
        
        if (response.data?.token) {
          // Login exitoso - limpiar intentos
          this.clearAttempts(normalizedEmail);
          
          return {
            success: true,
            data: response.data,
            isBlocked: false
          };
        }
      }
      
      // Login fallido - registrar intento
      this.recordFailedAttempt(normalizedEmail);
      
      const errorMessage = response.message || 'Credenciales inválidas';
      const retryAfter = this.getRetryAfterTime(normalizedEmail);
      
      return {
        success: false,
        error: errorMessage,
        isBlocked: false,
        retryAfter
      };
    } catch (error) {
      // Error de conexión - registrar intento
      this.recordFailedAttempt(normalizedEmail);
      
      const retryAfter = this.getRetryAfterTime(normalizedEmail);
      
      return {
        success: false,
        error: 'Error de conexión. Intenta nuevamente.',
        isBlocked: false,
        retryAfter
      };
    }
  }

  /**
   * Obtiene estadísticas de intentos para un email
   * @param email Email a verificar
   * @returns Estadísticas de intentos
   */
  public getAttemptStats(email: string): {
    attempts: number;
    isBlocked: boolean;
    remainingBlockTime: number;
    retryAfter: number;
  } {
    const normalizedEmail = email.toLowerCase().trim();
    const attempt = this.loginAttempts.get(normalizedEmail);
    
    return {
      attempts: attempt?.attempts || 0,
      isBlocked: this.isEmailBlocked(normalizedEmail),
      remainingBlockTime: this.getRemainingBlockTime(normalizedEmail),
      retryAfter: this.getRetryAfterTime(normalizedEmail)
    };
  }

  /**
   * Limpia todos los intentos (útil para testing)
   */
  public clearAllAttempts(): void {
    this.loginAttempts.clear();
  }
}

// Exportar instancia singleton
export const authService = AuthService.getInstance();

// Funciones de utilidad
export const loginWithBackoff = (
  email: string, 
  password: string, 
  mfa: string = "S"
) => authService.loginWithBackoff(email, password, mfa);

export const getRemainingBlockTime = (email: string) => 
  authService.getRemainingBlockTime(email);

export const getRetryAfterTime = (email: string) => 
  authService.getRetryAfterTime(email);

export const getAttemptStats = (email: string) => 
  authService.getAttemptStats(email);

export const clearAllAttempts = () => 
  authService.clearAllAttempts();
