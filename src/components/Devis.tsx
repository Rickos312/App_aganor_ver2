import React, { useState } from 'react';
import { FileText, Plus, Download, Send, Calculator, Building2, Calendar, User } from 'lucide-react';

interface Devis {
  id: string;
  entreprise: string;
  montant: number;
  dateCreation: string;
  dateValidite: string;
  statut: 'en_attente' | 'accepte' | 'refuse' | 'expire';
  controleType: string;
}

const Devis: React.FC = () => {
  const [devis] = useState<Devis[]>([
    {
      id: 'DEV-2025-001',
      entreprise: 'SOGATRA',
      montant: 125000,
      dateCreation: '2025-01-10',
      dateValidite: '2025-02-10',
      statut: 'en_attente',
      controleType: 'Balance commerciale'
    },
    {
      id: 'DEV-2025-002',
      entreprise: 'Total Gabon',
      montant: 85000,
      dateCreation: '2025-01-12',
      dateValidite: '2025-02-12',
      statut: 'accepte',
      controleType: 'Compteur carburant'
    },
    {
      id: 'DEV-2025-003',
      entreprise: 'Casino Supermarché',
      montant: 95000,
      dateCreation: '2025-01-08',
      dateValidite: '2025-02-08',
      statut: 'en_attente',
      controleType: 'Balance commerciale'
    }
  ]);

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(montant);
  };

  const getStatutClass = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'status-en-attente';
      case 'accepte': return 'status-conforme';
      case 'refuse': return 'status-non-conforme';
      case 'expire': return 'status-expire';
      default: return '';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'accepte': return 'Accepté';
      case 'refuse': return 'Refusé';
      case 'expire': return 'Expiré';
      default: return statut;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <FileText size={32} />
          <div>
            <h1>Gestion des Devis</h1>
            <p>Création et suivi des devis de contrôle métrologique</p>
          </div>
        </div>
        <button className="btn-primary">
          <Plus size={20} />
          Nouveau devis
        </button>
      </div>

      <div className="stats-devis">
        <div className="stat-devis en-attente">
          <h3>{formatMontant(devis.filter(d => d.statut === 'en_attente').reduce((sum, d) => sum + d.montant, 0))}</h3>
          <p>Devis en attente</p>
        </div>
        <div className="stat-devis accepte">
          <h3>{formatMontant(devis.filter(d => d.statut === 'accepte').reduce((sum, d) => sum + d.montant, 0))}</h3>
          <p>Devis acceptés</p>
        </div>
        <div className="stat-devis total">
          <h3>{devis.length}</h3>
          <p>Total devis</p>
        </div>
      </div>

      <div className="devis-content">
        <div className="devis-list">
          {devis.map(devisItem => (
            <div key={devisItem.id} className="devis-card">
              <div className="card-header">
                <div>
                  <h3>{devisItem.id}</h3>
                  <p>{devisItem.entreprise}</p>
                </div>
                <div className="montant">
                  {formatMontant(devisItem.montant)}
                </div>
              </div>
              <div className="card-content">
                <p><strong>Type de contrôle:</strong> {devisItem.controleType}</p>
                <p><strong>Date de création:</strong> {new Date(devisItem.dateCreation).toLocaleDateString('fr-FR')}</p>
                <p><strong>Valide jusqu'au:</strong> {new Date(devisItem.dateValidite).toLocaleDateString('fr-FR')}</p>
                <div className="devis-status">
                  <span className={`status ${getStatutClass(devisItem.statut)}`}>
                    {getStatutLabel(devisItem.statut)}
                  </span>
                </div>
              </div>
              <div className="card-actions">
                <button className="btn-secondary">
                  <Download size={16} />
                  PDF
                </button>
                <button className="btn-secondary">
                  <Send size={16} />
                  Envoyer
                </button>
                <button className="btn-primary">
                  Modifier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Devis;