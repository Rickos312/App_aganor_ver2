import React, { useState } from 'react';
import { Calendar, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import PlanificationControle from './PlanificationControle';
import { useControles } from '../hooks/useApiData';

interface ControlesProps {
  userRole?: string;
}

const Controles: React.FC<ControlesProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'planifies' | 'en_cours' | 'termines'>('planifies');
  const [showPlanification, setShowPlanification] = useState(false);
  
  // Utiliser le hook pour récupérer les contrôles depuis l'API
  const { controles, loading, error, refetch } = useControles();
  
  // Vérifier si l'utilisateur peut planifier des contrôles
  const canPlanControles = userRole === 'admin' || userRole === 'superviseur';

  // Organiser les contrôles par statut
  const controlesByStatus = {
    planifies: controles.filter(c => c.statut === 'planifie'),
    en_cours: controles.filter(c => c.statut === 'en_cours'),
    termines: controles.filter(c => c.statut === 'termine')
  };

  const tabs = [
    { key: 'planifies' as const, label: 'Planifiés', icon: Calendar, count: controlesByStatus.planifies.length },
    { key: 'en_cours' as const, label: 'En cours', icon: Clock, count: controlesByStatus.en_cours.length },
    { key: 'termines' as const, label: 'Terminés', icon: CheckSquare, count: controlesByStatus.termines.length }
  ];

  const handleControlPlanned = () => {
    refetch(); // Rafraîchir la liste des contrôles
    setShowPlanification(false);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement des contrôles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <AlertCircle size={48} />
          <h3>Erreur de chargement</h3>
          <p>{error}</p>
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
        {canPlanControles && (
          <button className="btn-primary" onClick={() => setShowPlanification(true)}>
            <Calendar size={20} />
            Planifier un contrôle
          </button>
        )}
        {!canPlanControles && (
          <div className="access-denied-message">
            <AlertCircle size={16} />
            <span>Seuls les administrateurs et superviseurs peuvent planifier des contrôles</span>
          </div>
        )}
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
        {activeTab === 'planifies' && (
          <div className="controles-list">
            {controlesByStatus.planifies.map(controle => (
              <div key={controle.id} className="controle-card planifie">
                <div className="card-header">
                  <h3>{controle.entreprise_nom}</h3>
                  <span className={`priorite ${controle.priorite}`}>
                    {controle.priorite === 'haute' ? 'Priorité haute' : 
                     controle.priorite === 'urgente' ? 'Urgente' :
                     controle.priorite === 'basse' ? 'Priorité basse' : 'Priorité normale'}
                  </span>
                </div>
                <div className="card-content">
                  <p><strong>Type:</strong> {controle.type_controle}</p>
                  <p><strong>Date prévue:</strong> {new Date(controle.date_planifiee).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Agent assigné:</strong> {controle.agent_prenom} {controle.agent_nom}</p>
                  {controle.heure_debut && (
                    <p><strong>Heure:</strong> {controle.heure_debut}</p>
                  )}
                  {controle.observations && (
                    <p><strong>Observations:</strong> {controle.observations}</p>
                  )}
                </div>
                <div className="card-actions">
                  <button className="btn-secondary">Modifier</button>
                  <button className="btn-primary">Commencer</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'en_cours' && (
          <div className="controles-list">
            {controlesByStatus.en_cours.map(controle => (
              <div key={controle.id} className="controle-card en-cours">
                <div className="card-header">
                  <h3>{controle.entreprise_nom}</h3>
                  <span className="status-en-cours">En cours</span>
                </div>
                <div className="card-content">
                  <p><strong>Type:</strong> {controle.type_controle}</p>
                  <p><strong>Date:</strong> {new Date(controle.date_realisation || controle.date_planifiee).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Agent:</strong> {controle.agent_prenom} {controle.agent_nom}</p>
                  {controle.heure_debut && (
                    <p><strong>Heure de début:</strong> {controle.heure_debut}</p>
                  )}
                  <div className="progress-container">
                    <div className="progress-label">Progression: {controle.progression || 0}%</div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${controle.progression || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-secondary">Pause</button>
                  <button className="btn-primary">Continuer</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'termines' && (
          <div className="controles-list">
            {controlesByStatus.termines.map(controle => (
              <div key={controle.id} className="controle-card termine">
                <div className="card-header">
                  <h3>{controle.entreprise_nom}</h3>
                  <span className={`status ${controle.resultat === 'conforme' ? 'status-conforme' : 'status-non-conforme'}`}>
                    {controle.resultat === 'conforme' ? 'Conforme' : 'Non conforme'}
                  </span>
                </div>
                <div className="card-content">
                  <p><strong>Type:</strong> {controle.type_controle}</p>
                  <p><strong>Date:</strong> {new Date(controle.date_realisation || controle.date_planifiee).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Agent:</strong> {controle.agent_prenom} {controle.agent_nom}</p>
                </div>
                <div className="card-actions">
                  <button className="btn-secondary">Voir rapport</button>
                  <button className="btn-primary">Générer facture</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de planification */}
      {showPlanification && (
        <PlanificationControle 
          onClose={() => setShowPlanification(false)}
          onControlPlanned={handleControlPlanned}
        />
      )}
    </div>
  );
};

export default Controles;