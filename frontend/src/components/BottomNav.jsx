import React from 'react';
import { LayoutGrid, Calendar, BarChart2, User } from 'lucide-react';
import './BottomNav.css';

const BottomNav = ({ onFabClick, activeTab, onTabChange }) => {
  return (
    <div className="bottom-nav">
      <button
        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onTabChange && onTabChange('dashboard')}
      >
        <LayoutGrid size={24} />
      </button>
      <button
        className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
        onClick={() => onTabChange && onTabChange('calendar')}
      >
        <Calendar size={24} />
      </button>

      <div className="fab-container">
        <button className="fab" onClick={onFabClick}>
          <div className="fab-inner"></div>
        </button>
      </div>

      <button
        className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => onTabChange && onTabChange('analytics')}
      >
        <BarChart2 size={24} />
      </button>
      <button className="nav-item">
        <User size={24} />
      </button>
    </div>
  );
};

export default BottomNav;
