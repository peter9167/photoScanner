import React from 'react';
import './App.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ServiceOverview from './components/ServiceOverview/ServiceOverview';
import PhotoAnalysis from './components/PhotoAnalysis/PhotoAnalysis';
// import ModeSelector from './components/ModeSelector/ModeSelector';
// import KeyFeatures from './components/KeyFeatures/KeyFeatures';
// import TechnicalConsiderations from './components/TechnicalConsiderations/TechnicalConsiderations';
// import ExpectedEffects from './components/ExpectedEffects/ExpectedEffects';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="App-main container">
        <ServiceOverview />
        <PhotoAnalysis />
        {/* <ModeSelector /> */}
        {/* <KeyFeatures /> */}
        {/* <TechnicalConsiderations /> */}
        {/* <ExpectedEffects /> */}
      </main>
      <Footer />
    </div>
  );
}

export default App; 