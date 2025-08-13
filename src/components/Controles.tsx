import React, { useState } from 'react';
import { Calendar, CheckSquare, Clock } from 'lucide-react';
import PlanificationControle from './PlanificationControle';

const Controles: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'planifies' | 'en_cours' | 'termines'>('planifies');
  const [showPlanification, setShowPlanification] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  const controles = {
    planifies: [
      {
        id: 1,
        entreprise: 'Casino Supermarché',
        type: 'Balance commerciale',
        date: '2025-01-16',
        agent: 'M. MBADINGA',
        priorite: 'haute'
      },
      {
        id: 2,
        entreprise: 'Shell Gabon',
        type: 'Compteur carburant',
        date: '2025-01-17',
        agent: 'Mme BONGO',
        priorite: 'normale'
      }
    ],
    en_cours: [
      {
        id: 3,
        entreprise: 'Marché du Mont-Bouët',
        type: 'Balance commerciale',
        date: '2025-01-15',
        agent: 'M. OBAME',
        progression: 65
      }
    ],
    termines: [
      {
        id: 4,
        entreprise: 'SOGATRA',
        type: 'Balance commerciale',
        date: '2025-01-15',
        agent: 'M. MBADINGA',
        resultat: 'conforme',
        pdf: '/Constat-de-verification.pdf'
      },
      {
        id: 5,
        entreprise: 'Total Gabon',
        type: 'Compteur carburant',
        date: '2025-01-14',
        agent: 'Mme BONGO',
        resultat: 'non_conforme',
        pdf: '/Constat-de-verification.pdf'
      }
    ]
  };

  const tabs = [
    { key: 'planifies' as const, label: 'Planifiés', icon: Calendar, count: controles.planifies.length },
    { key: 'en_cours' as const, label: 'En cours', icon: Clock, count: controles.en_cours.length },
    { key: 'termines' as const, label: 'Terminés', icon: CheckSquare, count: controles.termines.length }
  ];

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

      {/* Onglets */}
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

      {/* Contenus */}
      <div className="controles-content">
        {activeTab === 'planifies' && (
          <div className="controles-list">
            {controles.planifies.map(controle => (
              <div key={controle.id} className="controle-card planifie">
                <div className="card-header">
                  <h3>{controle.entreprise}</h3>
                  <span className={`priorite ${controle.priorite}`}>
                    {controle.priorite === 'haute' ? 'Priorité haute' : 'Priorité normale'}
                  </span>
                </div>
                <div className="card-content">
                  <p><strong>Type:</strong> {controle.type}</p>
                  <p><strong>Date prévue:</strong> {new Date(controle.date).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Agent assigné:</strong> {controle.agent}</p>
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
            {controles.en_cours.map(controle => (
              <div key={controle.id} className="controle-card en-cours">
                <div className="card-header">
                  <h3>{controle.entreprise}</h3>
                  <span className="status-en-cours">En cours</span>
                </div>
                <div className="card-content">
                  <p><strong>Type:</strong> {controle.type}</p>
                  <p><strong>Date:</strong> {new Date(controle.date).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Agent:</strong> {controle.agent}</p>
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
                  <button className="btn-secondary">Pause</button>
                  <button className="btn-primary">Continuer</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'termines' && (
          <div className="controles-list">
            {controles.termines.map(controle => (
              <div key={controle.id} className="controle-card termine">
                <div className="card-header">
                  <h3>{controle.entreprise}</h3>
                  <span className={`status ${controle.resultat === 'conforme' ? 'status-conforme' : 'status-non-conforme'}`}>
                    {controle.resultat === 'conforme' ? 'Conforme' : 'Non conforme'}
                  </span>
                </div>
                <div className="card-content">
                  <p><strong>Type:</strong> {controle.type}</p>
                  <p><strong>Date:</strong> {new Date(controle.date).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Agent:</strong> {controle.agent}</p>
                </div>
                <div className="card-actions">
                  <button className="btn-secondary" onClick={() => setShowPdf(controle.pdf)}>
                    Voir constat
                  </button>
                  <button className="btn-primary">Générer facture</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Planification */}
      {showPlanification && (
        <PlanificationControle onClose={() => setShowPlanification(false)} />
      )}

      {/* Modal PDF */}
      {showPdf && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Constat de Vérification</h2>
              <button onClick={() => setShowPdf(false)}>✖</button>
            </div>
            <embed
              src={showPdf}
              type="application/pdf"
              width="100%"
              height="600px"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Controles;
