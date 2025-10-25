import React, { useEffect, useState } from 'react';

interface AuthLog {
  _id: string;
  userId: string;
  username: string;
  email: string;
  role: string;
  loginTime: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed';
  message?: string;
  authProvider: 'local' | 'google';
}

const AuthLogsDashboard: React.FC = () => {
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://localhost:3005/api/auth/logs');
        const data = await res.json();
        if (data.success) {
          setLogs(data.items);
        }
      } catch (error) {
        console.error('Error al obtener logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '40px', color: '#555' }}>
        <div
          style={{
            border: '4px solid #ddd',
            borderTop: '4px solid #4F46E5',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            margin: '0 auto 10px',
            animation: 'spin 1s linear infinite',
          }}
        ></div>
        <p>Cargando logs...</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '30px',
        fontFamily: 'Inter, sans-serif',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
      }}
    >
      <h2
        style={{
          fontSize: '1.8rem',
          marginBottom: '20px',
          fontWeight: 600,
          color: '#111827',
        }}
      >
        Dashboard de Autenticación
      </h2>

      <div
        style={{
          overflowX: 'auto',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backgroundColor: '#fff',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={thStyle}>Usuario</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>IP</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log._id}
                style={{
                  backgroundColor: '#fff',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#f9fafb')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = '#fff')
                }
              >
                <td style={tdStyle}>
                  <strong>{log.username}</strong> <br />
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    {log.role}
                  </span>
                </td>
                <td style={tdStyle}>{log.email}</td>
                <td style={tdStyle}>{log.ipAddress || 'N/A'}</td>
                <td style={{ ...tdStyle }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      color: log.status === 'success' ? '#065f46' : '#991b1b',
                      backgroundColor:
                        log.status === 'success' ? '#d1fae5' : '#fee2e2',
                      fontSize: '0.85rem',
                    }}
                  >
                    {log.status.toUpperCase()}
                  </span>
                </td>
                <td style={tdStyle}>
                  {new Date(log.loginTime).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// estilos compartidos
const thStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.9rem',
  color: '#374151',
  borderBottom: '2px solid #e5e7eb',
};

const tdStyle: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid #e5e7eb',
  fontSize: '0.9rem',
  color: '#111827',
};

export default AuthLogsDashboard;


//sisas