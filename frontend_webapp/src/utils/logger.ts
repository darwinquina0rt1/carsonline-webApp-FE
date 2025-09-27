// Sistema de logging seguro
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConfig {
  level: LogLevel;
  enableUserLogs: boolean;
  enableSensitiveData: boolean;
}

// Configuración según el entorno
const getLogConfig = (): LogConfig => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  if (isProduction) {
    return {
      level: 'warn',
      enableUserLogs: false,
      enableSensitiveData: false
    };
  }
  
  if (isDevelopment) {
    return {
      level: 'debug',
      enableUserLogs: true,
      enableSensitiveData: false // Nunca en desarrollo tampoco
    };
  }
  
  return {
    level: 'info',
    enableUserLogs: false,
    enableSensitiveData: false
  };
};

class SecureLogger {
  private config: LogConfig;
  
  constructor() {
    this.config = getLogConfig();
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }
  
  // Log seguro para información de usuario
  logUserAction(action: string, userInfo: Partial<{ email: string; username?: string; role?: string }>) {
    if (!this.config.enableUserLogs || !this.shouldLog('info')) {
      return;
    }
    
    const safeUserInfo = {
      email: userInfo.email,
      username: userInfo.username || 'N/A',
      role: userInfo.role || 'N/A'
    };
    
    // Log de acción de usuario
  }
  
  // Log para eventos de autenticación
  logAuthEvent(event: string, details?: any) {
    if (!this.shouldLog('info')) {
      return;
    }
    
    const timestamp = new Date().toISOString();
    // Log de evento de autenticación
  }
  
  // Log para errores
  logError(message: string, error?: any) {
    if (!this.shouldLog('error')) {
      return;
    }
    
    // Log de error
  }
  
  // Log para debugging (solo en desarrollo)
  logDebug(message: string, data?: any) {
    if (!this.shouldLog('debug')) {
      return;
    }
    
    // Log de debug
  }
  
  // Log para advertencias
  logWarn(message: string, data?: any) {
    if (!this.shouldLog('warn')) {
      return;
    }
    
    // Log de advertencia
  }
  
  // Log para información general
  logInfo(message: string, data?: any) {
    if (!this.shouldLog('info')) {
      return;
    }
    
    // Log de información
  }
}

// Instancia global del logger
export const logger = new SecureLogger();

// Funciones de conveniencia
export const logUserLogin = (userInfo: { email: string; username?: string; role?: string }) => {
  logger.logUserAction('Login exitoso', userInfo);
  logger.logAuthEvent('Usuario autenticado');
};

export const logUserLogout = (userInfo: { email: string; username?: string; role?: string }) => {
  logger.logUserAction('Logout', userInfo);
  logger.logAuthEvent('Usuario desconectado');
};

export const logAuthError = (message: string, error?: any) => {
  logger.logError(`Error de autenticación: ${message}`, error);
};

export const logApiCall = (endpoint: string, method: string) => {
  logger.logDebug(`API Call: ${method} ${endpoint}`);
};
