import React, { useState } from 'react';
import '../../layouts/createcar.css';

interface VehicleFormData {
  marca: string;
  modelo: string;
  año: string;
  precio: string;
  estado: string;
  kilometraje: string;
  color: string;
  image: string;
}

interface CreateVehicleFormProps {
  onVehicleCreated?: () => void;
}

const CreateVehicleForm: React.FC<CreateVehicleFormProps> = ({ onVehicleCreated }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>({
    marca: '',
    modelo: '',
    año: '',
    precio: '',
    estado: 'Disponible',
    kilometraje: '',
    color: '',
    image: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleInputChange = (field: keyof VehicleFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch('http://localhost:3005/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al crear el vehículo');
      }

      const result = await response.json();
      console.log('Vehículo creado:', result);
      
      setSubmitMessage({
        type: 'success',
        text: '¡Vehículo creado exitosamente!'
      });

      // Limpiar formulario
      setFormData({
        marca: '',
        modelo: '',
        año: '',
        precio: '',
        estado: 'Disponible',
        kilometraje: '',
        color: '',
        image: ''
      });

      // Notificar que se creó un vehículo para actualizar la lista
      if (onVehicleCreated) {
        onVehicleCreated();
      }

      // Ocultar el formulario después de 1 segundo
      setTimeout(() => {
        setIsFormVisible(false);
        setSubmitMessage(null);
      }, 1000);

    } catch (error) {
      console.error('Error al crear vehículo:', error);
      setSubmitMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error desconocido al crear el vehículo'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      marca: '',
      modelo: '',
      año: '',
      precio: '',
      estado: 'Disponible',
      kilometraje: '',
      color: '',
      image: ''
    });
    setSubmitMessage(null);
  };

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
    if (isFormVisible) {
      // Si se está cerrando, limpiar el formulario
      handleReset();
    }
  };

  return (
    <div className="create-vehicle-container">
      <div className="create-vehicle-header">
        <h2>Vender mi Auto</h2>
        <p>Completa la información de tu vehículo para publicarlo en CarOnline</p>
        <button 
          className="btn-toggle-form" 
          onClick={toggleFormVisibility}
          type="button"
        >
          {isFormVisible ? 'Ocultar Formulario' : 'Agregar Vehículo'}
        </button>
      </div>

      {isFormVisible && (
        <form className="create-vehicle-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Información Básica</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="marca">Marca *</label>
              <input
                type="text"
                id="marca"
                value={formData.marca}
                onChange={(e) => handleInputChange('marca', e.target.value)}
                placeholder="Ej: Toyota, Honda, Ford"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modelo">Modelo *</label>
              <input
                type="text"
                id="modelo"
                value={formData.modelo}
                onChange={(e) => handleInputChange('modelo', e.target.value)}
                placeholder="Ej: Corolla, Civic, Focus"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="año">Año *</label>
              <input
                type="text"
                id="año"
                value={formData.año}
                onChange={(e) => handleInputChange('año', e.target.value)}
                placeholder="Ej: 2023"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="precio">Precio *</label>
              <input
                type="text"
                id="precio"
                value={formData.precio}
                onChange={(e) => handleInputChange('precio', e.target.value)}
                placeholder="Ej: Q360,000"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Detalles del Vehículo</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="estado">Estado *</label>
              <select
                id="estado"
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                required
              >
                <option value="Disponible">Disponible</option>
                <option value="Vendido">Vendido</option>
                <option value="En Mantenimiento">En Mantenimiento</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="kilometraje">Kilometraje *</label>
              <input
                type="text"
                id="kilometraje"
                value={formData.kilometraje}
                onChange={(e) => handleInputChange('kilometraje', e.target.value)}
                placeholder="Ej: 12,600 km"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="color">Color *</label>
              <input
                type="text"
                id="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="Ej: Blanco, Negro, Azul"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">URL de Imagen *</label>
              <input
                type="url"
                id="image"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                required
              />
            </div>
          </div>
        </div>

        {submitMessage && (
          <div className={`submit-message ${submitMessage.type}`}>
            {submitMessage.text}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Limpiar Formulario
          </button>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear Vehículo'}
          </button>
        </div>
        </form>
      )}
    </div>
  );
};

export default CreateVehicleForm;
