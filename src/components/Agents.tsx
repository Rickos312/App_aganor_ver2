import React, { useState } from 'react';
import { Users, UserPlus, Mail, Phone, MapPin, X, Save, User, Navigation, Calendar, Shield, Plus, Search, Filter } from 'lucide-react';

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
  dateEmbauche?: string;
  numeroMatricule?: string;
  adresse?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  nationalite?: string;
  situationMatrimoniale?: 'celibataire' | 'marie' | 'divorce' | 'veuf';
  nombreEnfants?: number;
  niveauEtude?: string;
  diplomes?: string[];
  certifications?: string[];
  salaire?: number;
  typeContrat?: 'cdi' | 'cdd' | 'stage' | 'consultant';
  dateFinContrat?: string;
  superviseur?: string;
  geolocalisation?: {
    latitude: number;
    longitude: number;
  };
}

interface NouvelAgent {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'inspecteur' | 'superviseur' | 'admin' | 'technicien_qualite' | 'technicien_metrologie' | '';
  zone: string;
  statut: 'actif' | 'inactif' | 'conge';
  dateEmbauche: string;
  numeroMatricule: string;
  adresse: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  situationMatrimoniale: 'celibataire' | 'marie' | 'divorce' | 'veuf' | '';
  nombreEnfants: string;
  niveauEtude: string;
  diplomes: string[];
  certifications: string[];
  salaire: string;
  typeContrat: 'cdi' | 'cdd' | 'stage' | 'consultant' | '';
  dateFinContrat: string;
  superviseur: string;
  geolocalisation: {
    latitude: string;
    longitude: string;
  };
}

