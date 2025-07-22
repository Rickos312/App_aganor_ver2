import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Clock, AlertCircle, Play, CheckCircle, Eye, FileText, QrCode } from 'lucide-react';
import PlanificationControle from './PlanificationControle';
import { useControles, useEntreprises, useAgents } from '../hooks/useSupabaseData';

interface ControleWithDetails {
  id: string;
  numero_controle?: string;
  entreprise_id: string;
  agent_id: string;
  type_controle: string;
  date_planifiee: string;
  date_realisation?: string;
  heure_debut?: string;
  heure_fin?: string;
  statut: 'planifie' | 'en_cours' | 'termine' | 'reporte' | 'annule';
  resultat?: 'conforme' | 'non_conforme' | 'en_attente';
  observations?: string;
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  progression: number;
  entreprise?: {
    nom: string;
    adresse: string;
    telephone?: string;
    email?: string;
    point_contact_nom?: string;
    point_contact_prenom?: string;
  };
  agent?: {
    nom: string;
    prenom: string;
    role: string;
  };
  instruments?: Array<{
    id: string;
    type: string;
    marque: string;
    modele: string;
    numero_serie: string;
    localisation: string;
  }>;
}

const Controles: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'planifies' | 'en_cours' | 'termines'>('planifies');
  const [showPlanification, setShowPlanification] = useState(false);
  const [selectedControle, setSelectedControle] = useState<ControleWithDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { controles, loading, error, updateControle, refetch } = useControles();
  const { entreprises } = useEntreprises();
  const { agents } = useAgents();

  // Enrichir les contrôles avec les données des entreprises et agents
  const enrichedControles: ControleWithDetails[] = controles.map(controle => {
    const entreprise = entreprises.find(e => e.id === controle.entreprise_id);
    const agent = agents.find(a => a.id === controle.agent_id);
    
    return {
      ...controle,
      entreprise: entreprise ? {
        nom: entreprise.nom,
        adresse: entreprise.adresse,
        telephone: entreprise.telephone,
        email: entreprise.email,
        point_contact_nom: entreprise.point_contact_nom,
        point_contact_prenom: entreprise.point_contact_prenom,
      } : undefined,
      agent: agent ? {
        nom: agent.nom,
        prenom: agent.prenom,
        role: agent.role,
      } : undefined,
      instruments: entreprise?.instruments || []
    };
  });

  // Filtrer les contrôles par statut
  const controlesPlanifies = enrichedControles.filter(c => c.statut === 'planifie');
  const controlesEnCours = enrichedControles.filter(c => c.statut === 'en_cours');
  const controlesTermines = enrichedControles.filter(c => c.statut === 'termine');

  const tabs = [
    { key: 'planifies' as const, label: 'Planifiés', icon: Calendar, count: controlesPlanifies.length },
    { key: 'en_cours' as const, label: 'En cours', icon: Clock, count: controlesEnCours.length },
    { key: 'termines' as const, label: 'Terminés', icon: CheckSquare, count: controlesTermines.length }
  ];

  const handleCommencerControle = async (controle: ControleWithDetails) => {
    setIsUpdating(true);
    try {
      await updateControle(controle.id, {
        statut: 'en_cours',
        date_realisation: new Date().toISOString().split('T')[0],
        heure_debut: new Date().toTimeString().substring(0, 5),
        progression: 10
      });
      await refetch();
    } catch (error) {
      console.error('Erreur lors du démarrage du contrôle:', error);
      alert('Erreur lors du démarrage du contrôle');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTerminerControle = async (controle: ControleWithDetails, resultat: 'conforme' | 'non_conforme', observations?: string) => {
    setIsUpdating(true);
    try {
      await updateControle(controle.id, {
        statut: 'termine',
        resultat,
        observations,
        heure_fin: new Date().toTimeString().substring(0, 5),
        progression: 100
      });
      await refetch();
    } catch (error) {
      console.error('Erreur lors de la finalisation du contrôle:', error);
      alert('Erreur lors de la finalisation du contrôle');
    } finally {
      setIsUpdating(false);
    }
  };

  const getPrioriteClass = (priorite: string) => {
    switch (priorite) {
      case 'haute': return 'priorite-haute';
      case 'urgente': return 'priorite-urgente';
      case 'basse': return 'priorite-basse';
      default: return 'priorite-normale';
    }
  };

  const getPrioriteLabel = (priorite: string) => {
    switch (priorite) {
      case 'haute': return 'Priorité haute';
      case 'urgente': return 'Priorité urgente';
      case 'basse': return 'Priorité basse';
      default: return 'Priorité normale';
    }
  };

  const getResultatClass = (resultat?: string) => {
    switch (resultat) {
      case 'conforme': return 'status-conforme';
      case 'non_conforme': return 'status-non-conforme';
      default: return 'status-en-attente';
    }
  };

  const getResultatLabel = (resultat?: string) => {
    switch (resultat) {
      case 'conforme': return 'Conforme';
      case 'non_conforme': return 'Non conforme';
      default: return 'En attente';
    }
  };

  const openDetailsModal = (controle: ControleWithDetails) => {
    setSelectedControle(controle);
    setShowDetailsModal(true);
  };

  const generateQRCode = async (controle: ControleWithDetails) => {
    // TODO: Implémenter la génération de QR code avec l'API OpenAI
    // Cette fonction devra appeler votre backend qui utilisera l'API OpenAI
    alert('Fonctionnalité de génération de QR code à implémenter avec l\'API OpenAI');
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des contrôles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <AlertCircle size={24} />
          <p>Erreur lors du chargement des contrôles: {error}</p>
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
          <CheckSquare size={32} />
          <div>
            <h1>Gestion des Contrôles</h1>
            <p>Suivi des inspections et contrôles métrologiques</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowPlanification(true)}>
          <Calendar size={20} />
          Planifier un contrôle
        </button>
      </div>

      {/* Statistiques des contrôles */}
      <div className="controles-stats">
        <div className="stat-item">
          <span className="stat-number">{enrichedControles.length}</span>
          <span className="stat-label">Total contrôles</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{controlesPlanifies.length}</span>
          <span className="stat-label">Planifiés</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{controlesEnCours.length}</span>
          <span className="stat-label">En cours</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{controlesTermines.length}</span>
          <span className="stat-label">Terminés</span>
        </div>
      </div>

      <div className="tabs-container">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
              <span className="tab-count">{tab.count}</span>
            </button>
          );
        })}
      </div>

      <div className="controles-content">
        {/* Contrôles Planifiés */}
        {activeTab === 'planifies' && (
          <div className="controles-list">
            {controlesPlanifies.length === 0 ? (
              <div className="empty-state">
                <Calendar size={48} />
                <h3>Aucun contrôle planifié</h3>
                <p>Planifiez votre premier contrôle en cliquant sur le bouton "Planifier un contrôle"</p>
              </div>
            ) : (
              controlesPlanifies.map(controle => (
                <div key={controle.id} className="controle-card planifie">
                  <div className="card-header">
                    <div className="controle-info">
                      <h3>{controle.entreprise?.nom || 'Entreprise inconnue'}</h3>
                      <p className="controle-numero">{controle.numero_controle}</p>
                    </div>
                    <span className={`priorite ${getPrioriteClass(controle.priorite)}`}>
                      {getPrioriteLabel(controle.priorite)}
                    </span>
                  </div>
                  <div className="card-content">
                    <div className="info-row">
                      <span className="info-label">Type:</span>
                      <span className="info-value">{controle.type_controle}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Date prévue:</span>
                      <span className="info-value">
                        {new Date(controle.date_planifiee).toLocaleDateString('fr-FR')}
                        {controle.heure_debut && ` à ${controle.heure_debut}`}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Agent assigné:</span>
                      <span className="info-value">
                        {controle.agent ? `${controle.agent.prenom} ${controle.agent.nom}` : 'Agent inconnu'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Adresse:</span>
                      <span className="info-value">{controle.entreprise?.adresse}</span>
                    </div>
                    {controle.entreprise?.point_contact_nom && (
                      <div className="info-row">
                        <span className="info-label">Contact:</span>
                        <span className="info-value">
                          {controle.entreprise.point_contact_prenom} {controle.entreprise.point_contact_nom}
                        </span>
                      </div>
                    )}
                    <div className="info-row">
                      <span className="info-label">Instruments:</span>
                      <span className="info-value">{controle.instruments?.length || 0} instrument(s)</span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn-secondary" 
                      onClick={() => openDetailsModal(controle)}
                    >
                      <Eye size={16} />
                      Voir détails
                    </button>
                    <button 
                      className="btn-primary" 
                      onClick={() => handleCommencerControle(controle)}
                      disabled={isUpdating}
                    >
                      <Play size={16} />
                      {isUpdating ? 'Démarrage...' : 'Commencer'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Contrôles En cours */}
        {activeTab === 'en_cours' && (
          <div className="controles-list">
            {controlesEnCours.length === 0 ? (
              <div className="empty-state">
                <Clock size={48} />
                <h3>Aucun contrôle en cours</h3>
                <p>Les contrôles en cours d'exécution apparaîtront ici</p>
              </div>
            ) : (
              controlesEnCours.map(controle => (
                <div key={controle.id} className="controle-card en-cours">
                  <div className="card-header">
                    <div className="controle-info">
                      <h3>{controle.entreprise?.nom || 'Entreprise inconnue'}</h3>
                      <p className="controle-numero">{controle.numero_controle}</p>
                    </div>
                    <span className="status-en-cours">En cours</span>
                  </div>
                  <div className="card-content">
                    <div className="info-row">
                      <span className="info-label">Type:</span>
                      <span className="info-value">{controle.type_controle}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Date:</span>
                      <span className="info-value">
                        {controle.date_realisation ? 
                          new Date(controle.date_realisation).toLocaleDateString('fr-FR') :
                          new Date(controle.date_planifiee).toLocaleDateString('fr-FR')
                        }
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Agent:</span>
                      <span className="info-value">
                        {controle.agent ? `${controle.agent.prenom} ${controle.agent.nom}` : 'Agent inconnu'}
                      </span>
                    </div>
                    <div className="progress-container">
                      <div className="progress-label">Progression: {controle.progression}%</div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${controle.progression}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn-secondary" 
                      onClick={() => openDetailsModal(controle)}
                    >
                      <Eye size={16} />
                      Voir détails
                    </button>
                    <button 
                      className="btn-success" 
                      onClick={() => handleTerminerControle(controle, 'conforme')}
                      disabled={isUpdating}
                    >
                      <CheckCircle size={16} />
                      Marquer conforme
                    </button>
                    <button 
                      className="btn-warning" 
                      onClick={() => handleTerminerControle(controle, 'non_conforme')}
                      disabled={isUpdating}
                    >
                      <AlertCircle size={16} />
                      Marquer non conforme
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Contrôles Terminés */}
        {activeTab === 'termines' && (
          <div className="controles-list">
            {controlesTermines.length === 0 ? (
              <div className="empty-state">
                <CheckSquare size={48} />
                <h3>Aucun contrôle terminé</h3>
                <p>Les contrôles terminés apparaîtront ici</p>
              </div>
            ) : (
              controlesTermines.map(controle => (
                <div key={controle.id} className="controle-card termine">
                  <div className="card-header">
                    <div className="controle-info">
                      <h3>{controle.entreprise?.nom || 'Entreprise inconnue'}</h3>
                      <p className="controle-numero">{controle.numero_controle}</p>
                    </div>
                    <span className={`status ${getResultatClass(controle.resultat)}`}>
                      {getResultatLabel(controle.resultat)}
                    </span>
                  </div>
                  <div className="card-content">
                    <div className="info-row">
                      <span className="info-label">Type:</span>
                      <span className="info-value">{controle.type_controle}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Date de réalisation:</span>
                      <span className="info-value">
                        {controle.date_realisation ? 
                          new Date(controle.date_realisation).toLocaleDateString('fr-FR') :
                          'Non renseignée'
                        }
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Agent:</span>
                      <span className="info-value">
                        {controle.agent ? `${controle.agent.prenom} ${controle.agent.nom}` : 'Agent inconnu'}
                      </span>
                    </div>
                    {controle.observations && (
                      <div className="info-row">
                        <span className="info-label">Observations:</span>
                        <span className="info-value">{controle.observations}</span>
                      </div>
                    )}
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn-secondary" 
                      onClick={() => openDetailsModal(controle)}
                    >
                      <Eye size={16} />
                      Voir détails
                    </button>
                    <button className="btn-secondary">
                      <FileText size={16} />
                      Voir rapport
                    </button>
                    <button 
                      className="btn-primary"
                      onClick={() => generateQRCode(controle)}
                    >
                      <QrCode size={16} />
                      Générer QR Code
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de planification */}
      {showPlanification && (
        <PlanificationControle 
          onClose={() => setShowPlanification(false)} 
          onControleCreated={refetch}
        />
      )}

      {/* Modal de détails du contrôle */}
      {showDetailsModal && selectedControle && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Détails du contrôle {selectedControle.numero_controle}</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="details-section">
                <h3>Informations générales</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Entreprise:</span>
                    <span className="detail-value">{selectedControle.entreprise?.nom}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type de contrôle:</span>
                    <span className="detail-value">{selectedControle.type_controle}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date planifiée:</span>
                    <span className="detail-value">
                      {new Date(selectedControle.date_planifiee).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Agent assigné:</span>
                    <span className="detail-value">
                      {selectedControle.agent ? 
                        `${selectedControle.agent.prenom} ${selectedControle.agent.nom} (${selectedControle.agent.role})` : 
                        'Agent inconnu'
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Statut:</span>
                    <span className={`detail-value status ${selectedControle.statut}`}>
                      {selectedControle.statut}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Priorité:</span>
                    <span className="detail-value">{getPrioriteLabel(selectedControle.priorite)}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Entreprise</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Adresse:</span>
                    <span className="detail-value">{selectedControle.entreprise?.adresse}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Téléphone:</span>
                    <span className="detail-value">{selectedControle.entreprise?.telephone || 'Non renseigné'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedControle.entreprise?.email || 'Non renseigné'}</span>
                  </div>
                  {selectedControle.entreprise?.point_contact_nom && (
                    <div className="detail-item">
                      <span className="detail-label">Contact:</span>
                      <span className="detail-value">
                        {selectedControle.entreprise.point_contact_prenom} {selectedControle.entreprise.point_contact_nom}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedControle.instruments && selectedControle.instruments.length > 0 && (
                <div className="details-section">
                  <h3>Instruments à contrôler</h3>
                  <div className="instruments-list">
                    {selectedControle.instruments.map((instrument, index) => (
                      <div key={index} className="instrument-item">
                        <div className="instrument-info">
                          <span className="instrument-type">{instrument.type}</span>
                          <span className="instrument-details">
                            {instrument.marque} {instrument.modele} - {instrument.numero_serie}
                          </span>
                          <span className="instrument-location">{instrument.localisation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedControle.observations && (
                <div className="details-section">
                  <h3>Observations</h3>
                  <p className="observations-text">{selectedControle.observations}</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Controles;