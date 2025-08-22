import React from 'react';
import HeaderContainer from '../containers/header';
import InitialView from '../containers/initialview';
import SearchContainer from '../containers/serachs';
import TopCarContainer from '../containers/topcar';
import ServicesContainer from '../containers/services';
import FooterContainer from '../containers/flooter';

interface HomepageProps {
  onLogout: () => void;
}

const Homepage: React.FC<HomepageProps> = ({ onLogout }) => {
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
      <TopCarContainer />

      {/* Services Container */}
      <ServicesContainer />

      {/* Footer Container */}
      <FooterContainer />
    </div>
  );
};

export default Homepage;