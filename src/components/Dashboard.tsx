import React from 'react';
import { TrendingUp, Building2, CheckSquare, CreditCard, AlertTriangle } from 'lucide-react';
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
      title: 'Contrôles en cours',
      value: '23',
      icon: CheckSquare,
      trend: '+5%',
      color: 'green'
    },
    {
      title: 'Factures en attente',
      value: '45',
      icon: CreditCard,
      trend: '-8%',
      color: 'orange'
    },
    {
      title: 'Taux de conformité',
      value: '87.5%',
      icon: TrendingUp,
      trend: '+2.1%',
      color: 'purple'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tableau de bord</h1>
        <p>Vue d'ensemble des activités de contrôle métrologique AGANOR</p>
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