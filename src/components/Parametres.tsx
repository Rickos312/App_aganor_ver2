import React, { useState } from 'react';
import { Settings, Database, Download, Upload, RefreshCw, Trash2, Users, Building2, CheckSquare, CreditCard, BarChart3, AlertTriangle, Check, X, HardDrive, Shield, Zap, FileText, Globe, Calendar, Navigation, Wrench } from 'lucide-react';

interface DatabaseStats {
  tableName: string;
  displayName: string;
  count: number;
  lastUpdate: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface BackupFile {
  name: string;
  date: string;
  size: string;
  type: 'auto' | 'manual';
}

interface SystemModule {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  features: string[];
  position: number;
}

const Parametres: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Modules du système organisés en cercle - adaptés pour AGANOR
  const systemModules: SystemModule[] = [
    {
      id: 'database',
      title: 'Gestion des données',
      description: 'Base de données, statistiques et optimisation',
      icon: Database,
      color: 'red',
      features: [
        'Statistiques en temps réel',
        'Optimisation automatique',
        'Monitoring des performances',
        'Gestion des index',
        'Sauvegarde automatique',
        'Restauration de données'
      ],
      position: 1
    },
    {
      id: 'calibration',
      title: 'Étalonnage',
      description: 'Procès verbal d\'étalonnage et fiches d\'interventions',
      icon: Wrench,
      color: 'orange',
      features: [
        'Procès verbal d\'étalonnage',
        'Appareils étalons',
        'Fiches d\'interventions modélisables',
        'Aucune limite en nombre d\'appareils',
        'Certificats d\'étalonnage',
        'Traçabilité métrologique'
      ],
      position: 2
    },
    {
      id: 'inventory',
      title: 'Entrées - Sorties',
      description: 'Gestion physique du parc d\'instruments',
      icon: Globe,
      color: 'green',
      features: [
        'Gestion physique du parc d\'instruments',
        'Sorties internes ou externes',
        'Gestion de l\'état de l\'appareil',
        'Suivi des mouvements',
        'Inventaire automatisé',
        'Géolocalisation des équipements'
      ],
      position: 3
    },
    {
      id: 'planning',
      title: 'Planning',
      description: 'Appel au planning et gestion des retards',
      icon: Calendar,
      color: 'blue',
      features: [
        'Appel au planning',
        'Gestion des appareils en retard',
        'Planification automatique',
        'Alertes et notifications',
        'Calendrier interactif',
        'Optimisation des tournées'
      ],
      position: 4
    },
    {
      id: 'exploitation',
      title: 'Exploitation',
      description: 'Rapports, exports et indicateurs statistiques',
      icon: FileText,
      color: 'purple',
      features: [
        'Information par e-mail',
        'Export Excel',
        'États sous Word',
        'Recherche multi-critères',
        'Indicateurs statistiques',
        'Budget Métrologie',
        'Tableaux de bord'
      ],
      position: 5
    }
  ];

  // Statistiques des bases de données
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats[]>([
    {
      tableName: 'agents',
      displayName: 'Agents',
      count: 10,
      lastUpdate: '2025-01-16 14:30:00',
      icon: Users,
      color: 'blue'
    },
    {
      tableName: 'entreprises',
      displayName: 'Entreprises',
      count: 9,
      lastUpdate: '2025-01-16 12:15:00',
      icon: Building2,
      color: 'green'
    },
    {
      tableName: 'controles',
      displayName: 'Contrôles',
      count: 4,
      lastUpdate: '2025-01-16 10:45:00',
      icon: CheckSquare,
      color: 'orange'
    },
    {
      tableName: 'factures',
      displayName: 'Factures',
      count: 4,
      lastUpdate: '2025-01-15 16:20:00',
      icon: CreditCard,
      color: 'purple'
    },
    {
      tableName: 'instruments',
      displayName: 'Instruments',
      count: 8,
      lastUpdate: '2025-01-16 09:30:00',
      icon: Settings,
      color: 'gray'
    }
  ]);

