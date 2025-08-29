import React, { useState } from 'react';
import { PlatformCard } from './components/PlatformCard';
import { DetailedView } from './components/DetailedView';
import { ContestsPage } from './components/ContestsPage';
import { PLATFORMS } from './constants';

const NavButton = ({ children, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
      active 
      ? 'bg-blue-600 text-white shadow-md' 
      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
    }`}
    >
    {children}
  </button>
);

const App = () => {
  const [view, setView] = useState('stats');
  const [detailedView, setDetailedView] = useState(null);

  const handleShowDetails = (platform, username, stats) => {
    setDetailedView({ platform, username, stats });
  };
  
  const handleBackToGrid = () => {
    setDetailedView(null);
  };

  const renderStatsView = () => {
    if (detailedView) {
      return (
        <DetailedView 
            platform={detailedView.platform}
            username={detailedView.username}
            stats={detailedView.stats}
            onBack={handleBackToGrid}
        />
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
        {PLATFORMS.map((platform) => (
          <PlatformCard 
            key={platform.id} 
            platform={platform} 
            onShowDetails={handleShowDetails}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
            Coding Dashboard
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Your all-in-one competitive programming dashboard.
          </p>
          <nav className="flex justify-center gap-4 mt-6">
            <NavButton active={view === 'stats'} onClick={() => { setView('stats'); setDetailedView(null); }}>
              Stats Fetcher
            </NavButton>
            <NavButton active={view === 'contests'} onClick={() => setView('contests')}>
              Upcoming Contests
            </NavButton>
          </nav>
        </header>

        <main>
          {view === 'stats' && renderStatsView()}
          {view === 'contests' && <ContestsPage />}
        </main>

        <footer className="text-center mt-12 text-gray-500 text-sm">
          {/* <p>Powered by public APIs. Data accuracy may vary.</p> */}
        </footer>
      </div>
    </div>
  );
};

export default App;
