import React from 'react';
import { TrendingUp, Building2, CheckSquare, CreditCard, AlertTriangle, QrCode, FileText } from 'lucide-react';
import StatCard from './ui/StatCard';
import RecentControls from './dashboard/RecentControls';
import QuickActions from './dashboard/QuickActions';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Entreprises enregistrées',
      value: '1,247',
      icon: Building2,
      trend: '+12%',
      color: 'blue'
    },
    {
      title: 'Taux de contrôle mensuel',
      value: '87.5%',
      icon: CheckSquare,
      trend: '+5%',
      color: 'green'
    },
    {
      title: 'Instruments conformes',
      value: '92.3%',
      icon: TrendingUp,
      trend: '+2.1%',
      color: 'purple'
    },
    {
      title: 'QR codes édités ce mois',
      value: '156',
      icon: QrCode,
      trend: '+18%',
      color: 'orange'
    },
    {
      title: 'Total devis édités',
      value: '89',
      icon: FileText,
      trend: '+7%',
      color: 'indigo'
    },
    {
      title: 'Taux de conformité global',
      value: '89.2%',
      icon: AlertTriangle,
      trend: '+3.2%',
      color: 'emerald'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>CRM : Vue d'ensemble des activités de contrôle de la Métrologie Légale</h1>
        <p>Tableau de bord modulant en fonction des flux des activités</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            color={stat.color}
          />
        ))}
      </div>

      <div className="dashboard-content">
        <RecentControls />
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;