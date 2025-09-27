import React, { useState, useEffect } from 'react';
import { checkVehiclePermissions } from '../utils/permissionUtils';
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

interface TopCarContainerProps {
  refreshTrigger?: number;
}

const TopCarContainer: React.FC<TopCarContainerProps> = ({ refreshTrigger }) => {
  const [showAllVehicles, setShowAllVehicles] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedVehicles, setExpandedVehicles] = useState<Set<number>>(new Set());
  const [editingVehicle, setEditingVehicle] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Vehicle>>({});
  const [permissions, setPermissions] = useState({
    canUpdate: false,
    canDelete: false
  });

  useEffect(() => {
    fetchVehicles();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      // Usar verificación local de permisos
      const vehiclePermissions = await checkVehiclePermissions();
      
      console.log('🔐 Permisos de vehículos verificados:', vehiclePermissions);
      
      // Establecer permisos basados en la verificación local
      setPermissions({ 
        canUpdate: vehiclePermissions.canUpdate,
        canDelete: vehiclePermissions.canDelete
      });
      
    } catch (error) {
      console.error('❌ Error verificando permisos:', error);
      // En caso de error, denegar permisos por seguridad
      setPermissions({ canUpdate: false, canDelete: false });
    }
  };

  // Escuchar cambios en refreshTrigger para actualizar la lista
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchVehicles();
    }
  }, [refreshTrigger]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener token de autenticación
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3005/api/vehicles', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener vehículos');
      }
      
      const data = await response.json();
      
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
        // La respuesta es un array
        allVehicles = data;
      } else if (data.vehicles && Array.isArray(data.vehicles)) {
        // Si hay una propiedad vehicles en la raíz
        allVehicles = data.vehicles;
      }
      
      
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

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle.id);
    setEditForm(vehicle);
  };

  const handleCancelEdit = () => {
    setEditingVehicle(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingVehicle) return;

    try {
      // Obtener token de autenticación
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      // Probar diferentes endpoints y métodos
      let response;
      let success = false;
      
      // Intentar 1: PUT en /vehicles/{id}
      try {
        response = await fetch(`http://localhost:3005/api/vehicles/${editingVehicle}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify(editForm),
        });
        if (response.ok) success = true;
      } catch (e) {
        console.log('PUT falló, probando POST...');
      }
      
      // Intentar 2: POST en /vehicles/{id}
      if (!success) {
        try {
          response = await fetch(`http://localhost:3005/api/vehicles/${editingVehicle}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify(editForm),
          });
          if (response.ok) success = true;
        } catch (e) {
          console.log('POST en /vehicles/{id} falló, probando /vehicles/update...');
        }
      }
      
      // Intentar 3: POST en /vehicles/update
      if (!success) {
        try {
          response = await fetch(`http://localhost:3005/api/vehicles/update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify({ id: editingVehicle, ...editForm }),
          });
          if (response.ok) success = true;
        } catch (e) {
          console.log('POST en /vehicles/update falló, probando /vehicles/edit...');
        }
      }
      
      // Intentar 4: POST en /vehicles/edit
      if (!success) {
        try {
          response = await fetch(`http://localhost:3005/api/vehicles/edit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify({ id: editingVehicle, ...editForm }),
          });
          if (response.ok) success = true;
        } catch (e) {
          console.log('POST en /vehicles/edit falló');
        }
      }

      if (!success && response) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al actualizar el vehículo. Status: ${response.status}`);
      } else if (!success) {
        throw new Error('No se pudo encontrar un endpoint válido para actualizar vehículos');
      }

      // Actualizar la lista local de vehículos
      setVehicles(vehicles.map(vehicle => 
        vehicle.id === editingVehicle ? { ...vehicle, ...editForm } : vehicle
      ));

      setEditingVehicle(null);
      setEditForm({});
    } catch (err) {
      console.error('Error al actualizar vehículo:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el vehículo');
    }
  };

  const handleInputChange = (field: keyof Vehicle, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
      return;
    }

    try {
      // Obtener token de autenticación
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3005/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar el vehículo');
      }

      // Remover el vehículo de la lista local
      setVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleId));
    } catch (err) {
      console.error('Error al eliminar vehículo:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar el vehículo');
    }
  };

  if (loading) {
    return (
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Vehículos Destacados</h2>
            <p>obteniendo vehículos...</p>
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
                  
                  {editingVehicle === vehicle.id ? (
                    <div className="vehicle-edit-form">
                      <div className="edit-form-grid">
                        <input
                          type="text"
                          value={editForm.marca || ''}
                          onChange={(e) => handleInputChange('marca', e.target.value)}
                          placeholder="Marca"
                        />
                        <input
                          type="text"
                          value={editForm.modelo || ''}
                          onChange={(e) => handleInputChange('modelo', e.target.value)}
                          placeholder="Modelo"
                        />
                        <input
                          type="text"
                          value={editForm.año || ''}
                          onChange={(e) => handleInputChange('año', e.target.value)}
                          placeholder="Año"
                        />
                        <input
                          type="text"
                          value={editForm.precio || ''}
                          onChange={(e) => handleInputChange('precio', e.target.value)}
                          placeholder="Precio"
                        />
                        <input
                          type="text"
                          value={editForm.estado || ''}
                          onChange={(e) => handleInputChange('estado', e.target.value)}
                          placeholder="Estado"
                        />
                        <input
                          type="text"
                          value={editForm.kilometraje || ''}
                          onChange={(e) => handleInputChange('kilometraje', e.target.value)}
                          placeholder="Kilometraje"
                        />
                        <input
                          type="text"
                          value={editForm.color || ''}
                          onChange={(e) => handleInputChange('color', e.target.value)}
                          placeholder="Color"
                        />
                        <input
                          type="text"
                          value={editForm.image || ''}
                          onChange={(e) => handleInputChange('image', e.target.value)}
                          placeholder="URL de imagen"
                        />
                      </div>
                      <div className="edit-buttons">
                        <button className="btn-primary" onClick={handleSaveEdit}>
                          Guardar
                        </button>
                        <button className="btn-outline" onClick={handleCancelEdit}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : isExpanded ? (
                    <div className="vehicle-details-expanded">
                      <div className="vehicle-details">
                        <span>Año: {vehicle.año}</span>
                        <span>Kilometraje: {vehicle.kilometraje}</span>
                        <span>Color: {vehicle.color}</span>
                        <span className="brand-tag">{vehicle.marca}</span>
                      </div>
                      <div className="vehicle-price">
                        <span className="price">{vehicle.precio}</span>
                      </div>
                      <div className="vehicle-actions">
                        <button 
                          className="btn-outline" 
                          onClick={() => toggleVehicleDetails(vehicle.id)}
                        >
                          Ver Menos
                        </button>
                        {permissions.canUpdate && (
                          <button 
                            className="btn-edit" 
                            onClick={() => handleEditVehicle(vehicle)}
                          >
                            Editar
                          </button>
                        )}
                        {permissions.canDelete && (
                          <button 
                            className="btn-delete" 
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="vehicle-details-collapsed">
                      <div className="vehicle-price">
                        <span className="price">{vehicle.precio}</span>
                      </div>
                      <div className="vehicle-actions">
                        <button 
                          className="btn-outline" 
                          onClick={() => toggleVehicleDetails(vehicle.id)}
                        >
                          Ver Detalles
                        </button>
                        {permissions.canUpdate && (
                          <button 
                            className="btn-edit" 
                            onClick={() => handleEditVehicle(vehicle)}
                          >
                            Editar
                          </button>
                        )}
                        {permissions.canDelete && (
                          <button 
                            className="btn-delete" 
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                          >
                            Eliminar
                          </button>
                        )}
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
