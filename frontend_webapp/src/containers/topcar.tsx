import React, { useState, useEffect } from 'react';
import '../layouts/topcar.css';

interface Vehicle {
  id: number;
  marca: string;
  modelo: string;
  año: string;
  precio: string;
  estado: string;
  kilometraje: string;
  color: string;
  image: string;
}

const TopCarContainer: React.FC = () => {
  const [showAllVehicles, setShowAllVehicles] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedVehicles, setExpandedVehicles] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3005/api/vehicles');
      if (!response.ok) {
        throw new Error('Error al cargar los vehículos');
      }
      
      const data = await response.json();
      console.log('Respuesta de la API:', data);
      
      // Manejar diferentes estructuras posibles de la respuesta
      let allVehicles: Vehicle[] = [];
      
      if (data.data && typeof data.data === 'object') {
        // Si data.data es un objeto con marcas
        if (Array.isArray(data.data)) {
          // Si data.data es directamente un array de vehículos
          allVehicles = data.data;
        } else {
          // Si data.data es un objeto con marcas como propiedades
          Object.values(data.data).forEach((brandData: any) => {
            if (brandData && brandData.vehicles && Array.isArray(brandData.vehicles)) {
              allVehicles.push(...brandData.vehicles);
            } else if (Array.isArray(brandData)) {
              // Si brandData es directamente un array de vehículos
              allVehicles.push(...brandData);
            }
          });
        }
      } else if (Array.isArray(data)) {
        // Si la respuesta es directamente un array
        allVehicles = data;
      } else if (data.vehicles && Array.isArray(data.vehicles)) {
        // Si hay una propiedad vehicles en la raíz
        allVehicles = data.vehicles;
      }
      
      console.log('Vehículos procesados:', allVehicles);
      
      if (allVehicles.length === 0) {
        throw new Error('No se encontraron vehículos en la respuesta de la API');
      }
      
      setVehicles(allVehicles);
    } catch (err) {
      console.error('Error completo:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const toggleVehicleDetails = (vehicleId: number) => {
    const newExpanded = new Set(expandedVehicles);
    if (newExpanded.has(vehicleId)) {
      newExpanded.delete(vehicleId);
    } else {
      newExpanded.add(vehicleId);
    }
    setExpandedVehicles(newExpanded);
  };

  // Determinar qué vehículos mostrar basado en el estado
  const vehiclesToShow = showAllVehicles ? vehicles : vehicles.slice(0, 6);

  const handleShowAllVehicles = () => {
    setShowAllVehicles(true);
  };

  const handleShowLess = () => {
    setShowAllVehicles(false);
  };

  if (loading) {
    return (
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Vehículos Destacados</h2>
            <p>Cargando vehículos...</p>
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Vehículos Destacados</h2>
            <p>Error: {error}</p>
          </div>
          <button className="btn-outline" onClick={fetchVehicles}>
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-section">
      <div className="container">
        <div className="section-header">
          <h2>Vehículos Destacados</h2>
          <p>Los mejores vehículos seleccionados para ti</p>
        </div>
        <div className="vehicles-grid">
          {vehiclesToShow.map((vehicle) => {
            const isExpanded = expandedVehicles.has(vehicle.id);
            return (
              <div key={vehicle.id} className="vehicle-card">
                <div className="vehicle-image">
                  <img src={vehicle.image} alt={`${vehicle.marca} ${vehicle.modelo}`} />
                  <div className="vehicle-badge">Destacado</div>
                  <div className={`estado-badge estado-${vehicle.estado.toLowerCase().replace(' ', '-')}`}>
                    {vehicle.estado}
                  </div>
                </div>
                <div className="vehicle-info">
                  <h3>{vehicle.marca} {vehicle.modelo}</h3>
                  
                  {isExpanded ? (
                    <div className="vehicle-details-expanded">
                      <div className="vehicle-details">
                        <span>Año: {vehicle.año}</span>
                        <span>Kilometraje: {vehicle.kilometraje}</span>
                        <span>Color: {vehicle.color}</span>
                        <span className="brand-tag">{vehicle.marca}</span>
                      </div>
                      <div className="vehicle-price">
                        <span className="price">{vehicle.precio}</span>
                        <button 
                          className="btn-outline" 
                          onClick={() => toggleVehicleDetails(vehicle.id)}
                        >
                          Ver Menos
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="vehicle-details-collapsed">
                      <div className="vehicle-price">
                        <span className="price">{vehicle.precio}</span>
                        <button 
                          className="btn-outline" 
                          onClick={() => toggleVehicleDetails(vehicle.id)}
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {vehicles.length > 6 && (
          <div className="section-footer">
            {!showAllVehicles ? (
              <button className="btn-outline btn-large" onClick={handleShowAllVehicles}>
                Ver Todos los Vehículos ({vehicles.length})
              </button>
            ) : (
              <button className="btn-outline btn-large" onClick={handleShowLess}>
                Ver Menos
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopCarContainer;
