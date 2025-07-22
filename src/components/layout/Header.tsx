import React from 'react';
import { Mail, Settings, LogOut } from 'lucide-react';

interface User {
  nom: string;
  role: string;
  avatar: string;
}

interface HeaderProps {
  user: User;
  onLogout?: () => void;
  isAuthenticated?: boolean;
  unreadMessages?: number;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, isAuthenticated = false, unreadMessages = 0 }) => {
  return (
    <header className="app-header">
      <div className="header-background-gradient"></div>
      
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
          {onLogout && (
            <button className="header-btn logout-btn" onClick={onLogout} title="Se déconnecter">
              <LogOut size={20} />
            </button>
          )}
          <button className="header-btn settings-btn" title="Paramètres">
            <Settings size={20} />
          </button>
          <button className="header-btn notifications-btn" title="Messages">
            <Mail size={20} />
            {unreadMessages > 0 && (
              <span className="notification-badge">{unreadMessages}</span>
            )}
          </button>
        </div>
        
        <div className={`user-profile ${user ? 'user-profile-connected' : ''}`}>
          <div className="user-info">
            <span className="user-name">{user.nom}</span>
            <span className="user-role">{user.role}</span>
          </div>
          <div className="user-avatar-container">
            <div className="user-avatar">
              {user.avatar}
            </div>
            <div className={`connection-status-dot ${isAuthenticated ? 'connected' : 'disconnected'}`}></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;