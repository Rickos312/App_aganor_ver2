import React, { useState } from 'react';
import { Search, Plus, Building2, MapPin, Phone, Mail, X, Save, User, Settings, Navigation } from 'lucide-react';
import { useEntreprises } from '../hooks/useSupabaseData';

interface Instrument {
  type: string;
  marque: string;
  modele: string;
  numeroSerie: string;
  localisation: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Utilisation du hook Firebase
  const { entreprises, loading, error, createEntreprise } = useEntreprises();

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

  // Filtrage des entreprises par nom ou SIRET
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

  const getSecteurClass = (secteur: string) => {
    switch (secteur.toLowerCase()) {
      case 'transport': return 'secteur-transport';
      case 'pétrole': return 'secteur-petrole';
      case 'santé': return 'secteur-sante';
      case 'commerce': return 'secteur-commerce';
      case 'industrie': return 'secteur-industrie';
      default: return 'secteur-default';
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

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);

    try {
      // Créer l'entreprise avec Firebase
      const entrepriseData = {
        siret: nouvelleEntreprise.siret,
        nom: nouvelleEntreprise.nom,
        adresse: nouvelleEntreprise.adresse,
        telephone: nouvelleEntreprise.telephone,
        email: nouvelleEntreprise.email,
        secteur: nouvelleEntreprise.secteur,
        statut: 'en_attente' as const,
        latitude: nouvelleEntreprise.geolocalisation.latitude ? parseFloat(nouvelleEntreprise.geolocalisation.latitude) : undefined,
        longitude: nouvelleEntreprise.geolocalisation.longitude ? parseFloat(nouvelleEntreprise.geolocalisation.longitude) : undefined,
        point_contact_nom: nouvelleEntreprise.pointContact.nom || undefined,
        point_contact_prenom: nouvelleEntreprise.pointContact.prenom || undefined,
        point_contact_telephone: nouvelleEntreprise.pointContact.telephone || undefined,
        point_contact_email: nouvelleEntreprise.pointContact.email || undefined
      };

      const newEntreprise = await createEntreprise(entrepriseData);
      
      // Ajouter les instruments à l'entreprise créée
      if (newEntreprise.id) {
        const { EntrepriseService } = await import('../lib/firebase');
        
        for (const instrument of instrumentsValides) {
          await EntrepriseService.addInstrument({
            entreprise_id: newEntreprise.id,
            type: instrument.type,
            marque: instrument.marque,
            modele: instrument.modele,
            numero_serie: instrument.numeroSerie,
            localisation: instrument.localisation,
            statut: 'actif'
          });
        }
      }

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
      alert('Entreprise créée avec succès !');
      
    } catch (error) {
      console.error('Erreur lors de la création de l\'entreprise:', error);
      alert('Erreur lors de la création de l\'entreprise. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
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

  // Calcul des statistiques
  const statsEntreprises = {
    total: entreprises.length,
    conformes: entreprises.filter(e => e.statut === 'conforme').length,
    non_conformes: entreprises.filter(e => e.statut === 'non_conforme').length,
    en_attente: entreprises.filter(e => e.statut === 'en_attente').length
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des entreprises...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <p>Erreur lors du chargement des entreprises: {error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="entreprises-page">
      {/* Header moderne */}
      <div className="entreprises-header-modern">
        <div className="header-content-modern">
          <div className="header-title-modern">
            <div className="title-icon-modern">
              <Building2 size={32} />
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
            placeholder="Rechercher par nom d'entreprise ou SIRET..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-enterprise"
          />
        </div>
        <div className="filter-container-modern">
          <span>Secteur:</span>
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
          <div className="stat-number-enterprise">{statsEntreprises.non_conformes}</div>
          <div className="stat-label-enterprise">Non conformes</div>
        </div>
        <div className="stat-card-enterprise en-attente">
          <div className="stat-number-enterprise">{statsEntreprises.en_attente}</div>
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
                <span className={`status-badge-modern ${getStatusClass(entreprise.statut)}`}>
                  {getStatusLabel(entreprise.statut)}
                </span>
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
              
              {entreprise.telephone && (
                <div className="info-row-modern">
                  <Phone size={16} />
                  <span className="info-value-modern">{entreprise.telephone}</span>
                </div>
              )}
              
              {entreprise.email && (
                <div className="info-row-modern">
                  <Mail size={16} />
                  <span className="info-value-modern">{entreprise.email}</span>
                </div>
              )}
              
              <div className="info-row-modern">
                <span className="info-label-modern">Secteur:</span>
                <span className={`secteur-badge-modern ${getSecteurClass(entreprise.secteur)}`}>
                  {entreprise.secteur}
                </span>
              </div>
              
              {entreprise.instruments && entreprise.instruments.length > 0 && (
                <div className="info-row-modern">
                  <Settings size={16} />
                  <span className="info-value-modern">
                    {entreprise.instruments.length} instrument(s) - {entreprise.instruments[0].type}
                  </span>
                </div>
              )}

              {/* Informations de contact */}
              {entreprise.point_contact_nom && entreprise.point_contact_prenom && (
                <div className="info-row-modern">
                  <User size={16} />
                  <span className="info-value-modern">
                    Contact: {entreprise.point_contact_prenom} {entreprise.point_contact_nom}
                  </span>
                </div>
              )}

              {entreprise.point_contact_telephone && (
                <div className="info-row-modern">
                  <Phone size={16} />
                  <span className="info-value-modern">
                    Contact: {entreprise.point_contact_telephone}
                  </span>
                </div>
              )}

              {entreprise.point_contact_email && (
                <div className="info-row-modern">
                  <Mail size={16} />
                  <span className="info-value-modern">
                    Contact: {entreprise.point_contact_email}
                  </span>
                </div>
              )}
              
              {entreprise.dernier_controle && (
                <div className="info-row-modern">
                  <span className="info-label-modern">Dernier contrôle:</span>
                  <span className="info-value-modern">
                    {new Date(entreprise.dernier_controle).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
            
            <div className="card-actions-modern">
              <button className="btn-action-modern secondary">Voir détails</button>
              <button className="btn-action-modern primary">Nouveau contrôle</button>
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group-enterprise full-width">
                    <label htmlFor="secteur">Secteur d'activité *</label>
                    <select
                      id="secteur"
                      value={nouvelleEntreprise.secteur}
                      onChange={(e) => handleInputChange('secteur', e.target.value)}
                      required
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group-enterprise full-width">
                    <button
                      type="button"
                      className="btn-secondary geolocation-btn"
                      onClick={getCurrentLocation}
                      disabled={isSubmitting}
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
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
                          />
                        </div>

                        <div className="form-group-enterprise">
                          <label>Modèle</label>
                          <input
                            type="text"
                            value={instrument.modele}
                            onChange={(e) => handleInstrumentChange(index, 'modele', e.target.value)}
                            placeholder="Ex: XS204"
                            disabled={isSubmitting}
                          />
                        </div>

                        <div className="form-group-enterprise">
                          <label>Numéro de série</label>
                          <input
                            type="text"
                            value={instrument.numeroSerie}
                            onChange={(e) => handleInstrumentChange(index, 'numeroSerie', e.target.value)}
                            placeholder="Ex: 123456789"
                            disabled={isSubmitting}
                          />
                        </div>

                        <div className="form-group-enterprise full-width">
                          <label>Localisation dans l'entreprise</label>
                          <input
                            type="text"
                            value={instrument.localisation}
                            onChange={(e) => handleInstrumentChange(index, 'localisation', e.target.value)}
                            placeholder="Ex: Caisse principale, Laboratoire, etc."
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions-enterprise">
                <button 
                  type="button" 
                  className="btn-cancel-enterprise" 
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn-save-enterprise"
                  disabled={isSubmitting}
                >
                  <Save size={20} />
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
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