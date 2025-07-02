import React, { useState } from 'react';
import { Search, Plus, Building2, MapPin, Phone, Mail, X, Save, User, Settings, Navigation, Filter, Eye, Edit } from 'lucide-react';

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
      ]
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
      case 'conforme': return 'CONFORME';
      case 'non_conforme': return 'NON CONFORME';
      case 'en_attente': return 'EN ATTENTE';
      default: return statut;
    }
  };

  const getSecteurColor = (secteur: string) => {
    switch (secteur) {
      case 'Transport': return 'secteur-transport';
      case 'Pétrole': return 'secteur-petrole';
      case 'Santé': return 'secteur-sante';
      case 'Commerce': return 'secteur-commerce';
      case 'Industrie': return 'secteur-industrie';
      default: return 'secteur-default';
    }
  };

  const handleInputChange = (field: keyof NouvelleEntreprise, value: string) => {
    setNouvelleEntreprise(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nouvelleEntreprise.nom || !nouvelleEntreprise.siret || !nouvelleEntreprise.secteur) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (entreprises.some(ent => ent.siret === nouvelleEntreprise.siret)) {
      alert('Une entreprise avec ce SIRET existe déjà');
      return;
    }

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
      instruments: nouvelleEntreprise.instruments.filter(inst => 
        inst.type && inst.marque && inst.modele && inst.numeroSerie
      ),
      geolocalisation: nouvelleEntreprise.geolocalisation.latitude && nouvelleEntreprise.geolocalisation.longitude ? {
        latitude: parseFloat(nouvelleEntreprise.geolocalisation.latitude),
        longitude: parseFloat(nouvelleEntreprise.geolocalisation.longitude)
      } : undefined,
      pointContact: nouvelleEntreprise.pointContact.nom && nouvelleEntreprise.pointContact.prenom ? 
        nouvelleEntreprise.pointContact : undefined
    };

    setEntreprises(prev => [...prev, newEntreprise]);
    
    setNouvelleEntreprise({
      siret: '',
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      secteur: '',
      instruments: [
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

  // Statistiques des entreprises
  const statsEntreprises = {
    total: entreprises.length,
    conformes: entreprises.filter(e => e.statut === 'conforme').length,
    nonConformes: entreprises.filter(e => e.statut === 'non_conforme').length,
    enAttente: entreprises.filter(e => e.statut === 'en_attente').length
  };

  return (
    <div className="entreprises-page">
      {/* Header moderne */}
      <div className="entreprises-header-modern">
        <div className="header-content-modern">
          <div className="header-title-modern">
            <div className="title-icon-modern">
              <Building2 size={24} />
            </div>
            <div className="title-text-modern">
              <h1>Gestion des Entreprises</h1>
              <p>Répertoire des entreprises contrôlées par AGANOR</p>
            </div>
          </div>
          <button className="btn-add-modern" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Nouvelle entreprise
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="search-filters-modern">
        <div className="search-container-modern">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher par nom ou SIRET..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-enterprise"
          />
        </div>
        <div className="filter-container-modern">
          <Filter size={20} />
          <select
            value={selectedSecteur}
            onChange={(e) => setSelectedSecteur(e.target.value)}
            className="filter-select-enterprise"
          >
            <option value="">Tous les secteurs</option>
            {secteurs.map(secteur => (
              <option key={secteur} value={secteur}>{secteur}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistiques modernes */}
      <div className="stats-container-modern">
        <div className="stat-card-enterprise total">
          <div className="stat-number-enterprise">{statsEntreprises.total}</div>
          <div className="stat-label-enterprise">Total entreprises</div>
        </div>
        <div className="stat-card-enterprise conformes">
          <div className="stat-number-enterprise">{statsEntreprises.conformes}</div>
          <div className="stat-label-enterprise">Conformes</div>
        </div>
        <div className="stat-card-enterprise non-conformes">
          <div className="stat-number-enterprise">{statsEntreprises.nonConformes}</div>
          <div className="stat-label-enterprise">Non conformes</div>
        </div>
        <div className="stat-card-enterprise en-attente">
          <div className="stat-number-enterprise">{statsEntreprises.enAttente}</div>
          <div className="stat-label-enterprise">En attente</div>
        </div>
      </div>

      {/* Grille des entreprises */}
      <div className="entreprises-grid-modern">
        {filteredEntreprises.map(entreprise => (
          <div key={entreprise.id} className="entreprise-card-modern">
            <div className="card-header-modern">
              <div className="entreprise-info-header">
                <h3 className="entreprise-nom">{entreprise.nom}</h3>
                <div className={`status-badge-modern ${getStatusClass(entreprise.statut)}`}>
                  {getStatusLabel(entreprise.statut)}
                </div>
              </div>
            </div>
            
            <div className="card-content-modern">
              <div className="info-row-modern">
                <span className="info-label-modern">SIRET:</span>
                <span className="info-value-modern">{entreprise.siret}</span>
              </div>
              
              <div className="info-row-modern">
                <MapPin size={16} />
                <span className="info-value-modern">{entreprise.adresse}</span>
              </div>
              
              <div className="info-row-modern">
                <Phone size={16} />
                <span className="info-value-modern">{entreprise.telephone}</span>
              </div>
              
              <div className="info-row-modern">
                <Mail size={16} />
                <span className="info-value-modern">{entreprise.email}</span>
              </div>
              
              <div className="info-row-modern">
                <span className="info-label-modern">Secteur:</span>
                <span className={`secteur-badge-modern ${getSecteurColor(entreprise.secteur)}`}>
                  {entreprise.secteur}
                </span>
              </div>
              
              {entreprise.instruments && entreprise.instruments.length > 0 && (
                <div className="info-row-modern">
                  <span className="info-label-modern">Instruments:</span>
                  <span className="info-value-modern">{entreprise.instruments[0].type}</span>
                </div>
              )}
              
              <div className="info-row-modern">
                <span className="info-label-modern">Dernier contrôle:</span>
                <span className="info-value-modern">
                  {new Date(entreprise.dernierControle).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
            
            <div className="card-actions-modern">
              <button className="btn-action-modern secondary">
                <Eye size={16} />
                Voir détails
              </button>
              <button className="btn-action-modern primary">
                Nouveau contrôle
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal pour ajouter une nouvelle entreprise */}
      {showModal && (
        <div className="modal-overlay-enterprise">
          <div className="modal-content-enterprise">
            <div className="modal-header-enterprise">
              <h2>Nouvelle Entreprise</h2>
              <button className="modal-close-enterprise" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form-enterprise">
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