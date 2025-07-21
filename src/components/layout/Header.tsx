import React from 'react';
import { Bell, Settings, LogOut } from 'lucide-react';

interface User {
  nom: string;
  role: string;
  avatar: string;
}

interface HeaderProps {
  user: User;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
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
          <button className="header-btn">
            <Settings size={20} />
          </button>
          <div className="notifications">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </div>
          {onLogout && (
            <button className="header-btn logout-btn" onClick={onLogout} title="Se déconnecter">
              <LogOut size={20} />
            </button>
          )}
        </div>
        
        <div className={`user-profile ${user ? 'user-profile-connected' : ''}`}>
          <div className="user-info">
            <span className="user-name">{user.nom}</span>
            <span className="user-role">{user.role}</span>
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