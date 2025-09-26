import React, { useState } from "react";
import LoginForm from "../containers/login/form";
import CreateUsers from "../containers/login/createusers";
import { validateAndLogin } from "../services/userService";
import { logUserLogin, logAuthError } from "../utils/logger";

type LoginProps = {
  onLogin: (email: string, password: string) => Promise<void>;
  onGoogleLogin?: (email: string) => Promise<void>;
};

// Componente de página de login que usa el nuevo formulario
const Login: React.FC<LoginProps> = ({ onLogin, onGoogleLogin }) => {
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  // Manejador para el login exitoso (tradicional)
  const handleLoginSuccess = async (email: string, password: string) => {
    try {
      // Usar el servicio de usuarios para validar y hacer login
      const result = await validateAndLogin(email, password, false,false);
      if (result.isValid && result.user) {
        // Llamar a la función onLogin original
        await onLogin(result.user.email, '');
        
        // Log seguro usando el sistema de logging
        logUserLogin({
          email: result.user.email,
          username: result.user.username,
          role: result.user.role
        });
        
        // NO loggear información sensible como IDs internos
      } else {
        logAuthError(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error inesperado en login:', error);
    }
  };

  // Manejador específico para login con Google
  const handleGoogleLoginSuccess = async (email: string) => {
    try {
      // Para Google, no necesitamos validar contraseña, solo llamar al callback
      if (onGoogleLogin) {
        await onGoogleLogin(email);
      } else {
        // Si no hay callback específico para Google, usar el normal
        await onLogin(email, '');
      }
      
      // Log seguro usando el sistema de logging
      logUserLogin({
        email: email,
        username: email.split('@')[0], // Usar parte del email como username
        role: 'user'
      });
      
    } catch (error) {
      console.error('Error inesperado en login con Google:', error);
    }
  };

  // Manejador para errores de login
  const handleLoginError = (error: string) => {
    logAuthError(error);
    // Aquí puedes mostrar notificaciones o manejar errores específicos
  };

  // Manejador para cuando se crea un usuario exitosamente
  const handleUserCreated = () => {
    // Cambiar de vuelta al formulario de login
    setShowCreateAccount(false);
    // Aquí podrías mostrar un mensaje de éxito
    alert('Usuario creado exitosamente. Ahora puedes iniciar sesión.');
  };

  return (
    <div 
      className="flex justify-end items-center min-h-screen pr-8"
      style={{
        backgroundImage: 'url(https://i.pinimg.com/736x/67/ca/ae/67caae04bce35f2bf9d30c5641f1996e.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div className="w-auto">
        {showCreateAccount ? (
          // Mostrar formulario de crear cuenta
          <div>
            <CreateUsers onUserCreated={handleUserCreated} />
            <div className="text-center mt-4">
              <button
                onClick={() => setShowCreateAccount(false)}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                ← Volver al Login
              </button>
            </div>
          </div>
        ) : (
          // Mostrar formulario de login
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onGoogleLoginSuccess={handleGoogleLoginSuccess}
            onLoginError={handleLoginError}
            onCreateAccount={() => setShowCreateAccount(true)}
            useHashedLogin={false}
            className=""
          />
        )}
      </div>
    </div>
  );
};

export default Login;