  // Fichiers de sauvegarde
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([
    {
      name: 'aganor_backup_2025-01-16_14-30.sql',
      date: '2025-01-16 14:30:00',
      size: '2.4 MB',
      type: 'auto'
    },
    {
      name: 'aganor_backup_2025-01-15_18-00.sql',
      date: '2025-01-15 18:00:00',
      size: '2.3 MB',
      type: 'manual'
    },
    {
      name: 'aganor_backup_2025-01-14_12-00.sql',
      date: '2025-01-14 12:00:00',
      size: '2.1 MB',
      type: 'auto'
    }
  ]);

  const handleRefreshStats = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDatabaseStats(prev => prev.map(stat => ({
        ...stat,
        lastUpdate: new Date().toISOString().replace('T', ' ').substring(0, 19)
      })));
      
      setOperationStatus({ type: 'success', message: 'Statistiques mises à jour avec succès' });
    } catch (error) {
      setOperationStatus({ type: 'error', message: 'Erreur lors de la mise à jour des statistiques' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000);
    }
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBackup: BackupFile = {
        name: `aganor_backup_${new Date().toISOString().split('T')[0]}_${new Date().toTimeString().substring(0, 5).replace(':', '-')}.sql`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        size: '2.5 MB',
        type: 'manual'
      };
      
      setBackupFiles(prev => [newBackup, ...prev]);
      setOperationStatus({ type: 'success', message: 'Sauvegarde créée avec succès' });
    } catch (error) {
      setOperationStatus({ type: 'error', message: 'Erreur lors de la création de la sauvegarde' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000);
    }
  };

  const handleDeleteBackup = async (backupName: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBackupFiles(prev => prev.filter(backup => backup.name !== backupName));
      setOperationStatus({ type: 'success', message: 'Sauvegarde supprimée avec succès' });
    } catch (error) {
      setOperationStatus({ type: 'error', message: 'Erreur lors de la suppression de la sauvegarde' });
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(null);
      setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000);
    }
  };

  const handleResetDatabase = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setDatabaseStats(prev => prev.map(stat => ({
        ...stat,
        count: 0,
        lastUpdate: new Date().toISOString().replace('T', ' ').substring(0, 19)
      })));
      
      setOperationStatus({ type: 'success', message: 'Base de données réinitialisée avec succès' });
    } catch (error) {
      setOperationStatus({ type: 'error', message: 'Erreur lors de la réinitialisation de la base de données' });
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(null);
      setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000);
    }
  };

  const handleOptimizeDatabase = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      setOperationStatus({ type: 'success', message: 'Base de données optimisée avec succès' });
    } catch (error) {
      setOperationStatus({ type: 'error', message: 'Erreur lors de l\'optimisation de la base de données' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setOperationStatus({ type: null, message: '' }), 3000);
    }
  };

  const getTotalRecords = () => {
    return databaseStats.reduce((total, stat) => total + stat.count, 0);
  };

  const getModuleColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'module-red';
      case 'orange': return 'module-orange';
      case 'green': return 'module-green';
      case 'blue': return 'module-blue';
      case 'purple': return 'module-purple';
      default: return 'module-gray';
    }
  };

  return (
    <div className="parametres-page">
      {/* Header moderne */}
      <div className="parametres-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-icon">
              <Settings size={32} />
            </div>
            <div className="title-text">
              <h1>AGANOR Système</h1>
              <p>Maîtrise de la Gestion des équipements de mesure</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{getTotalRecords()}</span>
              <span className="stat-label">Total enregistrements</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message de statut */}
      {operationStatus.type && (
        <div className={`status-message ${operationStatus.type}`}>
          {operationStatus.type === 'success' ? <Check size={20} /> : <X size={20} />}
          <span>{operationStatus.message}</span>
        </div>
      )}

      {/* Interface circulaire principale */}
      <div className="circular-interface">
        <div className="central-hub">
          <div className="hub-content">
            <div className="hub-logo">
              <Settings size={48} />
            </div>
            <h2>AGANOR</h2>
            <p className="hub-subtitle">Maîtrise de la Gestion des équipements de mesure</p>
            <div className="hub-tagline">
              Se limiter à l'utile pour gagner en efficience
            </div>
          </div>
        </div>

        <div className="modules-circle">
          {systemModules.map((module, index) => {
            const Icon = module.icon;
            const angle = (index * 72) - 90; // 360/5 = 72 degrés entre chaque module
            const radius = 300;
            const x = Math.cos(angle * Math.PI / 180) * radius;
            const y = Math.sin(angle * Math.PI / 180) * radius;
            
            return (
              <div
                key={module.id}
                className={`module-segment ${getModuleColorClass(module.color)} ${activeModule === module.id ? 'active' : ''}`}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
              >
                <div className="module-number">{module.position.toString().padStart(2, '0')}</div>
                <div className="module-icon">
                  <Icon size={32} />
                </div>
                <div className="module-content">
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Détails du module sélectionné */}
      {activeModule && (
        <div className="module-details">
          {(() => {
            const module = systemModules.find(m => m.id === activeModule);
            if (!module) return null;
            const Icon = module.icon;
            
            return (
              <div className={`module-detail-card ${getModuleColorClass(module.color)}`}>
                <div className="module-detail-header">
                  <div className="module-detail-icon">
                    <Icon size={40} />
                  </div>
                  <div>
                    <h3>{module.title}</h3>
                    <p>{module.description}</p>
                  </div>
                  <button 
                    className="close-detail"
                    onClick={() => setActiveModule(null)}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="module-features">
                  <h4>Fonctionnalités disponibles :</h4>
                  <ul>
                    {module.features.map((feature, index) => (
                      <li key={index}>
                        <Check size={16} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contenu spécifique selon le module */}
                {activeModule === 'database' && (
                  <div className="database-section">
                    <div className="section-actions">
                      <button 
                        className="btn-primary" 
                        onClick={handleRefreshStats}
                        disabled={isLoading}
                      >
                        <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
                        Actualiser les données
                      </button>
                      <button 
                        className="btn-secondary" 
                        onClick={handleOptimizeDatabase}
                        disabled={isLoading}
                      >
                        <Zap size={16} />
                        Optimiser
                      </button>
                    </div>

                    <div className="database-stats-grid">
                      {databaseStats.map(stat => {
                        const StatIcon = stat.icon;
                        return (
                          <div key={stat.tableName} className={`database-stat-card ${stat.color}`}>
                            <div className="stat-icon">
                              <StatIcon size={24} />
                            </div>
                            <div className="stat-content">
                              <h3>{stat.count.toLocaleString()}</h3>
                              <p>{stat.displayName}</p>
                              <div className="stat-meta">
                                <span>MAJ: {new Date(stat.lastUpdate).toLocaleString('fr-FR')}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="database-info">
                      <h4>Informations système</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <HardDrive size={16} />
                          <span>SQLite 3 - 2.4 MB</span>
                        </div>
                        <div className="info-item">
                          <Shield size={16} />
                          <span>Statut: Opérationnelle</span>
                        </div>
                        <div className="info-item">
                          <Download size={16} />
                          <span>Dernière sauvegarde: Aujourd'hui 14:30</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeModule === 'planning' && (
                  <div className="planning-section">
                    <div className="section-actions">
                      <button className="btn-primary">
                        <BarChart3 size={16} />
                        Voir le planning
                      </button>
                      <button className="btn-secondary">
                        <AlertTriangle size={16} />
                        Appareils en retard
                      </button>
                    </div>
                    
                    <div className="planning-stats">
                      <div className="planning-stat">
                        <span className="stat-number">15</span>
                        <span className="stat-label">Contrôles planifiés</span>
                      </div>
                      <div className="planning-stat">
                        <span className="stat-number">3</span>
                        <span className="stat-label">En retard</span>
                      </div>
                      <div className="planning-stat">
                        <span className="stat-number">7</span>
                        <span className="stat-label">Cette semaine</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeModule === 'exploitation' && (
                  <div className="exploitation-section">
                    <div className="section-actions">
                      <button className="btn-primary">
                        <Download size={16} />
                        Export Excel
                      </button>
                      <button className="btn-secondary">
                        <FileText size={16} />
                        Rapport Word
                      </button>
                      <button className="btn-secondary">
                        <BarChart3 size={16} />
                        Statistiques
                      </button>
                    </div>
                    
                    <div className="export-options">
                      <div className="export-item">
                        <FileText size={20} />
                        <span>Rapport mensuel automatique</span>
                        <button className="btn-icon">
                          <Download size={16} />
                        </button>
                      </div>
                      <div className="export-item">
                        <BarChart3 size={20} />
                        <span>Indicateurs de performance</span>
                        <button className="btn-icon">
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {(activeModule === 'calibration' || activeModule === 'inventory') && (
                  <div className="feature-section">
                    <div className="section-actions">
                      <button className="btn-primary">
                        <Settings size={16} />
                        Configurer
                      </button>
                      <button className="btn-secondary">
                        <FileText size={16} />
                        Documentation
                      </button>
                    </div>
                    
                    <div className="feature-info">
                      <p>Module en cours de développement. Toutes les fonctionnalités listées seront bientôt disponibles.</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Section de sauvegarde rapide */}
      <div className="quick-actions-section">
        <h3>Actions rapides</h3>
        <div className="quick-actions-grid">
          <button 
            className="quick-action-btn backup"
            onClick={handleCreateBackup}
            disabled={isLoading}
          >
            <Download size={24} />
            <span>Créer une sauvegarde</span>
          </button>
          
          <button 
            className="quick-action-btn optimize"
            onClick={handleOptimizeDatabase}
            disabled={isLoading}
          >
            <Zap size={24} />
            <span>Optimiser le système</span>
          </button>
          
          <button 
            className="quick-action-btn danger"
            onClick={() => setShowConfirmDialog('reset-database')}
            disabled={isLoading}
          >
            <Trash2 size={24} />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* Dialog de confirmation */}
      {showConfirmDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Confirmation</h2>
              <button className="modal-close" onClick={() => setShowConfirmDialog(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="confirmation-content">
              {showConfirmDialog === 'reset-database' ? (
                <>
                  <div className="confirmation-warning">
                    <AlertTriangle size={48} />
                    <h3>Réinitialiser la base de données</h3>
                    <p>Cette action va supprimer définitivement toutes les données (agents, entreprises, contrôles, factures) et ne peut pas être annulée.</p>
                    <p><strong>Assurez-vous d'avoir créé une sauvegarde récente avant de continuer.</strong></p>
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="btn-secondary" 
                      onClick={() => setShowConfirmDialog(null)}
                      disabled={isLoading}
                    >
                      Annuler
                    </button>
                    <button 
                      className="btn-danger" 
                      onClick={handleResetDatabase}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Réinitialisation...' : 'Confirmer la réinitialisation'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="confirmation-warning">
                    <Trash2 size={48} />
                    <h3>Supprimer la sauvegarde</h3>
                    <p>Êtes-vous sûr de vouloir supprimer la sauvegarde <strong>{showConfirmDialog}</strong> ?</p>
                    <p>Cette action ne peut pas être annulée.</p>
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="btn-secondary" 
                      onClick={() => setShowConfirmDialog(null)}
                      disabled={isLoading}
                    >
                      Annuler
                    </button>
                    <button 
                      className="btn-danger" 
                      onClick={() => handleDeleteBackup(showConfirmDialog)}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parametres;