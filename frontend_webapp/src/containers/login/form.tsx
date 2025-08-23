import React, { useState, useEffect } from 'react';
import { validateAndLogin } from '../../services/userService';
import { handleGoogleLogin } from '../google/logoofle';
import '../../layouts/login-form.css';

interface LoginFormProps {
  onLoginSuccess?: (email: string, password: string) => Promise<void>;
  onGoogleLoginSuccess?: (email: string) => Promise<void>;
  onLoginError?: (error: string) => void;
  onCreateAccount?: () => void;
  useHashedLogin?: boolean;
  className?: string;
}

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onGoogleLoginSuccess,
  onLoginError,
  onCreateAccount,
  useHashedLogin = false,
  className = ''
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Validación de email
  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'El correo electrónico es obligatorio';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Ingrese un correo electrónico válido';
    return undefined;
  };

  // Validación de contraseña
  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'La contraseña es obligatoria';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return undefined;
  };

  // Validación del formulario completo
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejo de cambios en los campos
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: undefined }));

    try {
      // Usar el servicio de usuarios para validar y hacer login
      const result = await validateAndLogin(formData.email, formData.password, useHashedLogin);

      if (result.isValid) {
        // Llamar al callback de éxito con email y password
        await onLoginSuccess?.(formData.email, formData.password);
        // Limpiar formulario después del login exitoso
        setFormData({ email: '', password: '' });
      } else {
        const errorMessage = result.error || 'Error al iniciar sesión';
        setErrors(prev => ({ ...prev, general: errorMessage }));
        onLoginError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
      setErrors(prev => ({ ...prev, general: errorMessage }));
      onLoginError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar errores cuando el componente se monta
  useEffect(() => {
    setErrors({});
  }, []);

  return (
    <div className={`login-form-container ${className}`}>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-header">
          <h2 className="form-title">Iniciar Sesión</h2>
          <p className="form-subtitle">Ingresa tus credenciales para continuar</p>
        </div>

        {/* Error general */}
        {errors.general && (
          <div className="error-message general-error">
            <span className="error-icon">⚠️</span>
            {errors.general}
          </div>
        )}

        {/* Campo de email */}
        <div className="form-field">
          <label htmlFor="email" className="field-label">
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`field-input ${errors.email ? 'field-input-error' : ''}`}
            placeholder="ejemplo@correo.com"
            disabled={isLoading}
            autoComplete="email"
          />
          {errors.email && (
            <span className="field-error">{errors.email}</span>
          )}
        </div>

        {/* Campo de contraseña */}
        <div className="form-field">
          <label htmlFor="password" className="field-label">
            Contraseña
          </label>
          <div className="password-input-container">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`field-input password-input ${errors.password ? 'field-input-error' : ''}`}
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && (
            <span className="field-error">{errors.password}</span>
          )}
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isLoading}
          className="submit-button"
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Iniciando sesión...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </button>

        {/* Botón de Google */}
        <button
          type="button"
          className="google-login-button"
          disabled={isLoading || googleLoading}
          onClick={async () => {
            setGoogleLoading(true);
            try {
              const result = await handleGoogleLogin();
              if (result.success && result.user) {
                // Login exitoso con Google
                console.log('Login exitoso con Google:', result.user);
                
                // Limpiar errores si los había
                setErrors(prev => ({ ...prev, general: undefined }));
                
                                 // Llamar al callback específico de Google para actualizar el estado en App.tsx
                 if (onGoogleLoginSuccess) {
                   await onGoogleLoginSuccess(result.user.email);
                 } else {
                   // Fallback al callback normal si no hay uno específico para Google
                   await onLoginSuccess?.(result.user.email, '');
                 }
                
              } else {
                const errorMessage = result.error || 'Error al iniciar sesión con Google';
                setErrors(prev => ({ ...prev, general: errorMessage }));
                onLoginError?.(errorMessage);
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Error de conexión con Google';
              setErrors(prev => ({ ...prev, general: errorMessage }));
              onLoginError?.(errorMessage);
            } finally {
              setGoogleLoading(false);
            }
          }}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="24" height="24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? 'Conectando con Google...' : 'Continuar con Google'}
        </button>

        {/* Botón Crear Cuenta */}
        {onCreateAccount && (
          <div className="create-account-section">
            <button
              type="button"
              onClick={onCreateAccount}
              className="create-account-button"
              disabled={isLoading}
            >
              Crear Cuenta
            </button>
            <p className="create-account-text">¿No tienes una cuenta?</p>
          </div>
        )}

        {/* Información adicional */}
        <div className="form-footer">
          <p className="login-type-info">
            {useHashedLogin ? 'Usando autenticación con hash' : 'Usando autenticación básica'}
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
