import React, { useState, useEffect } from 'react';
import { getAttemptStats } from '../services/authService';

interface BackoffInfoProps {
  email: string;
  onRetry?: () => void;
}

const BackoffInfo: React.FC<BackoffInfoProps> = ({ email, onRetry }) => {
  const [stats, setStats] = useState({
    attempts: 0,
    isBlocked: false,
    remainingBlockTime: 0,
    retryAfter: 0
  });

  useEffect(() => {
    const updateStats = () => {
      const currentStats = getAttemptStats(email);
      setStats(currentStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 1000); // Actualizar cada segundo

    return () => clearInterval(interval);
  }, [email]);

  if (stats.attempts === 0) {
    return null; // No mostrar nada si no hay intentos
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} segundos`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
  };

  const getStatusMessage = (): string => {
    if (stats.isBlocked) {
      return `Cuenta bloqueada por ${formatTime(stats.remainingBlockTime)}`;
    }
    
    if (stats.retryAfter > 0) {
      return `Espera ${formatTime(stats.retryAfter)} antes del siguiente intento`;
    }

    return `Intento ${stats.attempts} de 5`;
  };

  const getStatusColor = (): string => {
    if (stats.isBlocked) return '#dc3545'; // Rojo
    if (stats.retryAfter > 0) return '#ffc107'; // Amarillo
    if (stats.attempts >= 3) return '#fd7e14'; // Naranja
    return '#6c757d'; // Gris
  };

  const canRetry = (): boolean => {
    return !stats.isBlocked && stats.retryAfter === 0;
  };

  return (
    <div 
      style={{
        padding: '12px',
        margin: '8px 0',
        borderRadius: '6px',
        backgroundColor: '#f8f9fa',
        border: `2px solid ${getStatusColor()}`,
        fontSize: '14px',
        textAlign: 'center'
      }}
    >
      <div style={{ 
        color: getStatusColor(), 
        fontWeight: 'bold',
        marginBottom: '4px'
      }}>
        {getStatusMessage()}
      </div>
      
      {stats.attempts > 0 && (
        <div style={{ 
          color: '#6c757d', 
          fontSize: '12px',
          marginBottom: '8px'
        }}>
          Intentos fallidos: {stats.attempts}/5
        </div>
      )}

      {stats.isBlocked && (
        <div style={{ 
          color: '#dc3545', 
          fontSize: '12px',
          marginBottom: '8px'
        }}>
          ⚠️ Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente.
        </div>
      )}

      {stats.retryAfter > 0 && !stats.isBlocked && (
        <div style={{ 
          color: '#ffc107', 
          fontSize: '12px',
          marginBottom: '8px'
        }}>
          ⏱️ Por seguridad, debes esperar antes del siguiente intento.
        </div>
      )}

      {stats.attempts >= 3 && !stats.isBlocked && stats.retryAfter === 0 && (
        <div style={{ 
          color: '#fd7e14', 
          fontSize: '12px',
          marginBottom: '8px'
        }}>
          ⚠️ Cuidado: Te quedan {5 - stats.attempts} intentos antes del bloqueo.
        </div>
      )}

      {canRetry() && onRetry && (
        <button
          onClick={onRetry}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            marginTop: '4px'
          }}
        >
          Intentar nuevamente
        </button>
      )}

      {stats.isBlocked && (
        <div style={{ 
          color: '#6c757d', 
          fontSize: '11px',
          marginTop: '8px',
          fontStyle: 'italic'
        }}>
          El bloqueo se levantará automáticamente cuando expire el tiempo.
        </div>
      )}
    </div>
  );
};

export default BackoffInfo;

//sisisis