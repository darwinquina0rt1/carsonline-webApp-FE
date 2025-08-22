import React from 'react';
import HeaderContainer from '../containers/header';
import InitialView from '../containers/initialview';
import SearchContainer from '../containers/serachs';
import TopCarContainer from '../containers/topcar';
import ServicesContainer from '../containers/services';
import FooterContainer from '../containers/flooter';

const Homepage: React.FC = () => {
  return (

    //se modifico la estructura de los componenetes, para optimizar el homepage
    <div className="homepage">
      {/* Header Container */}
      <HeaderContainer />

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