import React, { useEffect, useState } from "react";
import { Activity, ShieldAlert, Wifi, Clock } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../layouts/Dashboardstyle.css"; // 👈 Importa el CSS

const COLORS = ["#22c55e", "#ef4444"]; // verde éxito, rojo fallos

interface TopSuspicious {
  ip: string;
  totalAttempts: number;
  successRate: number;
  isBlocked: number;
  lastAttempt: string;
}

interface DashboardResponse {
  windowMinutes: number;
  totalIPs: number;
  blockedIPs: number;
  counts: { success: number; failed: number };
  topSuspicious: TopSuspicious[];
}

const DashboardML: React.FC = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "http://localhost:3005/api/auth/dashboard";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_URL, { method: "POST" });
        if (!res.ok) throw new Error("Error en la API");
        const json: DashboardResponse = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="loading-screen">
        <Clock className="spin" size={30} /> Cargando Dashboard...
      </div>
    );

  if (error || !data)
    return <div className="error-screen">❌ {error}</div>;

  const pieData = [
    { name: "Exitosos", value: data.counts?.success || 0 },
    { name: "Fallidos", value: data.counts?.failed || 0 },
  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Dashboard Detección ML</h1>
        <p>Ventana de análisis: {data.windowMinutes} minutos</p>
      </header>

      {/* Tarjetas */}
      <section className="cards-container">
        <div className="card card-green">
          <div>
            <h3>IPs Totales</h3>
            <p className="value">{data.totalIPs}</p>
          </div>
          <Wifi size={40} />
        </div>

        <div className="card card-red">
          <div>
            <h3>IPs Bloqueadas</h3>
            <p className="value">{data.blockedIPs}</p>
          </div>
          <ShieldAlert size={40} />
        </div>

        <div className="card card-blue">
          <div>
            <h3>Intentos Totales</h3>
            <p className="value">
              {(data.counts.success || 0) + (data.counts.failed || 0)}
            </p>
          </div>
          <Activity size={40} />
        </div>
      </section>

      {/* Gráfico circular */}
      <section className="chart-section">
        <h2>Distribución de Intentos</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Tabla */}
      <section className="table-section">
        <h2>Top 10 IPs Sospechosas</h2>
        <table>
          <thead>
            <tr>
              <th>IP</th>
              <th>Intentos</th>
              <th>Tasa Éxito</th>
              <th>Bloqueada</th>
              <th>Último Intento</th>
            </tr>
          </thead>
          <tbody>
            {data.topSuspicious?.map((ip, i) => (
              <tr key={i}>
                <td>{ip.ip}</td>
                <td>{ip.totalAttempts}</td>
                <td>{ip.successRate.toFixed(2)}%</td>
                <td className={ip.isBlocked ? "blocked" : "ok"}>
                  {ip.isBlocked ? "Sí" : "No"}
                </td>
                <td>{new Date(ip.lastAttempt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

    
    </div>
  );
};

export default DashboardML;
