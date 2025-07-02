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
      controlesEnCours: 3
    },
    {
      id: 2,
      nom: 'BONGO',
      prenom: 'Marie-Claire',
      zone: 'Port-Gentil',
      statut: 'actif',
      controlesEnCours: 1
    },
    {
      id: 3,
      nom: 'PENDY',
      prenom: 'Vanessa',
      zone: 'Libreville',
      statut: 'actif',
      controlesEnCours: 2
    }
  ];

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
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
          <button className="header-btn">
            <Settings size={20} />
          </button>
          <div className="notifications" onClick={handleNotificationClick}>
            <Bell size={20} />
            <span className="notification-badge">{agentsActifs.length}</span>
            
            {/* Dropdown des agents actifs */}
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="dropdown-header">
                  <h3>Agents actifs sur le terrain</h3>
                  <span className="agent-count">{agentsActifs.length} agents</span>
                </div>
                <div className="agents-list">
                  {agentsActifs.map(agent => (
                    <div key={agent.id} className="agent-notification">
                      <div className="agent-avatar-small">
                        {agent.prenom.charAt(0)}{agent.nom.charAt(0)}
                      </div>
                      <div className="agent-info-small">
                        <div className="agent-name-small">
                          {agent.prenom} {agent.nom}
                        </div>
                        <div className="agent-zone-small">{agent.zone}</div>
                        <div className="agent-controls-small">
                          {agent.controlesEnCours} contrôle(s) en cours
                        </div>
                      </div>
                      <div className="status-indicator-small active"></div>
                    </div>
                  ))}
                </div>
                <div className="dropdown-footer">
                  <button className="view-all-agents">
                    Voir tous les agents
                  </button>
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