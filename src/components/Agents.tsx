import React, { useState } from 'react';
import { Users, UserPlus, Mail, Phone, MapPin, X, Save, User, Navigation, Calendar, Shield } from 'lucide-react';
import { useAgents, useAgentStats } from '../hooks/useAgentsData';
import { CreateAgentData } from '../services/agentApi';

interface NouvelAgentForm {
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
  geolocalisation?: {
    latitude: string;
    longitude: string;
  };
}

const Agents: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Utiliser les hooks pour récupérer les données
  const { agents, loading, error, createAgent, refetch } = useAgents({ role: selectedRole });
  const { stats: agentStats, loading: statsLoading } = useAgentStats();

  const [nouvelAgent, setNouvelAgent] = useState<NouvelAgentForm>({
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
  const nationalites = ['Gabonaise', 'Française', 'Camerounaise', 'Équato-guinéenne', 'Congolaise', 'Tchadienne', 'Centrafricaine', 'Autre'];
  const niveauxEtude = ['Baccalauréat', 'BTS/DUT', 'Licence', 'Master', 'Doctorat', 'École d\'ingénieur', 'Formation professionnelle'];
  const typesContrat = ['cdi', 'cdd', 'stage', 'consultant'];

  const filteredAgents = agents?.filter(agent => {
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

  const getContratLabel = (type: string) => {
    switch (type) {
      case 'cdi': return 'CDI';
      case 'cdd': return 'CDD';
      case 'stage': return 'Stage';
      case 'consultant': return 'Consultant';
      default: return type;
    }
  };

  const getSituationLabel = (situation: string) => {
    switch (situation) {
      case 'celibataire': return 'Célibataire';
      case 'marie': return 'Marié(e)';
      case 'divorce': return 'Divorcé(e)';
      case 'veuf': return 'Veuf/Veuve';
      default: return situation;
    }
  };

  const handleInputChange = (field: keyof NouvelAgentForm, value: string) => {
    setNouvelAgent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'diplomes' | 'certifications', index: number, value: string) => {
    setNouvelAgent(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'diplomes' | 'certifications') => {
    setNouvelAgent(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'diplomes' | 'certifications', index: number) => {
    setNouvelAgent(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleGeolocationChange = (field: 'latitude' | 'longitude', value: string) => {
    setNouvelAgent(prev => ({
      ...prev,
      geolocalisation: {
        ...prev.geolocalisation,
        [field]: value
      }
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNouvelAgent(prev => ({
            ...prev,
            geolocalisation: {
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString()
            }
          }));
        },
        (error) => {
          alert('Erreur lors de la récupération de la géolocalisation: ' + error.message);
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par ce navigateur.');
    }
  };

  const generateMatricule = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const matricule = `AG${year}${randomNum}`;
    setNouvelAgent(prev => ({ ...prev, numeroMatricule: matricule }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!nouvelAgent.nom || !nouvelAgent.prenom || !nouvelAgent.email || !nouvelAgent.role) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier si l'email existe déjà
    if (agents?.some(agent => agent.email === nouvelAgent.email)) {
      alert('Un agent avec cet email existe déjà');
      return;
    }

    // Vérifier si le matricule existe déjà
    if (nouvelAgent.numeroMatricule && agents?.some(agent => agent.numero_matricule === nouvelAgent.numeroMatricule)) {
      alert('Un agent avec ce matricule existe déjà');
      return;
    }

    setSubmitting(true);
    
    try {
      // Préparer les données pour l'API
      const agentData: CreateAgentData = {
        nom: nouvelAgent.nom,
        prenom: nouvelAgent.prenom,
        email: nouvelAgent.email,
        telephone: nouvelAgent.telephone,
        role: nouvelAgent.role as any,
        zone: nouvelAgent.zone,
        statut: nouvelAgent.statut,
        date_embauche: nouvelAgent.dateEmbauche,
        numero_matricule: nouvelAgent.numeroMatricule,
        adresse: nouvelAgent.adresse,
        date_naissance: nouvelAgent.dateNaissance,
        lieu_naissance: nouvelAgent.lieuNaissance,
        nationalite: nouvelAgent.nationalite,
        situation_matrimoniale: nouvelAgent.situationMatrimoniale as any,
        nombre_enfants: parseInt(nouvelAgent.nombreEnfants) || 0,
        niveau_etude: nouvelAgent.niveauEtude,
        diplomes: nouvelAgent.diplomes.filter(d => d.trim() !== ''),
        certifications: nouvelAgent.certifications.filter(c => c.trim() !== ''),
        salaire: parseFloat(nouvelAgent.salaire) || undefined,
        type_contrat: nouvelAgent.typeContrat as any,
        date_fin_contrat: nouvelAgent.dateFinContrat || undefined,
        superviseur: nouvelAgent.superviseur || undefined,
        latitude: nouvelAgent.geolocalisation?.latitude ? parseFloat(nouvelAgent.geolocalisation.latitude) : undefined,
        longitude: nouvelAgent.geolocalisation?.longitude ? parseFloat(nouvelAgent.geolocalisation.longitude) : undefined,
      };

      // Créer l'agent via l'API
      await createAgent(agentData);
      
      // Réinitialiser le formulaire
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
    } catch (error) {
      console.error('Erreur lors de la création de l\'agent:', error);
      // L'erreur est déjà gérée par le hook useAgents
    } finally {
      setSubmitting(false);
    }
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
  const statsAgents = agentStats || {
    total: 0,
    actifs: 0,
    en_conge: 0,
    inactifs: 0,
    controles_en_cours: 0
  };

  // Affichage du loading
  if (loading && !agents) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="page-title">
            <Users size={32} />
            <div>
              <h1>Gestion des Agents</h1>
              <p>Chargement...</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <div>Chargement des agents...</div>
        </div>
      </div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="page-title">
            <Users size={32} />
            <div>
              <h1>Gestion des Agents</h1>
              <p>Erreur de chargement</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '200px', gap: '1rem' }}>
          <div style={{ color: '#ef4444' }}>Erreur: {error}</div>
          <button className="btn-primary" onClick={refetch}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

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
        <button className="btn-primary" onClick={() => setShowModal(true)}>
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
          <span className="stat-number">{statsAgents.en_conge}</span>
          <span className="stat-label">En congé</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{statsAgents.controles_en_cours}</span>
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
        {filteredAgents?.map(agent => (
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
                  <span className="stat-value">{agent.controlesEnCours || 0}</span>
                  <span className="stat-label">Contrôles en cours</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {agent.dernierControle ? new Date(agent.dernierControle).toLocaleDateString('fr-FR') : 'Aucun'}
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

      {/* Modal pour ajouter un nouvel agent */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h2>Nouvel Agent AGANOR</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              {/* Informations personnelles */}
              <div className="form-section">
                <h3 className="section-title">
                  <User size={20} />
                  Informations personnelles
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="nom">Nom *</label>
                    <input
                      type="text"
                      id="nom"
                      value={nouvelAgent.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      placeholder="Ex: MBADINGA"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="prenom">Prénom *</label>
                    <input
                      type="text"
                      id="prenom"
                      value={nouvelAgent.prenom}
                      onChange={(e) => handleInputChange('prenom', e.target.value)}
                      placeholder="Ex: Jean-Claude"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateNaissance">Date de naissance</label>
                    <input
                      type="date"
                      id="dateNaissance"
                      value={nouvelAgent.dateNaissance}
                      onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lieuNaissance">Lieu de naissance</label>
                    <input
                      type="text"
                      id="lieuNaissance"
                      value={nouvelAgent.lieuNaissance}
                      onChange={(e) => handleInputChange('lieuNaissance', e.target.value)}
                      placeholder="Ex: Libreville"
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="nationalite">Nationalité</label>
                    <select
                      id="nationalite"
                      value={nouvelAgent.nationalite}
                      onChange={(e) => handleInputChange('nationalite', e.target.value)}
                      disabled={submitting}
                    >
                      {nationalites.map(nat => (
                        <option key={nat} value={nat}>{nat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="situationMatrimoniale">Situation matrimoniale</label>
                    <select
                      id="situationMatrimoniale"
                      value={nouvelAgent.situationMatrimoniale}
                      onChange={(e) => handleInputChange('situationMatrimoniale', e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">Sélectionner</option>
                      <option value="celibataire">Célibataire</option>
                      <option value="marie">Marié(e)</option>
                      <option value="divorce">Divorcé(e)</option>
                      <option value="veuf">Veuf/Veuve</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="nombreEnfants">Nombre d'enfants</label>
                    <input
                      type="number"
                      id="nombreEnfants"
                      min="0"
                      value={nouvelAgent.nombreEnfants}
                      onChange={(e) => handleInputChange('nombreEnfants', e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="adresse">Adresse</label>
                    <input
                      type="text"
                      id="adresse"
                      value={nouvelAgent.adresse}
                      onChange={(e) => handleInputChange('adresse', e.target.value)}
                      placeholder="Adresse complète"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="form-section">
                <h3 className="section-title">
                  <Phone size={20} />
                  Informations de contact
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      value={nouvelAgent.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="prenom.nom@aganor.ga"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="telephone">Téléphone</label>
                    <input
                      type="tel"
                      id="telephone"
                      value={nouvelAgent.telephone}
                      onChange={(e) => handleInputChange('telephone', e.target.value)}
                      placeholder="+241 XX XX XX XX"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Informations professionnelles */}
              <div className="form-section">
                <h3 className="section-title">
                  <Shield size={20} />
                  Informations professionnelles
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="numeroMatricule">Numéro matricule</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        id="numeroMatricule"
                        value={nouvelAgent.numeroMatricule}
                        onChange={(e) => handleInputChange('numeroMatricule', e.target.value)}
                        placeholder="Ex: AG2025001"
                        disabled={submitting}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={generateMatricule}
                        style={{ whiteSpace: 'nowrap' }}
                        disabled={submitting}
                      >
                        Générer
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">Rôle *</label>
                    <select
                      id="role"
                      value={nouvelAgent.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      required
                      disabled={submitting}
                    >
                      <option value="">Sélectionner un rôle</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{getRoleLabel(role)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="zone">Zone d'intervention</label>
                    <select
                      id="zone"
                      value={nouvelAgent.zone}
                      onChange={(e) => handleInputChange('zone', e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">Sélectionner une zone</option>
                      {zones.map(zone => (
                        <option key={zone} value={zone}>{zone}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="statut">Statut</label>
                    <select
                      id="statut"
                      value={nouvelAgent.statut}
                      onChange={(e) => handleInputChange('statut', e.target.value as any)}
                      disabled={submitting}
                    >
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                      <option value="conge">En congé</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateEmbauche">Date d'embauche</label>
                    <input
                      type="date"
                      id="dateEmbauche"
                      value={nouvelAgent.dateEmbauche}
                      onChange={(e) => handleInputChange('dateEmbauche', e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="typeContrat">Type de contrat</label>
                    <select
                      id="typeContrat"
                      value={nouvelAgent.typeContrat}
                      onChange={(e) => handleInputChange('typeContrat', e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">Sélectionner</option>
                      {typesContrat.map(type => (
                        <option key={type} value={type}>{getContratLabel(type)}</option>
                      ))}
                    </select>
                  </div>

                  {nouvelAgent.typeContrat === 'cdd' && (
                    <div className="form-group">
                      <label htmlFor="dateFinContrat">Date fin de contrat</label>
                      <input
                        type="date"
                        id="dateFinContrat"
                        value={nouvelAgent.dateFinContrat}
                        onChange={(e) => handleInputChange('dateFinContrat', e.target.value)}
                        disabled={submitting}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="salaire">Salaire (XAF)</label>
                    <input
                      type="number"
                      id="salaire"
                      value={nouvelAgent.salaire}
                      onChange={(e) => handleInputChange('salaire', e.target.value)}
                      placeholder="Ex: 500000"
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="superviseur">Superviseur</label>
                    <input
                      type="text"
                      id="superviseur"
                      value={nouvelAgent.superviseur}
                      onChange={(e) => handleInputChange('superviseur', e.target.value)}
                      placeholder="Nom du superviseur direct"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Formation et qualifications */}
              <div className="form-section">
                <h3 className="section-title">
                  <Calendar size={20} />
                  Formation et qualifications
                </h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="niveauEtude">Niveau d'étude</label>
                    <select
                      id="niveauEtude"
                      value={nouvelAgent.niveauEtude}
                      onChange={(e) => handleInputChange('niveauEtude', e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">Sélectionner</option>
                      {niveauxEtude.map(niveau => (
                        <option key={niveau} value={niveau}>{niveau}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Diplômes</label>
                    {nouvelAgent.diplomes.map((diplome, index) => (
                      <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                          type="text"
                          value={diplome}
                          onChange={(e) => handleArrayChange('diplomes', index, e.target.value)}
                          placeholder="Ex: Master en Métrologie"
                          style={{ flex: 1 }}
                          disabled={submitting}
                        />
                        {nouvelAgent.diplomes.length > 1 && (
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => removeArrayItem('diplomes', index)}
                            disabled={submitting}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => addArrayItem('diplomes')}
                      style={{ marginTop: '0.5rem' }}
                      disabled={submitting}
                    >
                      Ajouter un diplôme
                    </button>
                  </div>

                  <div className="form-group full-width">
                    <label>Certifications</label>
                    {nouvelAgent.certifications.map((certification, index) => (
                      <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                          type="text"
                          value={certification}
                          onChange={(e) => handleArrayChange('certifications', index, e.target.value)}
                          placeholder="Ex: Certification ISO 9001"
                          style={{ flex: 1 }}
                          disabled={submitting}
                        />
                        {nouvelAgent.certifications.length > 1 && (
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => removeArrayItem('certifications', index)}
                            disabled={submitting}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => addArrayItem('certifications')}
                      style={{ marginTop: '0.5rem' }}
                      disabled={submitting}
                    >
                      Ajouter une certification
                    </button>
                  </div>
                </div>
              </div>

              {/* Géolocalisation */}
              <div className="form-section">
                <h3 className="section-title">
                  <Navigation size={20} />
                  Géolocalisation (optionnel)
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="latitude">Latitude</label>
                    <input
                      type="number"
                      id="latitude"
                      step="any"
                      value={nouvelAgent.geolocalisation.latitude}
                      onChange={(e) => handleGeolocationChange('latitude', e.target.value)}
                      placeholder="Ex: 0.3901"
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="longitude">Longitude</label>
                    <input
                      type="number"
                      id="longitude"
                      step="any"
                      value={nouvelAgent.geolocalisation.longitude}
                      onChange={(e) => handleGeolocationChange('longitude', e.target.value)}
                      placeholder="Ex: 9.4544"
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group full-width">
                    <button
                      type="button"
                      className="btn-secondary geolocation-btn"
                      onClick={getCurrentLocation}
                      disabled={submitting}
                    >
                      <Navigation size={16} />
                      Utiliser ma position actuelle
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <Save size={20} />
                  {submitting ? 'Enregistrement...' : 'Enregistrer l\'agent'}
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