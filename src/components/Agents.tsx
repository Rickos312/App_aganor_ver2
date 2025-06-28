import React, { useState } from 'react';
import { Users, UserPlus, Mail, Phone, MapPin } from 'lucide-react';

interface Agent {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'inspecteur' | 'superviseur' | 'admin' | 'technicien_qualite' | 'technicien_metrologie';
  zone: string;
  statut: 'actif' | 'inactif' | 'conge';
  controlesEnCours: number;
  dernierControle: string;
}

const Agents: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');

  const agents: Agent[] = [
    {
      id: 1,
      nom: 'MBADINGA',
      prenom: 'Jean-Claude',
      email: 'jc.mbadinga@aganor.ga',
      telephone: '+241 06 12 34 56',
      role: 'inspecteur',
      zone: 'Libreville Nord',
      statut: 'actif',
      controlesEnCours: 3,
      dernierControle: '2025-01-15'
    },
    {
      id: 2,
      nom: 'BONGO',
      prenom: 'Marie-Claire',
      email: 'mc.bongo@aganor.ga',
      telephone: '+241 06 23 45 67',
      role: 'superviseur',
      zone: 'Port-Gentil',
      statut: 'actif',
      controlesEnCours: 1,
      dernierControle: '2025-01-14'
    },
    {
      id: 3,
      nom: 'NDONG',
      prenom: 'Martin',
      email: 'm.ndong@aganor.ga',
      telephone: '+241 06 34 56 78',
      role: 'inspecteur',
      zone: 'Libreville Sud',
      statut: 'actif',
      controlesEnCours: 2,
      dernierControle: '2025-01-13'
    },
    {
      id: 4,
      nom: 'OBAME',
      prenom: 'Pascal',
      email: 'p.obame@aganor.ga',
      telephone: '+241 06 45 67 89',
      role: 'admin',
      zone: 'Toutes zones',
      statut: 'actif',
      controlesEnCours: 0,
      dernierControle: '2025-01-10'
    },
    {
      id: 5,
      nom: 'MIGUELI',
      prenom: 'Paul',
      email: 'p.migueli@aganor.ga',
      telephone: '+241 77 52 42 21',
      role: 'technicien_qualite',
      zone: 'Libreville',
      statut: 'actif',
      controlesEnCours: 4,
      dernierControle: '2025-01-15'
    },
    {
      id: 6,
      nom: 'MBA EKOMY',
      prenom: 'Jean',
      email: 'j.mba-ekomy@aganor.ga',
      telephone: '+241 77 92 44 21',
      role: 'technicien_metrologie',
      zone: 'Libreville',
      statut: 'actif',
      controlesEnCours: 3,
      dernierControle: '2025-01-14'
    },
    {
      id: 7,
      nom: 'KOUMBA',
      prenom: 'Jérome',
      email: 'j.koumba@aganor.ga',
      telephone: '+241 77 92 44 21',
      role: 'technicien_metrologie',
      zone: 'Libreville',
      statut: 'conge',
      controlesEnCours: 0,
      dernierControle: '2025-01-08'
    },
    {
      id: 8,
      nom: 'DIESSIEMOU',
      prenom: 'Gildas',
      email: 'g.diessiemou@aganor.ga',
      telephone: '+241 67 67 44 21',
      role: 'technicien_metrologie',
      zone: 'Libreville',
      statut: 'actif',
      controlesEnCours: 2,
      dernierControle: '2025-01-13'
    },
    {
      id: 9,
      nom: 'OYINI',
      prenom: 'Viviane',
      email: 'v.oyini@aganor.ga',
      telephone: '+241 77 92 47 65',
      role: 'technicien_metrologie',
      zone: 'Libreville',
      statut: 'actif',
      controlesEnCours: 3,
      dernierControle: '2025-01-12'
    },
    {
      id: 10,
      nom: 'PENDY',
      prenom: 'Vanessa',
      email: 'v.pendy@aganor.ga',
      telephone: '+241 20 96 24 421',
      role: 'technicien_metrologie',
      zone: 'Libreville',
      statut: 'actif',
      controlesEnCours: 2,
      dernierControle: '2025-01-11'
    }
  ];

  const roles = ['inspecteur', 'superviseur', 'admin', 'technicien_qualite', 'technicien_metrologie'];

  const filteredAgents = agents.filter(agent => {
    return selectedRole === '' || agent.role === selectedRole;
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'inspecteur': return 'Inspecteur';
      case 'superviseur': return 'Superviseur';
      case 'admin': return 'Administrateur';
      case 'technicien_qualite': return 'Technicien Qualité';
      case 'technicien_metrologie': return 'Technicien Métrologie Légale';
      default: return role;
    }
  };

  const getRoleClass = (role: string) => {
    switch (role) {
      case 'inspecteur': return 'role-inspecteur';
      case 'superviseur': return 'role-superviseur';
      case 'admin': return 'role-admin';
      case 'technicien_qualite': return 'role-technicien-qualite';
      case 'technicien_metrologie': return 'role-technicien-metrologie';
      default: return '';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'actif': return 'Actif';
      case 'inactif': return 'Inactif';
      case 'conge': return 'En congé';
      default: return statut;
    }
  };

  const getStatutClass = (statut: string) => {
    switch (statut) {
      case 'actif': return 'actif';
      case 'inactif': return 'inactif';
      case 'conge': return 'conge';
      default: return '';
    }
  };

  // Statistiques des agents
  const statsAgents = {
    total: agents.length,
    actifs: agents.filter(a => a.statut === 'actif').length,
    enConge: agents.filter(a => a.statut === 'conge').length,
    inactifs: agents.filter(a => a.statut === 'inactif').length,
    controlesTotal: agents.reduce((sum, agent) => sum + agent.controlesEnCours, 0)
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <Users size={32} />
          <div>
            <h1>Gestion des Agents</h1>
            <p>Équipe AGANOR et affectations</p>
          </div>
        </div>
        <button className="btn-primary">
          <UserPlus size={20} />
          Nouvel agent
        </button>
      </div>

      {/* Statistiques des agents */}
      <div className="agents-stats">
        <div className="stat-item">
          <span className="stat-number">{statsAgents.total}</span>
          <span className="stat-label">Total agents</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{statsAgents.actifs}</span>
          <span className="stat-label">Agents actifs</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{statsAgents.enConge}</span>
          <span className="stat-label">En congé</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{statsAgents.controlesTotal}</span>
          <span className="stat-label">Contrôles en cours</span>
        </div>
      </div>

      <div className="filters-section">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="filter-select"
        >
          <option value="">Tous les rôles</option>
          {roles.map(role => (
            <option key={role} value={role}>{getRoleLabel(role)}</option>
          ))}
        </select>
      </div>

      <div className="agents-grid">
        {filteredAgents.map(agent => (
          <div key={agent.id} className="agent-card">
            <div className="agent-avatar">
              {agent.prenom.charAt(0)}{agent.nom.charAt(0)}
            </div>
            
            <div className="agent-info">
              <div className="agent-header">
                <h3>{agent.prenom} {agent.nom}</h3>
                <span className={`role-badge ${getRoleClass(agent.role)}`}>
                  {getRoleLabel(agent.role)}
                </span>
              </div>
              
              <div className="agent-details">
                <div className="detail-item">
                  <Mail size={16} />
                  <span>{agent.email}</span>
                </div>
                
                <div className="detail-item">
                  <Phone size={16} />
                  <span>{agent.telephone}</span>
                </div>
                
                <div className="detail-item">
                  <MapPin size={16} />
                  <span>{agent.zone}</span>
                </div>
              </div>
              
              <div className="agent-stats">
                <div className="stat-item">
                  <span className="stat-value">{agent.controlesEnCours}</span>
                  <span className="stat-label">Contrôles en cours</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {new Date(agent.dernierControle).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="stat-label">Dernier contrôle</span>
                </div>
              </div>
              
              <div className="agent-status">
                <span className={`status-indicator ${getStatutClass(agent.statut)}`}></span>
                <span>{getStatutLabel(agent.statut)}</span>
              </div>
            </div>
            
            <div className="agent-actions">
              <button className="btn-secondary">Modifier</button>
              <button className="btn-primary" disabled={agent.statut !== 'actif'}>
                Affecter contrôle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Agents;