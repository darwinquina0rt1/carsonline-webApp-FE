import React, { useState } from 'react';
import HeaderContainer from '../containers/header';
import InitialView from '../containers/initialview';
import SearchContainer from '../containers/serachs';
import TopCarContainer from '../containers/topcar';
import ServicesContainer from '../containers/services';
import FooterContainer from '../containers/flooter';
import CreateVehicleForm from '../containers/createcar/create';
import DashboardML from './Dashboard';
interface HomepageProps {
  onLogout: () => void;
}

const Homepage: React.FC<HomepageProps> = ({ onLogout }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleVehicleCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="homepage" style={{ padding: '20px' }}>
      {showDashboard ? (
        <div>
          <button
            onClick={() => setShowDashboard(false)}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              marginBottom: '20px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Salir del Dashboard
          </button>

          <DashboardML />
        </div>
      ) : (
        <div>
          <button
            onClick={() => setShowDashboard(true)}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              marginBottom: '20px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Ver Dashboard de Logs
          </button>

          <HeaderContainer onLogout={onLogout} />
          <InitialView />
          <SearchContainer />
          <TopCarContainer refreshTrigger={refreshTrigger} />
          <CreateVehicleForm onVehicleCreated={handleVehicleCreated} />
          <ServicesContainer />
          <FooterContainer />
        </div>
      )}
    </div>
  );
};

export default Homepage;