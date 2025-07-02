import React, { useState } from 'react';
import { Bell, Settings, MapPin, Clock, User, X } from 'lucide-react';

interface User {
  nom: string;
  role: string;
  avatar: string;
}

interface HeaderProps {
  user: User;
}

interface AgentActif {
  id: number;
  nom: string;
  prenom: string;
  role: string;
  zone: string;
  statut: 'en_mission' | 'disponible' | 'en_pause';
  controlesEnCours: number;
  dernierSignal: string;
  latitude?: number;
  longitude?: number;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  // Agents actifs sur le terrain
  const agentsActifs: AgentActif[] = [
    {
      id: 1,
      nom: 'MBADINGA',
      prenom: 'Jean-Claude',
      role: 'Inspecteur',
      zone: 'Libreville Nord',
      statut: 'en_mission',
      controlesEnCours: 1,
      dernierSignal: '14:25',
      latitude: 0.3901,
      longitude: 9.4544
    },
    {
      id: 2,
      nom: 'BONGO',
      prenom: 'Marie-Claire',
      role: 'Superviseur',
      zone: 'Port-Gentil',
      statut: 'en_mission',
      controlesEnCours: 1,
      dernierSignal: '14:20',
      latitude: -0.7193,
      longitude: 8.7815
    },
    {
      id: 3,
      nom: 'PENDY',
      prenom: 'Vanessa',
      role: 'Technicienne Métrologie',
      zone: 'Libreville',
      statut: 'disponible',
      controlesEnCours: 0,
      dernierSignal: '14:30',
      latitude: 0.3901,
      longitude: 9.4544
    }
  ];

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_mission': return '#ef4444'; // Rouge
      case 'disponible': return '#22c55e'; // Vert
      case 'en_pause': return '#f59e0b'; // Orange
      default: return '#6b7280';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'en_mission': return 'En mission';
      case 'disponible': return 'Disponible';
      case 'en_pause': return 'En pause';
      default: return statut;
    }
  };

  const handleNavigateToSettings = () => {
    // Cette fonction sera connectée à la navigation vers les paramètres
    console.log('Navigation vers Paramètres Système');
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
          <button 
            className="header-btn settings-btn" 
            onClick={handleNavigateToSettings}
            title="Paramètres Système"
          >
            <Settings size={20} />
          </button>
          
          <div className="notifications-container">
            <button 
              className="notifications-bell"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Agents actifs sur le terrain"
            >
              <div className="bell-icon">
                <Bell size={20} />
              </div>
              <span className="notification-badge">{agentsActifs.length}</span>
            </button>

            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="dropdown-header">
                  <h3>Agents sur le terrain</h3>
                  <button 
                    className="close-dropdown"
                    onClick={() => setShowNotifications(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="agents-list">
                  {agentsActifs.map(agent => (
                    <div key={agent.id} className="agent-item">
                      <div className="agent-avatar">
                        {agent.prenom.charAt(0)}{agent.nom.charAt(0)}
                      </div>
                      
                      <div className="agent-info">
                        <div className="agent-name">
                          {agent.prenom} {agent.nom}
                        </div>
                        <div className="agent-role">{agent.role}</div>
                        
                        <div className="agent-details">
                          <div className="detail-item">
                            <MapPin size={12} />
                            <span>{agent.zone}</span>
                          </div>
                          <div className="detail-item">
                            <Clock size={12} />
                            <span>Signal: {agent.dernierSignal}</span>
                          </div>
                        </div>
                        
                        <div className="agent-mission">
                          {agent.controlesEnCours > 0 ? (
                            <span className="mission-active">
                              {agent.controlesEnCours} contrôle(s) en cours
                            </span>
                          ) : (
                            <span className="mission-inactive">
                              Aucun contrôle en cours
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="agent-status">
                        <div 
                          className="status-indicator"
                          style={{ backgroundColor: getStatutColor(agent.statut) }}
                        ></div>
                        <span className="status-text">
                          {getStatutLabel(agent.statut)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="dropdown-footer">
                  <button className="view-all-btn">
                    <User size={14} />
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