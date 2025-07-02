import React, { useState } from 'react';
import { Bell, Settings, X, MapPin, Clock, User, Phone } from 'lucide-react';

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

interface AgentTerrain {
  id: number;
  nom: string;
  prenom: string;
  role: string;
  zone: string;
  statut: 'en_mission' | 'disponible' | 'en_deplacement';
  missionActuelle?: {
    entreprise: string;
    adresse: string;
    heureDebut: string;
    typeControle: string;
  };
  telephone: string;
  position?: {
    latitude: number;
    longitude: number;
  };
}

const Header: React.FC<HeaderProps> = ({ user, onSettingsClick }) => {
  const [showAgentsModal, setShowAgentsModal] = useState(false);

  // Données des agents actifs sur le terrain
  const agentsTerrain: AgentTerrain[] = [
    {
      id: 1,
      nom: 'MBADINGA',
      prenom: 'Jean-Claude',
      role: 'Inspecteur',
      zone: 'Libreville Nord',
      statut: 'en_mission',
      missionActuelle: {
        entreprise: 'Casino Supermarché',
        adresse: 'Centre-ville, Libreville',
        heureDebut: '09:00',
        typeControle: 'Balance commerciale'
      },
      telephone: '+241 06 12 34 56',
      position: { latitude: 0.3901, longitude: 9.4544 }
    },
    {
      id: 2,
      nom: 'NDONG',
      prenom: 'Martin',
      role: 'Inspecteur',
      zone: 'Libreville Sud',
      statut: 'en_deplacement',
      telephone: '+241 06 34 56 78',
      position: { latitude: 0.4162, longitude: 9.4673 }
    },
    {
      id: 3,
      nom: 'MIGUELI',
      prenom: 'Paul',
      role: 'Technicien Qualité',
      zone: 'Libreville',
      statut: 'en_mission',
      missionActuelle: {
        entreprise: 'Petro-Gabon',
        adresse: 'Route de l\'Aéroport, Libreville',
        heureDebut: '14:30',
        typeControle: 'Pompe à essence'
      },
      telephone: '+241 77 52 42 21',
      position: { latitude: 0.3901, longitude: 9.4544 }
    },
    {
      id: 4,
      nom: 'DIESSIEMOU',
      prenom: 'Gildas',
      role: 'Technicien Métrologie Légale',
      zone: 'Libreville',
      statut: 'disponible',
      telephone: '+241 67 67 44 21'
    }
  ];

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'en_mission': return 'En mission';
      case 'disponible': return 'Disponible';
      case 'en_deplacement': return 'En déplacement';
      default: return statut;
    }
  };

  const getStatutClass = (statut: string) => {
    switch (statut) {
      case 'en_mission': return 'status-mission';
      case 'disponible': return 'status-disponible';
      case 'en_deplacement': return 'status-deplacement';
      default: return '';
    }
  };

  const agentsActifs = agentsTerrain.filter(agent => 
    agent.statut === 'en_mission' || agent.statut === 'en_deplacement'
  );

  return (
    <>
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
            <div className="notifications" onClick={() => setShowAgentsModal(true)} title="Agents sur le terrain">
              <Bell size={20} />
              <span className="notification-badge">{agentsActifs.length}</span>
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

      {/* Modal des agents sur le terrain */}
      {showAgentsModal && (
        <div className="modal-overlay" onClick={() => setShowAgentsModal(false)}>
          <div className="agents-terrain-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <User size={24} />
                <div>
                  <h2>Agents sur le terrain</h2>
                  <p>{agentsActifs.length} technicien(s) actuellement en activité</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowAgentsModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="agents-terrain-content">
              {agentsTerrain.map(agent => (
                <div key={agent.id} className={`agent-terrain-card ${getStatutClass(agent.statut)}`}>
                  <div className="agent-terrain-header">
                    <div className="agent-terrain-info">
                      <div className="agent-terrain-avatar">
                        {agent.prenom.charAt(0)}{agent.nom.charAt(0)}
                      </div>
                      <div className="agent-terrain-details">
                        <h3>{agent.prenom} {agent.nom}</h3>
                        <p className="agent-terrain-role">{agent.role}</p>
                        <div className="agent-terrain-zone">
                          <MapPin size={14} />
                          <span>{agent.zone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="agent-terrain-status">
                      <span className={`status-badge ${getStatutClass(agent.statut)}`}>
                        {getStatutLabel(agent.statut)}
                      </span>
                    </div>
                  </div>
                  
                  {agent.missionActuelle && (
                    <div className="mission-details">
                      <div className="mission-info">
                        <h4>Mission en cours</h4>
                        <div className="mission-item">
                          <strong>Entreprise:</strong> {agent.missionActuelle.entreprise}
                        </div>
                        <div className="mission-item">
                          <MapPin size={14} />
                          <span>{agent.missionActuelle.adresse}</span>
                        </div>
                        <div className="mission-item">
                          <Clock size={14} />
                          <span>Début: {agent.missionActuelle.heureDebut}</span>
                        </div>
                        <div className="mission-item">
                          <strong>Type:</strong> {agent.missionActuelle.typeControle}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="agent-terrain-actions">
                    <a href={`tel:${agent.telephone}`} className="btn-contact">
                      <Phone size={16} />
                      Appeler
                    </a>
                    {agent.position && (
                      <button className="btn-localiser">
                        <MapPin size={16} />
                        Localiser
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {agentsTerrain.length === 0 && (
                <div className="no-agents">
                  <User size={48} />
                  <h3>Aucun agent sur le terrain</h3>
                  <p>Tous les techniciens sont actuellement au bureau</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;