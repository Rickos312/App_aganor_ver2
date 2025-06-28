import React from 'react';
import { Plus, FileText, BarChart3, AlertTriangle } from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    {
      icon: Plus,
      label: 'Nouveau contrôle',
      description: 'Planifier une inspection',
      color: 'green'
    },
    {
      icon: FileText,
      label: 'Générer facture',
      description: 'Créer une nouvelle facture',
      color: 'blue'
    },
    {
      icon: BarChart3,
      label: 'Rapports mensuels',
      description: 'Consulter les statistiques',
      color: 'purple'
    },
    {
      icon: AlertTriangle,
      label: 'Alertes échéances',
      description: 'Vérifier les dates limites',
      color: 'orange'
    }
  ];

  return (
    <div className="quick-actions">
      <h2>Actions rapides</h2>
      <div className="action-grid">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button key={index} className={`quick-btn ${action.color}`}>
              <Icon size={24} />
              <div className="action-content">
                <span className="action-label">{action.label}</span>
                <span className="action-description">{action.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;