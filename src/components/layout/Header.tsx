import React, { useState } from 'react';
import { Bell, Settings } from 'lucide-react';

interface User {
  nom: string;
  role: string;
  avatar: string;
}

interface HeaderProps {
  user: User;
}

interface Agent {
  id: number;
  nom: string;
  prenom: string;
  zone: string;
  statut: 'actif' | 'inactif' | 'conge';
  controlesEnCours: number;
  dernierControle: string;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  // Agents actifs sur le terrain
  const agentsActifs: Agent[] = [
    {
      id: 1,
      nom: 'MBADINGA',
      prenom: 'Jean-Claude',
      zone: 'Libreville Nord',
      statut: 'actif',
      controlesEnCours: 3,
      dernierControle: '2025-01-15'
    },
    {
      id: 2,
      nom: 'BONGO',
      prenom: 'Marie-Claire',
      zone: 'Port-Gentil',
      statut: 'actif',
      controlesEnCours: 1,
      dernierControle: '2025-01-14'
    },
    {
      id: 3,
      nom: 'PENDY',
      prenom: 'Vanessa',
      zone: 'Libreville',
      statut: 'actif',
      controlesEnCours: 2,
      dernierControle: '2025-01-13'
    }
  ];

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleSettingsClick = () => {
    // Cette fonction sera connectée au module Paramètres
    const event = new CustomEvent('navigate-to-settings');
    window.dispatchEvent(event);
  };

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
          <button className="header-btn" onClick={handleSettingsClick} title="Paramètres Système">
            <Settings size={20} />
          </button>
          <div className="notifications" onClick={handleNotificationClick}>
            <Bell size={20} />
            <span className="notification-badge">{agentsActifs.length}</span>
            
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Agents actifs sur le terrain</h3>
                  <span className="agents-count">{agentsActifs.length} agent(s)</span>
                </div>
                <div className="notifications-list">
                  {agentsActifs.map(agent => (
                    <div key={agent.id} className="notification-item">
                      <div className="agent-info">
                        <div className="agent-name">
                          {agent.prenom} {agent.nom}
                        </div>
                        <div className="agent-details">
                          <span className="agent-zone">{agent.zone}</span>
                          <span className="agent-controls">{agent.controlesEnCours} contrôle(s) en cours</span>
                        </div>
                      </div>
                      <div className="agent-status">
                        <span className="status-dot active"></span>
                        <span className="status-text">Actif</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="notifications-footer">
                  <button className="view-all-btn">Voir tous les agents</button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="user-profile">
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