import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import BottomNav from './components/BottomNav';
import MigraineLogWizard from './components/wizard/MigraineLogWizard';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/analytics/AnalyticsView.jsx';
import Login from './components/Login';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'calendar', 'analytics'

  if (!user) {
    return <Login />;
  }

  return (
    <div className="container">
      {showWizard && <MigraineLogWizard onClose={() => setShowWizard(false)} />}

      {currentView === 'dashboard' && (
        <header style={{
          padding: '20px 24px',
          textAlign: 'center',
          fontWeight: '700',
          fontSize: '17px',
          position: 'sticky',
          top: 0,
          background: 'var(--color-bg)',
          zIndex: 10,
          paddingTop: '60px'
        }}>
          Dashboard
        </header>
      )}

      <main style={{ padding: '0 24px', paddingBottom: '100px' }}>
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'calendar' && <CalendarView />}
        {currentView === 'analytics' && <AnalyticsView />}
      </main>

      <BottomNav
        activeTab={currentView}
        onTabChange={setCurrentView}
        onFabClick={() => setShowWizard(true)}
      />
    </div>
  );
}

export default App;
