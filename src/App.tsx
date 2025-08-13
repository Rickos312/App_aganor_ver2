import React, { useState } from 'react';
import Login from './components/Login';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Entreprises from './components/Entreprises';
import Controles from './components/Controles';
import Devis from './components/Devis';
import Agents from './components/Agents';
import Parametres from './components/Parametres';
import Footer from './components/layout/Footer';
import './styles/globals.css';
import './styles/login.css';
import Dashboard from './components/Dashboard';
type ModuleType = 'dashboard' | 'entreprises' | 'controles' | 'devis' | 'agents' | 'parametres';

function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unreadMessages] = useState(3); // Simulation de messages non lus

  const handleLogin = (userData: any) => {
    setUser({
      nom: userData.nom || 'Utilisateur',
      role: userData.role || 'Inspecteur',
      avatar: userData.nom ? userData.nom.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'
    });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setActiveModule('dashboard');
  };

  // Afficher la page de connexion si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
      case 'entreprises':
        return <Entreprises />;
      case 'controles':
        return <Controles />;
      case 'devis':
        return <Devis />;
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
        onLogout={handleLogout} 
        isAuthenticated={isAuthenticated}
        unreadMessages={unreadMessages}
      />
      <div className="app-body">
        <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
        <main className="main-content">
          {renderContent()}
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default App;