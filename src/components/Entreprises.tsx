import React, { useState } from 'react';
import { Search, Plus, Building2, MapPin, Phone, Mail, X, Save, User, Settings, Navigation } from 'lucide-react';
import '../styles/entreprises.css';
interface Instrument {
  type: string;
  marque: string;
  modele: string;
  numeroSerie: string;
  localisation: string;
}

interface Entreprise {
  id: number;
  siret: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  secteur: string;
  statut: 'conforme' | 'non_conforme' | 'en_attente';
  dernierControle: string;
  instruments?: Instrument[];
  geolocalisation?: {
    latitude: number;
    longitude: number;
  };
  pointContact?: {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
  };
}

interface NouvelleEntreprise {
  siret: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  secteur: string;
  instruments: Instrument[];
  geolocalisation: {
    latitude: string;
    longitude: string;
  };
  pointContact: {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
  };
}

const Entreprises: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSecteur, setSelectedSecteur] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([
    {
      id: 1,
      siret: '12345678901234',
      nom: 'SOGATRA',
      adresse: 'Boulevard de la République, Libreville',
      telephone: '+241 01 23 45 67',
      email: 'contact@sogatra.ga',
      secteur: 'Transport',
      statut: 'conforme',
      dernierControle: '2025-01-15'
    },
    {
      id: 2,
      siret: '23456789012345',
      nom: 'Total Gabon',
      adresse: 'Avenue du Colonel Parant, Port-Gentil',
      telephone: '+241 02 34 56 78',
      email: 'info@total.ga',
      secteur: 'Pétrole',
      statut: 'non_conforme',
      dernierControle: '2025-01-14'
    },
    {
      id: 3,
      siret: '34567890123456',
      nom: 'Pharmacie Centrale',
      adresse: 'Quartier Louis, Libreville',
      telephone: '+241 03 45 67 89',
      email: 'contact@pharmacie-centrale.ga',
      secteur: 'Santé',
      statut: 'conforme',
      dernierControle: '2025-01-13'
    },
    {
      id: 4,
      siret: '45678901234567',
      nom: 'Casino Supermarché',
      adresse: 'Centre-ville, Libreville',
      telephone: '+241 04 56 78 90',
      email: 'info@casino.ga',
      secteur: 'Commerce',
      statut: 'en_attente',
      dernierControle: '2025-01-10'
    },
    {
      id: 5,
      siret: '56789012345678',
      nom: 'Shell Gabon',
      adresse: 'Zone Industrielle, Port-Gentil',
      telephone: '+241 05 67 89 01',
      email: 'contact@shell.ga',
      secteur: 'Pétrole',
      statut: 'conforme',
      dernierControle: '2025-01-12'
    },
    {
      id: 6,
      siret: '67890123456789',
      nom: 'Carrefour Immaculé',
      adresse: 'Quartier Immaculé Conception, Libreville',
      telephone: '+241 06 78 90 12',
      email: 'contact@carrefour-immacule.ga',
      secteur: 'Commerce',
      statut: 'en_attente',
      dernierControle: '2025-01-11',
      instruments: [
        {
          type: 'Balance commerciale',
          marque: 'Mettler Toledo',
          modele: 'XS204',
          numeroSerie: 'MT2025001',
          localisation: 'Caisse principale'
        }
      ],
      pointContact: {
        nom: 'OBIANG',
        prenom: 'Marie-France',
        telephone: '+241 06 78 90 13',
        email: 'marie.obiang@carrefour-immacule.ga'
      }
    },
    {
      id: 7,
      siret: '78901234567890',
      nom: 'Station Total Gabon',
      adresse: 'Boulevard Triomphal, Libreville',
      telephone: '+241 07 89 01 23',
      email: 'station@total-gabon.ga',
      secteur: 'Pétrole',
      statut: 'conforme',
      dernierControle: '2025-01-09',
      instruments: [
        {
          type: 'Pompe à essence',
          marque: 'Gilbarco',
          modele: 'Encore 700S',
          numeroSerie: 'GB2025001',
          localisation: 'Îlot 1'
        }
      ],
      pointContact: {
        nom: 'MBOUMBA',
        prenom: 'Jean-Pierre',
        telephone: '+241 07 89 01 24',
        email: 'jp.mboumba@total-gabon.ga'
      }
    },
    {
      id: 8,
      siret: '89012345678901',
      nom: 'Petro-Gabon',
      adresse: 'Route de l\'Aéroport, Libreville',
      telephone: '+241 08 90 12 34',
      email: 'info@petro-gabon.ga',
      secteur: 'Pétrole',
      statut: 'non_conforme',
      dernierControle: '2025-01-08',
      instruments: [
        {
          type: 'Pompe à essence',
          marque: 'Wayne',
          modele: 'Helix 6000',
          numeroSerie: 'WY2025001',
          localisation: 'Îlot principal'
        }
      ],
      pointContact: {
        nom: 'NZIGOU',
        prenom: 'Patrick',
        telephone: '+241 08 90 12 35',
        email: 'p.nzigou@petro-gabon.ga'
      }
    },
    {
      id: 9,
      siret: '90123456789012',
      nom: 'ETS-Jean Pneu',
      adresse: 'Quartier Akanda, Libreville',
      telephone: '+241 09 01 23 45',
      email: 'contact@ets-jean-pneu.ga',
      secteur: 'Commerce',
      statut: 'en_attente',
      dernierControle: '2025-01-07',
      instruments: [
        {
          type: 'Manomètre à pression',
          marque: 'Bourdon Haenni',
          modele: 'BH-250',
          numeroSerie: 'BH2025001',
          localisation: 'Atelier principal'
        }
      ],
      pointContact: {
        nom: 'MOUKETOU',
        prenom: 'Jean',
        telephone: '+241 09 01 23 46',
        email: 'j.mouketou@ets-jean-pneu.ga'
      }
    }
  ]);

  const [nouvelleEntreprise, setNouvelleEntreprise] = useState<NouvelleEntreprise>({
    siret: '',
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    secteur: '',
    instruments: [
      { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' },
      { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' },
      { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' },
      { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' },
      { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' }
    ],
    geolocalisation: {
      latitude: '',
      longitude: ''
    },
    pointContact: {
      nom: '',
      prenom: '',
      telephone: '',
      email: ''
    }
  });

  // Fonction pour ouvrir le modal et réinitialiser le formulaire
  const handleOpenNewEntrepriseModal = () => {
    // Réinitialiser le formulaire avec des valeurs vides
    setNouvelleEntreprise({
      siret: '',
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      secteur: '',
      instruments: [
        { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' },
        { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' },
        { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' },
        { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' },
        { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' }
      ],
      geolocalisation: {
        latitude: '',
        longitude: ''
      },
      pointContact: {
        nom: '',
        prenom: '',
        telephone: '',
        email: ''
      }
    });
    // Afficher le modal
    setShowModal(true);
  };

  const secteurs = ['Transport', 'Pétrole', 'Santé', 'Commerce', 'Industrie', 'Agroalimentaire', 'Services'];
  
  const typesInstruments = [
    'Balance commerciale',
    'Balance de précision',
    'Compteur carburant',
    'Pompe à essence',
    'Thermomètre médical',
    'Manomètre',
    'Manomètre à pression',
    'Débitmètre',
    'Pèse-personne médical',
    'Compteur électrique',
    'Compteur d\'eau',
    'Chronomètre',
    'Tachymètre',
    'Densimètre'
  ];

  const filteredEntreprises = entreprises.filter(entreprise => {
    const matchesSearch = entreprise.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entreprise.siret.includes(searchTerm);
    const matchesSecteur = selectedSecteur === '' || entreprise.secteur === selectedSecteur;
    return matchesSearch && matchesSecteur;
  });

  const getStatusClass = (statut: string) => {
    switch (statut) {
      case 'conforme': return 'status-conforme';
      case 'non_conforme': return 'status-non-conforme';
      case 'en_attente': return 'status-en-attente';
      default: return '';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'conforme': return 'Conforme';
      case 'non_conforme': return 'Non conforme';
      case 'en_attente': return 'En attente';
      default: return statut;
    }
  };

  const handleInputChange = (field: keyof NouvelleEntreprise, value: string) => {
    setNouvelleEntreprise(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInstrumentChange = (index: number, field: keyof Instrument, value: string) => {
    setNouvelleEntreprise(prev => ({
      ...prev,
      instruments: prev.instruments.map((instrument, i) => 
        i === index ? { ...instrument, [field]: value } : instrument
      )
    }));
  };

  const handleGeolocationChange = (field: 'latitude' | 'longitude', value: string) => {
    setNouvelleEntreprise(prev => ({
      ...prev,
      geolocalisation: {
        ...prev.geolocalisation,
        [field]: value
      }
    }));
  };

  const handleContactChange = (field: keyof NouvelleEntreprise['pointContact'], value: string) => {
    setNouvelleEntreprise(prev => ({
      ...prev,
      pointContact: {
        ...prev.pointContact,
        [field]: value
      }
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNouvelleEntreprise(prev => ({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!nouvelleEntreprise.nom || !nouvelleEntreprise.siret || !nouvelleEntreprise.secteur) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier si le SIRET existe déjà
    if (entreprises.some(ent => ent.siret === nouvelleEntreprise.siret)) {
      alert('Une entreprise avec ce SIRET existe déjà');
      return;
    }

    // Validation des instruments (au moins un instrument doit être rempli)
    const instrumentsValides = nouvelleEntreprise.instruments.filter(inst => 
      inst.type && inst.marque && inst.modele && inst.numeroSerie
    );

    if (instrumentsValides.length === 0) {
      alert('Veuillez renseigner au moins un instrument de mesure complet');
      return;
    }

    // Ajouter la nouvelle entreprise
    const newId = Math.max(...entreprises.map(e => e.id)) + 1;
    const newEntreprise: Entreprise = {
      id: newId,
      siret: nouvelleEntreprise.siret,
      nom: nouvelleEntreprise.nom,
      adresse: nouvelleEntreprise.adresse,
      telephone: nouvelleEntreprise.telephone,
      email: nouvelleEntreprise.email,
      secteur: nouvelleEntreprise.secteur,
      statut: 'en_attente',
      dernierControle: new Date().toISOString().split('T')[0],
      instruments: instrumentsValides,
      geolocalisation: nouvelleEntreprise.geolocalisation.latitude && nouvelleEntreprise.geolocalisation.longitude ? {
        latitude: parseFloat(nouvelleEntreprise.geolocalisation.latitude),
        longitude: parseFloat(nouvelleEntreprise.geolocalisation.longitude)
      } : undefined,
      pointContact: nouvelleEntreprise.pointContact.nom && nouvelleEntreprise.pointContact.prenom ? 
        nouvelleEntreprise.pointContact : undefined
    };

    setEntreprises(prev => [...prev, newEntreprise]);
    
    // Réinitialiser le formulaire et fermer le modal
    setNouvelleEntreprise({
      siret: '',
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      secteur: '',
      instruments: [
        { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' },
        { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' },
        { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' },
        { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' },
        { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' }
      ],
      geolocalisation: {
        latitude: '',
        longitude: ''
      },
      pointContact: {
        nom: '',
        prenom: '',
        telephone: '',
        email: ''
      }
    });
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNouvelleEntreprise({
      siret: '',
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      secteur: '',
      instruments: [
        { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' },
        { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' },
        { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' },
        { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' },
        { type: '', marque: '', modele: '', numeroSerie: '', localisation: '' }
      ],
      geolocalisation: {
        latitude: '',
        longitude: ''
      },
      pointContact: {
        nom: '',
        prenom: '',
        telephone: '',
        email: ''
      }
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <Building2 size={32} />
          <div>
            <h1>Gestion des Entreprises</h1>
            <p>Répertoire des entreprises contrôlées par AGANOR</p>
          </div>
        </div>
        <button className="btn-primary" onClick={handleOpenNewEntrepriseModal}>
          <Plus size={20} />
          Nouvelle entreprise
        </button>
      </div>

      <div className="filters-section">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher par nom ou SIRET..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={selectedSecteur}
          onChange={(e) => setSelectedSecteur(e.target.value)}
          className="filter-select"
        >
          <option value="">Tous les secteurs</option>
          {secteurs.map(secteur => (
            <option key={secteur} value={secteur}>{secteur}</option>
          ))}
        </select>
      </div>

      <div className="entreprises-stats">
        <div className="stat-item">
          <span className="stat-number">{entreprises.length}</span>
          <span className="stat-label">Total entreprises</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{entreprises.filter(e => e.statut === 'conforme').length}</span>
          <span className="stat-label">Conformes</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{entreprises.filter(e => e.statut === 'non_conforme').length}</span>
          <span className="stat-label">Non conformes</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{entreprises.filter(e => e.statut === 'en_attente').length}</span>
          <span className="stat-label">En attente</span>
        </div>
      </div>

      <div className="entreprises-grid">
        {filteredEntreprises.map(entreprise => (
          <div key={entreprise.id} className="entreprise-card">
            <div className="card-header">
              <h3>{entreprise.nom}</h3>
              <span className={`status ${getStatusClass(entreprise.statut)}`}>
                {getStatusLabel(entreprise.statut)}
              </span>
            </div>
            
            <div className="card-content">
              <div className="info-item">
                <span className="info-label">SIRET:</span>
                <span className="info-value">{entreprise.siret}</span>
              </div>
              
              <div className="info-item">
                <MapPin size={16} />
                <span className="info-value">{entreprise.adresse}</span>
              </div>
              
              <div className="info-item">
                <Phone size={16} />
                <span className="info-value">{entreprise.telephone}</span>
              </div>
              
              <div className="info-item">
                <Mail size={16} />
                <span className="info-value">{entreprise.email}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Secteur:</span>
                <span className="secteur-badge">{entreprise.secteur}</span>
              </div>
              
              {entreprise.instruments && entreprise.instruments.length > 0 && (
                <div className="info-item">
                  <span className="info-label">Instruments:</span>
                  <span className="info-value">{entreprise.instruments[0].type}</span>
                </div>
              )}
              
              <div className="info-item">
                <span className="info-label">Dernier contrôle:</span>
                <span className="info-value">
                  {new Date(entreprise.dernierControle).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
            
            <div className="card-actions">
              <button className="btn-secondary">Voir détails</button>
              <button className="btn-primary">Nouveau contrôle</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal pour ajouter une nouvelle entreprise */}
      {showModal && (
        <div className="modal-overlay-enterprise">
          <div className="modal-content-enterprise">
            <div className="modal-header">
              <h2>Nouvelle Entreprise</h2>
              <button className="modal-close-enterprise" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form-enterprise">
              {/* Informations générales */}
              <div className="form-section-enterprise">
                <h3 className="section-title-enterprise">
                  <Building2 size={20} />
                  Informations générales
                </h3>
                <div className="form-grid-enterprise">
                  <div className="form-group-enterprise">
                    <label htmlFor="nom">Nom de l'entreprise *</label>
                    <input
                      type="text"
                      id="nom"
                      value={nouvelleEntreprise.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      placeholder="Ex: SOGATRA"
                      required
                    />
                  </div>

                  <div className="form-group-enterprise">
                    <label htmlFor="siret">SIRET *</label>
                    <input
                      type="text"
                      id="siret"
                      value={nouvelleEntreprise.siret}
                      onChange={(e) => handleInputChange('siret', e.target.value)}
                      placeholder="14 chiffres"
                      maxLength={14}
                      required
                    />
                  </div>

                  <div className="form-group-enterprise full-width">
                    <label htmlFor="adresse">Adresse</label>
                    <input
                      type="text"
                      id="adresse"
                      value={nouvelleEntreprise.adresse}
                      onChange={(e) => handleInputChange('adresse', e.target.value)}
                      placeholder="Adresse complète"
                    />
                  </div>

                  <div className="form-group-enterprise">
                    <label htmlFor="telephone">Téléphone</label>
                    <input
                      type="tel"
                      id="telephone"
                      value={nouvelleEntreprise.telephone}
                      onChange={(e) => handleInputChange('telephone', e.target.value)}
                      placeholder="+241 XX XX XX XX"
                    />
                  </div>

                  <div className="form-group-enterprise">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={nouvelleEntreprise.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@entreprise.ga"
                    />
                  </div>

                  <div className="form-group-enterprise full-width">
                    <label htmlFor="secteur">Secteur d'activité *</label>
                    <select
                      id="secteur"
                      value={nouvelleEntreprise.secteur}
                      onChange={(e) => handleInputChange('secteur', e.target.value)}
                      required
                    >
                      <option value="">Sélectionner un secteur</option>
                      {secteurs.map(secteur => (
                        <option key={secteur} value={secteur}>{secteur}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Point de contact */}
              <div className="form-section-enterprise">
                <h3 className="section-title-enterprise">
                  <User size={20} />
                  Point de contact
                </h3>
                <div className="form-grid-enterprise">
                  <div className="form-group-enterprise">
                    <label htmlFor="contact-nom">Nom</label>
                    <input
                      type="text"
                      id="contact-nom"
                      value={nouvelleEntreprise.pointContact.nom}
                      onChange={(e) => handleContactChange('nom', e.target.value)}
                      placeholder="Nom du contact"
                    />
                  </div>

                  <div className="form-group-enterprise">
                    <label htmlFor="contact-prenom">Prénom</label>
                    <input
                      type="text"
                      id="contact-prenom"
                      value={nouvelleEntreprise.pointContact.prenom}
                      onChange={(e) => handleContactChange('prenom', e.target.value)}
                      placeholder="Prénom du contact"
                    />
                  </div>

                  <div className="form-group-enterprise">
                    <label htmlFor="contact-telephone">Téléphone</label>
                    <input
                      type="tel"
                      id="contact-telephone"
                      value={nouvelleEntreprise.pointContact.telephone}
                      onChange={(e) => handleContactChange('telephone', e.target.value)}
                      placeholder="+241 XX XX XX XX"
                    />
                  </div>

                  <div className="form-group-enterprise">
                    <label htmlFor="contact-email">Email</label>
                    <input
                      type="email"
                      id="contact-email"
                      value={nouvelleEntreprise.pointContact.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      placeholder="contact@entreprise.ga"
                    />
                  </div>
                </div>
              </div>

              {/* Géolocalisation */}
              <div className="form-section-enterprise">
                <h3 className="section-title-enterprise">
                  <Navigation size={20} />
                  Géolocalisation
                </h3>
                <div className="form-grid-enterprise">
                  <div className="form-group-enterprise">
                    <label htmlFor="latitude">Latitude</label>
                    <input
                      type="number"
                      id="latitude"
                      step="any"
                      value={nouvelleEntreprise.geolocalisation.latitude}
                      onChange={(e) => handleGeolocationChange('latitude', e.target.value)}
                      placeholder="Ex: 0.3901"
                    />
                  </div>

                  <div className="form-group-enterprise">
                    <label htmlFor="longitude">Longitude</label>
                    <input
                      type="number"
                      id="longitude"
                      step="any"
                      value={nouvelleEntreprise.geolocalisation.longitude}
                      onChange={(e) => handleGeolocationChange('longitude', e.target.value)}
                      placeholder="Ex: 9.4544"
                    />
                  </div>

                  <div className="form-group-enterprise full-width">
                    <button
                      type="button"
                      className="btn-secondary geolocation-btn"
                      onClick={getCurrentLocation}
                    >
                      <Navigation size={16} />
                      Utiliser ma position actuelle
                    </button>
                  </div>
                </div>
              </div>

              {/* Instruments de mesure */}
              <div className="form-section-enterprise">
                <h3 className="section-title-enterprise">
                  <Settings size={20} />
                  Instruments de mesure (5 maximum)
                </h3>
                <div className="instruments-container">
                  {nouvelleEntreprise.instruments.map((instrument, index) => (
                    <div key={index} className="instrument-card">
                      <h4>Instrument {index + 1}</h4>
                      <div className="instrument-grid">
                        <div className="form-group-enterprise">
                          <label>Type d'instrument</label>
                          <select
                            value={instrument.type}
                            onChange={(e) => handleInstrumentChange(index, 'type', e.target.value)}
                          >
                            <option value="">Sélectionner un type</option>
                            {typesInstruments.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group-enterprise">
                          <label>Marque</label>
                          <input
                            type="text"
                            value={instrument.marque}
                            onChange={(e) => handleInstrumentChange(index, 'marque', e.target.value)}
                            placeholder="Ex: Mettler Toledo"
                          />
                        </div>

                        <div className="form-group-enterprise">
                          <label>Modèle</label>
                          <input
                            type="text"
                            value={instrument.modele}
                            onChange={(e) => handleInstrumentChange(index, 'modele', e.target.value)}
                            placeholder="Ex: XS204"
                          />
                        </div>

                        <div className="form-group-enterprise">
                          <label>Numéro de série</label>
                          <input
                            type="text"
                            value={instrument.numeroSerie}
                            onChange={(e) => handleInstrumentChange(index, 'numeroSerie', e.target.value)}
                            placeholder="Ex: 123456789"
                          />
                        </div>

                        <div className="form-group-enterprise full-width">
                          <label>Localisation dans l'entreprise</label>
                          <input
                            type="text"
                            value={instrument.localisation}
                            onChange={(e) => handleInstrumentChange(index, 'localisation', e.target.value)}
                            placeholder="Ex: Caisse principale, Laboratoire, etc."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions-enterprise">
                <button type="button" className="btn-cancel-enterprise" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-save-enterprise">
                  <Save size={20} />
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Entreprises;