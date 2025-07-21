import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'indigo' | 'emerald';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color }) => {
  const isPositive = trend.startsWith('+');

  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        <Icon size={32} />
      </div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
        <div className={`stat-trend ${isPositive ? 'positive' : 'negative'}`}>
          {trend} vs mois dernier
        </div>
      </div>
    </div>
  );
};

export default StatCard;