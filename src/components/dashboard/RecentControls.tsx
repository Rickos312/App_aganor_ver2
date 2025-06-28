import React from 'react';
import { Eye, FileText } from 'lucide-react';

interface Control {
  id: number;
  entreprise: string;
  type: string;
  statut: 'Conforme' | 'Non conforme' | 'En attente';
  date: string;
  agent: string;
}

const RecentControls: React.FC = () => {
  const recentControles: Control[] = [
    {
      id: 1,
      entreprise: 'SOGATRA',
      type: 'Balance commerciale',
      statut: 'Conforme',
      date: '2025-01-15',
      agent: 'M. MBADINGA'
    },
    {
      id: 2,
      entreprise: 'Total Gabon',
      type: 'Compteur carburant',
      statut: 'Non conforme',
      date: '2025-01-14',
      agent: 'Mme BONGO'
    },
    {
      id: 3,
      entreprise: 'Pharmacie Centrale',
      type: 'Balance de précision',
      statut: 'Conforme',
      date: '2025-01-13',
      agent: 'M. NDONG'
    },
    {
      id: 4,
      entreprise: 'Marché Mont-Bouët',
      type: 'Balance commerciale',
      statut: 'En attente',
      date: '2025-01-12',
      agent: 'M. OBAME'
    }
  ];

  const getStatusClass = (statut: string) => {
    switch (statut) {
      case 'Conforme': return 'status-conforme';
      case 'Non conforme': return 'status-non-conforme';
      case 'En attente': return 'status-en-attente';
      default: return '';
    }
  };

  return (
    <div className="recent-controls">
      <div className="section-header">
        <h2>Contrôles récents</h2>
        <button className="btn-secondary">Voir tout</button>
      </div>
      
      <div className="controls-table">
        <table>
          <thead>
            <tr>
              <th>Entreprise</th>
              <th>Type d'instrument</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Agent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentControles.map(controle => (
              <tr key={controle.id}>
                <td className="font-semibold">{controle.entreprise}</td>
                <td>{controle.type}</td>
                <td>
                  <span className={`status ${getStatusClass(controle.statut)}`}>
                    {controle.statut}
                  </span>
                </td>
                <td>{new Date(controle.date).toLocaleDateString('fr-FR')}</td>
                <td>{controle.agent}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Voir détails">
                      <Eye size={16} />
                    </button>
                    <button className="btn-icon" title="Rapport">
                      <FileText size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentControls;