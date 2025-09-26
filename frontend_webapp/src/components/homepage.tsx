import React, { useState } from 'react';
import HeaderContainer from '../containers/header';
import InitialView from '../containers/initialview';
import SearchContainer from '../containers/serachs';
import TopCarContainer from '../containers/topcar';
import ServicesContainer from '../containers/services';
import FooterContainer from '../containers/flooter';
import CreateVehicleForm from '../containers/createcar/create';

interface HomepageProps {
  onLogout: () => void;
}

const Homepage: React.FC<HomepageProps> = ({ onLogout }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleVehicleCreated = () => {
    // Incrementar el trigger para que TopCarContainer se actualice
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    //se modifico la estructura de los componenetes, para optimizar el homepage
    <div className="homepage">
      {/* Header Container */}
      <HeaderContainer onLogout={onLogout} />

      {/* Initial View Container */}
      <InitialView />

      {/* Search Container */}
      <SearchContainer />

      {/* Top Car Container */}
      <TopCarContainer refreshTrigger={refreshTrigger} />

      {/* form to create a car */}
      <CreateVehicleForm onVehicleCreated={handleVehicleCreated} />

      {/* Services Container */}
      <ServicesContainer />

      {/* Footer Container */}
      <FooterContainer />
    </div>
  );
};

export default Homepage;