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

const saveToken = (token: string) => localStorage.setItem('access_token', token);
const clearSession = () => localStorage.removeItem('access_token');

let logoutTimer: number | undefined;
function scheduleAutoLogout(token: string) {
  try {
    const [_, payloadB64] = token.split('.');
    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson) as { exp?: number };
    const msLeft = (payload.exp! * 1000) - Date.now();
    if (logoutTimer) window.clearTimeout(logoutTimer);
    logoutTimer = window.setTimeout(() => {
      clearSession();
      // fuerza login al expirar (2 min)
      window.location.replace('/login');
    }, Math.max(msLeft, 0));
  } catch {
  }
}

function cleanQueryParams() {
  const url = new URL(window.location.href);
  url.search = '';
  window.history.replaceState({}, '', url.toString());
}

const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onLoginError,
  onCreateAccount,
  useHashedLogin = false,
  className = ''
}) => {
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false); // evita doble submit


  useEffect(() => {
  let cancelado = false;

  const procesarCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const mfa = params.get('mfa');
    const token = params.get('token');

    
    if (!mfa) return; 

    if (mfa === 'ok' && token) {
      saveToken(token);
      scheduleAutoLogout(token);
      cleanQueryParams();

      const email = localStorage.getItem('user') ?? '';
      const pass  = localStorage.getItem('puser') ?? '';

      try {
        await validateAndLogin?.(email, pass, true);
        await onLoginSuccess?.(email, pass);
        window.location.reload();
        setFormData({ email: '', password: '' });
      } catch (e) {
        console.error('onLoginSuccess falló:', e);
      }
      return;
    }

    if (mfa === 'denied') {
      if (!cancelado) setErrors((p) => ({ ...p, general: 'MFA cancelado o denegado.' }));
      cleanQueryParams();
      return;
    }

    if (!cancelado) setErrors((p) => ({ ...p, general: 'Ocurrió un error durante el MFA.' }));
    cleanQueryParams();
  };

  void procesarCallback();

  return () => { cancelado = true; };
}, [onLoginSuccess]);

  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'El correo electrónico es obligatorio';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Ingrese un correo electrónico válido';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'La contraseña es obligatoria';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== Handlers =====
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (submitting) return; 
    setSubmitting(true);
    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: undefined }));

    try {
      // Validar que los campos no estén vacíos
      if (!formData.email.trim() || !formData.password) {
        setErrors((prev) => ({ ...prev, general: 'Email y contraseña son requeridos' }));
        return;
      }
      
      
      localStorage.setItem("user",formData.email.trim());
      localStorage.setItem("puser",formData.password);
      const resp: any = await validateAndLogin(
        formData.email.trim(),
        formData.password,
        true // MFA habilitado
      );

      const duoUrl =
        resp?.data?.duoAuthUrl ||
        resp?.urlDuo ||
        (resp?.error === 'MFA requerido: redirigir a Duo' ? resp?.urlDuo : undefined);

      if ((resp?.success && resp?.data?.mfaRequired && duoUrl) || duoUrl) {
        window.location.assign(String(duoUrl));
        return; 
      }

      if (resp?.isValid) {
        await onLoginSuccess?.(formData.email, formData.password);
        setFormData({ email: '', password: '' });
        return;
      }

      // Si el login fue exitoso pero no tiene isValid, verificar success
      if (resp?.success && resp?.data?.token) {
        await onLoginSuccess?.(formData.email, formData.password);
        setFormData({ email: '', password: '' });
        return;
      }

      const errorMessage = resp?.message || resp?.error || 'Error al iniciar sesión';
      setErrors((prev) => ({ ...prev, general: errorMessage }));
      onLoginError?.(errorMessage);
    } catch (error: any) {
      
      let errorMessage = 'Error de conexión. Intenta nuevamente.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.error) {
        errorMessage = `Error del servidor: ${error.response.data.error}`;
      }
      
      setErrors((prev) => ({ ...prev, general: errorMessage }));
      onLoginError?.(errorMessage);
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

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

        {errors.general && (
          <div className="error-message general-error">
            <span className="error-icon">⚠️</span>
            {errors.general}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="email" className="field-label">Correo Electrónico</label>
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
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="password" className="field-label">Contraseña</label>
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
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <button type="submit" disabled={isLoading || submitting} className="submit-button">
          {isLoading ? (<><span className="loading-spinner"></span>Iniciando sesión...</>) : 'Iniciar Sesión'}
        </button>

        <button
          type="button"
          className="google-login-button"
          disabled={isLoading || googleLoading}
          onClick={async () => {
            setGoogleLoading(true);
            try {
              const result = await handleGoogleLogin();
              if (result?.success && result?.user?.email) {
                setErrors((p) => ({ ...p, general: 'Falta integrar flujo Google → Duo en el front.' }));
              } else {
                const msg = result?.error || 'Error al iniciar sesión con Google';
                setErrors((p) => ({ ...p, general: msg }));
                onLoginError?.(msg);
              }
            } catch (error: any) {
              const msg = error?.response?.data?.message || error?.message || 'Error de conexión con Google';
              setErrors((p) => ({ ...p, general: msg }));
              onLoginError?.(msg);
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
