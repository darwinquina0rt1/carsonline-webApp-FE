import React, { useState, useEffect } from 'react';
import { validateAndLogin } from '../../services/userService';
import '../../layouts/login-form.css';

interface LoginFormProps {
  onLoginSuccess?: (email: string, password: string) => Promise<void>;
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

        {/* Botón Crear Cuenta */}
        {onCreateAccount && (
          <div className="create-account-section">
            <p className="create-account-text">¿No tienes una cuenta?</p>
            <button
              type="button"
              onClick={onCreateAccount}
              className="create-account-button"
              disabled={isLoading}
            >
              Crear Cuenta
            </button>
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
