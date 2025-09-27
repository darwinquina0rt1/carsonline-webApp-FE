import React, { useState } from 'react';
import '../layouts/search.css';

interface SearchFilters {
  keyword: string;
  maxPrice: string;
  year: string;
}

const SearchContainer: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    maxPrice: '',
    year: ''
  });

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    // Aquí puedes implementar la lógica de búsqueda
    
    // Ejemplo de validación básica
    if (!filters.keyword && !filters.maxPrice && !filters.year) {
      alert('Por favor, ingresa al menos un criterio de búsqueda');
      return;
    }

    // Aquí puedes hacer la llamada a tu API o filtrar datos
    // Por ahora solo mostramos los filtros en consola
    alert(`Buscando: ${filters.keyword || 'Cualquier marca/modelo'} - Precio máximo: ${filters.maxPrice || 'Sin límite'} - Año: ${filters.year || 'Cualquier año'}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="search-section">
      <div className="search-container">
        <div className="search-box">
          <div className="search-input">
            <input 
              type="text" 
              placeholder="Marca, modelo o palabra clave"
              value={filters.keyword}
              onChange={(e) => handleInputChange('keyword', e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="search-input">
            <select 
              value={filters.maxPrice}
              onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            >
              <option value="">Precio máximo</option>
              <option value="50000">Q50,000</option>
              <option value="100000">Q100,000</option>
              <option value="200000">Q200,000</option>
              <option value="300000">Q300,000</option>
            </select>
          </div>
          <div className="search-input">
            <select 
              value={filters.year}
              onChange={(e) => handleInputChange('year', e.target.value)}
            >
              <option value="">Año</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
          </div>
          <button className="btn-primary" onClick={handleSearch}>
            Buscar
          </button>
        </div>
      </div>
    </section>
  );
};

export default SearchContainer;