const Agents: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [agents, setAgents] = useState<Agent[]>([
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
  ]);

  const [nouvelAgent, setNouvelAgent] = useState<NouvelAgent>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: '',
    zone: '',
    statut: 'actif',
    dateEmbauche: '',
    numeroMatricule: '',
    adresse: '',
    dateNaissance: '',
    lieuNaissance: '',
    nationalite: 'Gabonaise',
    situationMatrimoniale: '',
    nombreEnfants: '0',
    niveauEtude: '',
    diplomes: [''],
    certifications: [''],
    salaire: '',
    typeContrat: '',
    dateFinContrat: '',
    superviseur: '',
    geolocalisation: {
      latitude: '',
      longitude: ''
    }
  });

  const roles = ['inspecteur', 'superviseur', 'admin', 'technicien_qualite', 'technicien_metrologie'];
  const zones = ['Libreville Nord', 'Libreville Sud', 'Libreville Centre', 'Port-Gentil', 'Franceville', 'Oyem', 'Lambaréné', 'Mouila', 'Tchibanga', 'Toutes zones'];

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === '' || agent.role === selectedRole;
    return matchesSearch && matchesRole;
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
      case 'actif': return 'status-actif';
      case 'inactif': return 'status-inactif';
      case 'conge': return 'status-conge';
      default: return '';
    }
  };

  const handleInputChange = (field: keyof NouvelAgent, value: string) => {
    setNouvelAgent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nouvelAgent.nom || !nouvelAgent.prenom || !nouvelAgent.email || !nouvelAgent.role) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (agents.some(agent => agent.email === nouvelAgent.email)) {
      alert('Un agent avec cet email existe déjà');
      return;
    }

    const newId = Math.max(...agents.map(a => a.id)) + 1;
    const newAgent: Agent = {
      id: newId,
      nom: nouvelAgent.nom,
      prenom: nouvelAgent.prenom,
      email: nouvelAgent.email,
      telephone: nouvelAgent.telephone,
      role: nouvelAgent.role as any,
      zone: nouvelAgent.zone,
      statut: nouvelAgent.statut,
      controlesEnCours: 0,
      dernierControle: new Date().toISOString().split('T')[0],
      dateEmbauche: nouvelAgent.dateEmbauche,
      numeroMatricule: nouvelAgent.numeroMatricule,
      adresse: nouvelAgent.adresse,
      dateNaissance: nouvelAgent.dateNaissance,
      lieuNaissance: nouvelAgent.lieuNaissance,
      nationalite: nouvelAgent.nationalite,
      situationMatrimoniale: nouvelAgent.situationMatrimoniale as any,
      nombreEnfants: parseInt(nouvelAgent.nombreEnfants) || 0,
      niveauEtude: nouvelAgent.niveauEtude,
      diplomes: nouvelAgent.diplomes.filter(d => d.trim() !== ''),
      certifications: nouvelAgent.certifications.filter(c => c.trim() !== ''),
      salaire: parseFloat(nouvelAgent.salaire) || undefined,
      typeContrat: nouvelAgent.typeContrat as any,
      dateFinContrat: nouvelAgent.dateFinContrat || undefined,
      superviseur: nouvelAgent.superviseur || undefined,
      geolocalisation: nouvelAgent.geolocalisation.latitude && nouvelAgent.geolocalisation.longitude ? {
        latitude: parseFloat(nouvelAgent.geolocalisation.latitude),
        longitude: parseFloat(nouvelAgent.geolocalisation.longitude)
      } : undefined
    };

    setAgents(prev => [...prev, newAgent]);
    
    setNouvelAgent({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      role: '',
      zone: '',
      statut: 'actif',
      dateEmbauche: '',
      numeroMatricule: '',
      adresse: '',
      dateNaissance: '',
      lieuNaissance: '',
      nationalite: 'Gabonaise',
      situationMatrimoniale: '',
      nombreEnfants: '0',
      niveauEtude: '',
      diplomes: [''],
      certifications: [''],
      salaire: '',
      typeContrat: '',
      dateFinContrat: '',
      superviseur: '',
      geolocalisation: {
        latitude: '',
        longitude: ''
      }
    });
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNouvelAgent({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      role: '',
      zone: '',
      statut: 'actif',
      dateEmbauche: '',
      numeroMatricule: '',
      adresse: '',
      dateNaissance: '',
      lieuNaissance: '',
      nationalite: 'Gabonaise',
      situationMatrimoniale: '',
      nombreEnfants: '0',
      niveauEtude: '',
      diplomes: [''],
      certifications: [''],
      salaire: '',
      typeContrat: '',
      dateFinContrat: '',
      superviseur: '',
      geolocalisation: {
        latitude: '',
        longitude: ''
      }
    });
  };

  // Statistiques des agents
  const statsAgents = {
    total: agents.length,
    actifs: agents.filter(a => a.statut === 'actif').length,
    enConge: agents.filter(a => a.statut === 'conge').length,
    controlesTotal: agents.reduce((sum, agent) => sum + agent.controlesEnCours, 0)
  };

  return (
    <div className="agents-page">
      {/* Header avec dégradé violet */}
      <div className="agents-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-icon">
              <Users size={32} />
            </div>
            <div className="title-text">
              <h1>Gestion des Agents</h1>
              <p>Équipe AGANOR et affectations</p>
            </div>
          </div>
          <button className="btn-add-agent" onClick={() => setShowModal(true)}>
            <UserPlus size={20} />
            Nouvel agent
          </button>
        </div>
      </div>

      {/* Statistiques avec design moderne */}
      <div className="agents-stats-modern">
        <div className="stat-card-modern primary">
          <div className="stat-number">{statsAgents.total}</div>
          <div className="stat-label">Total agents</div>
        </div>
        <div className="stat-card-modern success">
          <div className="stat-number">{statsAgents.actifs}</div>
          <div className="stat-label">Agents actifs</div>
        </div>
        <div className="stat-card-modern warning">
          <div className="stat-number">{statsAgents.enConge}</div>
          <div className="stat-label">En congé</div>
        </div>
        <div className="stat-card-modern info">
          <div className="stat-number">{statsAgents.controlesTotal}</div>
          <div className="stat-label">Contrôles en cours</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="agents-filters">
        <div className="search-filter">
          <div className="search-input-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher un agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-modern"
            />
          </div>
        </div>
        <div className="role-filter">
          <Filter size={20} />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="filter-select-modern"
          >
            <option value="">Tous les rôles</option>
            {roles.map(role => (
              <option key={role} value={role}>{getRoleLabel(role)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grille des agents avec design moderne */}
      <div className="agents-grid-modern">
        {filteredAgents.map(agent => (
          <div key={agent.id} className="agent-card-modern">
            <div className="agent-card-header">
              <div className="agent-avatar-modern">
                {agent.prenom.charAt(0)}{agent.nom.charAt(0)}
              </div>
              <div className="agent-status-indicator">
                <span className={`status-dot ${getStatutClass(agent.statut)}`}></span>
                <span className="status-text">{getStatutLabel(agent.statut)}</span>
              </div>
            </div>
            
            <div className="agent-info-modern">
              <h3 className="agent-name">{agent.prenom} {agent.nom}</h3>
              <div className={`agent-role-badge ${getRoleClass(agent.role)}`}>
                {getRoleLabel(agent.role)}
              </div>
              
              <div className="agent-details-modern">
                <div className="detail-row">
                  <Mail size={16} />
                  <span>{agent.email}</span>
                </div>
                <div className="detail-row">
                  <Phone size={16} />
                  <span>{agent.telephone}</span>
                </div>
                <div className="detail-row">
                  <MapPin size={16} />
                  <span>{agent.zone}</span>
                </div>
              </div>
              
              <div className="agent-metrics">
                <div className="metric-item">
                  <div className="metric-number">{agent.controlesEnCours}</div>
                  <div className="metric-label">Contrôles en cours</div>
                </div>
                <div className="metric-item">
                  <div className="metric-date">
                    {new Date(agent.dernierControle).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="metric-label">Dernier contrôle</div>
                </div>
              </div>
            </div>
            
            <div className="agent-actions-modern">
              <button className="btn-action secondary">Modifier</button>
              <button 
                className="btn-action primary" 
                disabled={agent.statut !== 'actif'}
              >
                Affecter contrôle
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal pour ajouter un nouvel agent */}
      {showModal && (
        <div className="modal-overlay-modern">
          <div className="modal-content-modern">
            <div className="modal-header-modern">
              <h2>Nouvel Agent AGANOR</h2>
              <button className="modal-close-modern" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form-modern">
              <div className="form-section-modern">
                <h3 className="section-title-modern">
                  <User size={20} />
                  Informations personnelles
                </h3>
                <div className="form-grid-modern">
                  <div className="form-group-modern">
                    <label htmlFor="nom">Nom *</label>
                    <input
                      type="text"
                      id="nom"
                      value={nouvelAgent.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      placeholder="Ex: MBADINGA"
                      required
                    />
                  </div>

                  <div className="form-group-modern">
                    <label htmlFor="prenom">Prénom *</label>
                    <input
                      type="text"
                      id="prenom"
                      value={nouvelAgent.prenom}
                      onChange={(e) => handleInputChange('prenom', e.target.value)}
                      placeholder="Ex: Jean-Claude"
                      required
                    />
                  </div>

                  <div className="form-group-modern">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      value={nouvelAgent.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="prenom.nom@aganor.ga"
                      required
                    />
                  </div>

                  <div className="form-group-modern">
                    <label htmlFor="telephone">Téléphone</label>
                    <input
                      type="tel"
                      id="telephone"
                      value={nouvelAgent.telephone}
                      onChange={(e) => handleInputChange('telephone', e.target.value)}
                      placeholder="+241 XX XX XX XX"
                    />
                  </div>

                  <div className="form-group-modern">
                    <label htmlFor="role">Rôle *</label>
                    <select
                      id="role"
                      value={nouvelAgent.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      required
                    >
                      <option value="">Sélectionner un rôle</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{getRoleLabel(role)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-modern">
                    <label htmlFor="zone">Zone d'intervention</label>
                    <select
                      id="zone"
                      value={nouvelAgent.zone}
                      onChange={(e) => handleInputChange('zone', e.target.value)}
                    >
                      <option value="">Sélectionner une zone</option>
                      {zones.map(zone => (
                        <option key={zone} value={zone}>{zone}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-actions-modern">
                <button type="button" className="btn-cancel-modern" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-save-modern">
                  <Save size={20} />
                  Enregistrer l'agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;