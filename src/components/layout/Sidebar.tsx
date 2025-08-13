import React from 'react';
import { BarChart3, Building2, CheckSquare, CreditCard, Users, Settings } from 'lucide-react';

type ModuleType = 'dashboard' | 'entreprises' | 'controles' | 'facturation' | 'agents' | 'parametres';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const menuItems = [
    { id: 'dashboard' as const, icon: BarChart3, label: 'Tableau de bord' },
    { id: 'entreprises' as const, icon: Building2, label: 'Entreprises' },
    { id: 'devis' as const, icon: CreditCard, label: 'Devis' },
    { id: 'agents' as const, icon: Users, label: 'Agents' },
    { id: 'parametres' as const, icon: Settings, label: 'Paramètres' }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => setActiveModule(item.id)}
            >
              <Icon className="nav-icon" size={20} />
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;