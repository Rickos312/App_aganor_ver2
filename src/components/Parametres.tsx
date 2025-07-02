import React, { useState } from 'react';
import { Settings, Database, Download, Upload, RefreshCw, Trash2, Users, Building2, CheckSquare, CreditCard, BarChart3, AlertTriangle, Check, X } from 'lucide-react';

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

const Parametres: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'database' | 'backup' | 'import' | 'maintenance'>('database');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

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

  const sections = [
    { key: 'database' as const, label: 'Base de données', icon: Database },
    { key: 'backup' as const, label: 'Sauvegardes', icon: Download },
    { key: 'import' as const, label: 'Import/Export', icon: Upload },
    { key: 'maintenance' as const, label: 'Maintenance', icon: RefreshCw }
  ];

  const handleRefreshStats = async () => {
    setIsLoading(true);
    try {
      // Simulation d'appel API pour récupérer les statistiques
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mise à jour simulée des statistiques
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
      
      // Réinitialisation simulée des statistiques
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

  const getBackupTypeLabel = (type: string) => {
    return type === 'auto' ? 'Automatique' : 'Manuelle';
  };

  const getBackupTypeClass = (type: string) => {
    return type === 'auto' ? 'backup-auto' : 'backup-manual';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <Settings size={32} />
          <div>
            <h1>Paramètres Système</h1>
            <p>Gestion des bases de données et configuration AGANOR</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{getTotalRecords()}</span>
            <span className="stat-label">Total enregistrements</span>
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

      {/* Navigation des sections */}
      <div className="tabs-container">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.key}
              className={`tab ${activeSection === section.key ? 'active' : ''}`}
              onClick={() => setActiveSection(section.key)}
            >
              <Icon size={20} />
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>

      <div className="parametres-content">
        {/* Section Base de données */}
        {activeSection === 'database' && (
          <div className="database-section">
            <div className="section-header">
              <h2>État de la base de données</h2>
              <button 
                className="btn-secondary" 
                onClick={handleRefreshStats}
                disabled={isLoading}
              >
                <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
                Actualiser
              </button>
            </div>

            <div className="database-stats-grid">
              {databaseStats.map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.tableName} className={`database-stat-card ${stat.color}`}>
                    <div className="stat-icon">
                      <Icon size={32} />
                    </div>
                    <div className="stat-content">
                      <h3>{stat.count.toLocaleString()}</h3>
                      <p>{stat.displayName}</p>
                      <div className="stat-meta">
                        <span>Dernière MAJ:</span>
                        <span>{new Date(stat.lastUpdate).toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="database-info">
              <h3>Informations système</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Type de base:</span>
                  <span className="info-value">SQLite 3</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Taille totale:</span>
                  <span className="info-value">2.4 MB</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Dernière sauvegarde:</span>
                  <span className="info-value">Aujourd'hui à 14:30</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Statut:</span>
                  <span className="info-value status-healthy">Opérationnelle</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Sauvegardes */}
        {activeSection === 'backup' && (
          <div className="backup-section">
            <div className="section-header">
              <h2>Gestion des sauvegardes</h2>
              <button 
                className="btn-primary" 
                onClick={handleCreateBackup}
                disabled={isLoading}
              >
                <Download size={16} />
                Créer une sauvegarde
              </button>
            </div>

            <div className="backup-settings">
              <h3>Configuration automatique</h3>
              <div className="settings-grid">
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Sauvegarde automatique quotidienne
                  </label>
                  <span className="setting-description">À 18:00 chaque jour</span>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Conserver les sauvegardes pendant 30 jours
                  </label>
                  <span className="setting-description">Suppression automatique après 30 jours</span>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" />
                    Notification par email
                  </label>
                  <span className="setting-description">Recevoir un email après chaque sauvegarde</span>
                </div>
              </div>
            </div>

            <div className="backup-files">
              <h3>Fichiers de sauvegarde</h3>
              <div className="backup-list">
                {backupFiles.map(backup => (
                  <div key={backup.name} className="backup-item">
                    <div className="backup-info">
                      <div className="backup-name">
                        <span>{backup.name}</span>
                        <span className={`backup-type ${getBackupTypeClass(backup.type)}`}>
                          {getBackupTypeLabel(backup.type)}
                        </span>
                      </div>
                      <div className="backup-meta">
                        <span>{new Date(backup.date).toLocaleString('fr-FR')}</span>
                        <span>•</span>
                        <span>{backup.size}</span>
                      </div>
                    </div>
                    <div className="backup-actions">
                      <button className="btn-icon" title="Télécharger">
                        <Download size={16} />
                      </button>
                      <button 
                        className="btn-icon danger" 
                        title="Supprimer"
                        onClick={() => setShowConfirmDialog(backup.name)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section Import/Export */}
        {activeSection === 'import' && (
          <div className="import-export-section">
            <div className="section-header">
              <h2>Import et Export de données</h2>
            </div>

            <div className="import-export-grid">
              <div className="import-export-card">
                <h3>
                  <Upload size={24} />
                  Importer des données
                </h3>
                <p>Importer des données depuis un fichier CSV ou SQL</p>
                <div className="import-options">
                  <button className="btn-secondary">
                    <Upload size={16} />
                    Importer Agents (CSV)
                  </button>
                  <button className="btn-secondary">
                    <Upload size={16} />
                    Importer Entreprises (CSV)
                  </button>
                  <button className="btn-secondary">
                    <Upload size={16} />
                    Restaurer sauvegarde (SQL)
                  </button>
                </div>
              </div>

              <div className="import-export-card">
                <h3>
                  <Download size={24} />
                  Exporter des données
                </h3>
                <p>Exporter les données vers différents formats</p>
                <div className="export-options">
                  <button className="btn-secondary">
                    <Download size={16} />
                    Exporter tout (SQL)
                  </button>
                  <button className="btn-secondary">
                    <Download size={16} />
                    Exporter Agents (CSV)
                  </button>
                  <button className="btn-secondary">
                    <Download size={16} />
                    Exporter Entreprises (CSV)
                  </button>
                  <button className="btn-secondary">
                    <Download size={16} />
                    Exporter Contrôles (CSV)
                  </button>
                  <button className="btn-secondary">
                    <Download size={16} />
                    Exporter Factures (CSV)
                  </button>
                </div>
              </div>
            </div>

            <div className="import-history">
              <h3>Historique des opérations</h3>
              <div className="history-list">
                <div className="history-item success">
                  <div className="history-info">
                    <span className="history-action">Export Agents (CSV)</span>
                    <span className="history-date">16/01/2025 à 14:25</span>
                  </div>
                  <span className="history-status">Réussi</span>
                </div>
                <div className="history-item success">
                  <div className="history-info">
                    <span className="history-action">Import Entreprises (CSV)</span>
                    <span className="history-date">15/01/2025 à 10:30</span>
                  </div>
                  <span className="history-status">Réussi</span>
                </div>
                <div className="history-item error">
                  <div className="history-info">
                    <span className="history-action">Import Agents (CSV)</span>
                    <span className="history-date">14/01/2025 à 16:45</span>
                  </div>
                  <span className="history-status">Échec</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Maintenance */}
        {activeSection === 'maintenance' && (
          <div className="maintenance-section">
            <div className="section-header">
              <h2>Maintenance système</h2>
            </div>

            <div className="maintenance-actions">
              <div className="maintenance-card">
                <div className="maintenance-info">
                  <h3>
                    <RefreshCw size={24} />
                    Optimiser la base de données
                  </h3>
                  <p>Optimise les performances et libère l'espace inutilisé</p>
                  <div className="maintenance-meta">
                    <span>Dernière optimisation: Il y a 3 jours</span>
                  </div>
                </div>
                <button 
                  className="btn-primary"
                  onClick={handleOptimizeDatabase}
                  disabled={isLoading}
                >
                  Optimiser
                </button>
              </div>

              <div className="maintenance-card warning">
                <div className="maintenance-info">
                  <h3>
                    <Trash2 size={24} />
                    Réinitialiser la base de données
                  </h3>
                  <p>Supprime toutes les données et recrée la structure</p>
                  <div className="maintenance-warning">
                    <AlertTriangle size={16} />
                    <span>Action irréversible - Créez une sauvegarde avant</span>
                  </div>
                </div>
                <button 
                  className="btn-warning"
                  onClick={() => setShowConfirmDialog('reset-database')}
                  disabled={isLoading}
                >
                  Réinitialiser
                </button>
              </div>
            </div>

            <div className="system-info">
              <h3>Informations système</h3>
              <div className="system-grid">
                <div className="system-item">
                  <span className="system-label">Version AGANOR:</span>
                  <span className="system-value">1.0.0</span>
                </div>
                <div className="system-item">
                  <span className="system-label">Node.js:</span>
                  <span className="system-value">v20.19.1</span>
                </div>
                <div className="system-item">
                  <span className="system-label">SQLite:</span>
                  <span className="system-value">3.45.0</span>
                </div>
                <div className="system-item">
                  <span className="system-label">Espace disque utilisé:</span>
                  <span className="system-value">2.4 MB</span>
                </div>
                <div className="system-item">
                  <span className="system-label">Dernière maintenance:</span>
                  <span className="system-value">13/01/2025</span>
                </div>
                <div className="system-item">
                  <span className="system-label">Statut système:</span>
                  <span className="system-value status-healthy">Opérationnel</span>
                </div>
              </div>
            </div>
          </div>
        )}
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