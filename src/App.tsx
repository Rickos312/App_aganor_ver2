import React, { useState } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/Dashboard';
import Entreprises from './components/Entreprises';
import Controles from './components/Controles';
import Facturation from './components/Facturation';
import Agents from './components/Agents';
import Parametres from './components/Parametres';
import './styles/globals.css';

type ModuleType = 'dashboard' | 'entreprises' | 'controles' | 'facturation' | 'agents' | 'parametres';

function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');
  const [user] = useState({
    nom: 'Vanessa PENDY',
    role: 'Technicienne Métrologie',
    statut: 'actif',
    avatar: 'VP'
  });

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'entreprises':
        return <Entreprises />;
      case 'controles':
        return <Controles />;
      case 'facturation':
        return <Facturation />;
      case 'agents':
        return <Agents />;
      case 'parametres':
        return <Parametres />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Header 
        user={user} 
        onSettingsClick={() => setActiveModule('parametres')}
      />
      <div className="app-body">
        <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;