import React from 'react';
import { Bell, Settings } from 'lucide-react';

interface User {
  nom: string;
  role: string;
  statut: string;
  avatar: string;
}

interface HeaderProps {
  user: User;
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSettingsClick }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-container">
          <img src="/aganor-logo.png" alt="AGANOR" className="logo-image" />
          <div className="logo-text">
            <h1>AGANOR</h1>
            <span className="company-tagline">Votre passerelle vers la Qualité</span>
          </div>
        </div>
      </div>
      
      <div className="header-right">
        <div className="header-actions">
          <button className="header-btn" onClick={onSettingsClick} title="Paramètres Système">
            <Settings size={20} />
          </button>
          <div className="notifications">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </div>
        </div>
        
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user.nom}</span>
            <div className="user-role-status">
              <span className="user-role">{user.role}</span>
              <div className="user-status">
                <span className={`status-indicator ${user.statut}`}></span>
                <span className="status-text">Actif</span>
              </div>
            </div>
          </div>
          <div className="user-avatar">
            {user.avatar}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;