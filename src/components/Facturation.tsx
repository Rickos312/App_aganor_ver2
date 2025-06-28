import React, { useState } from 'react';
import { CreditCard, Download, Send, AlertCircle, Plus, X, Save, Building2, Calculator, Calendar, User } from 'lucide-react';

interface Facture {
  id: string;
  entreprise: string;
  montant: number;
  dateEmission: string;
  dateEcheance?: string;
  datePaiement?: string;
  controle: string;
  joursRetard?: number;
  statut: 'en_attente' | 'payee' | 'en_retard';
  modePaiement?: 'carte_bancaire' | 'airtel_money' | 'mobile_money';
}

interface NouvelleFacture {
  entrepriseId: string;
  entrepriseNom: string;
  controleType: string;
  montantHT: string;
  tva: string;
  dateEcheance: string;
  description: string;
  modePaiement: 'carte_bancaire' | 'airtel_money' | 'mobile_money' | '';
  numeroTelephone: string;
}

const Facturation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'en_attente' | 'payees' | 'en_retard'>('en_attente');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const [factures, setFactures] = useState<{
    en_attente: Facture[];
    payees: Facture[];
    en_retard: Facture[];
  }>({
    en_attente: [
      {
        id: 'F-2025-001',
        entreprise: 'Casino Supermarché',
        montant: 125000,
        dateEmission: '2025-01-10',
        dateEcheance: '2025-02-10',
        controle: 'Balance commerciale',
        statut: 'en_attente'
      },
      {
        id: 'F-2025-002',
        entreprise: 'Shell Gabon',
        montant: 85000,
        dateEmission: '2025-01-12',
        dateEcheance: '2025-02-12',
        controle: 'Compteur carburant',
        statut: 'en_attente'
      }
    ],
    payees: [
      {
        id: 'F-2025-003',
        entreprise: 'SOGATRA',
        montant: 95000,
        dateEmission: '2025-01-05',
        datePaiement: '2025-01-15',
        controle: 'Balance commerciale',
        statut: 'payee',
        modePaiement: 'airtel_money'
      }
    ],
    en_retard: [
      {
        id: 'F-2024-156',
        entreprise: 'Total Gabon',
        montant: 150000,
        dateEmission: '2024-12-15',
        dateEcheance: '2025-01-15',
        joursRetard: 0,
        controle: 'Compteur carburant',
        statut: 'en_retard'
      }
    ]
  });

  const [nouvelleFacture, setNouvelleFacture] = useState<NouvelleFacture>({
    entrepriseId: '',
    entrepriseNom: '',
    controleType: '',
    montantHT: '',
    tva: '18',
    dateEcheance: '',
    description: '',
    modePaiement: '',
    numeroTelephone: ''
  });

  const entreprises = [
    { id: '1', nom: 'SOGATRA' },
    { id: '2', nom: 'Total Gabon' },
    { id: '3', nom: 'Casino Supermarché' },
    { id: '4', nom: 'Shell Gabon' },
    { id: '5', nom: 'Carrefour Immaculé' },
    { id: '6', nom: 'Petro-Gabon' },
    { id: '7', nom: 'ETS-Jean Pneu' }
  ];

  const typesControles = [
    'Balance commerciale',
    'Balance de précision',
    'Compteur carburant',
    'Pompe à essence',
    'Thermomètre médical',
    'Manomètre',
    'Débitmètre',
    'Pèse-personne médical'
  ];

  const tabs = [
    { key: 'en_attente' as const, label: 'En attente', count: factures.en_attente.length },
    { key: 'payees' as const, label: 'Payées', count: factures.payees.length },
    { key: 'en_retard' as const, label: 'En retard', count: factures.en_retard.length }
  ];

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(montant);
  };

  const calculateMontantTTC = () => {
    const montantHT = parseFloat(nouvelleFacture.montantHT) || 0;
    const tva = parseFloat(nouvelleFacture.tva) || 0;
    return montantHT + (montantHT * tva / 100);
  };

  const handleInputChange = (field: keyof NouvelleFacture, value: string) => {
    setNouvelleFacture(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-remplir le nom de l'entreprise
    if (field === 'entrepriseId') {
      const entreprise = entreprises.find(e => e.id === value);
      setNouvelleFacture(prev => ({
        ...prev,
        entrepriseNom: entreprise?.nom || ''
      }));
    }
  };

  const handleSubmitFacture = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nouvelleFacture.entrepriseId || !nouvelleFacture.controleType || !nouvelleFacture.montantHT) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const montantTTC = calculateMontantTTC();
    const newId = `F-2025-${String(Date.now()).slice(-3)}`;
    
    const newFacture: Facture = {
      id: newId,
      entreprise: nouvelleFacture.entrepriseNom,
      montant: montantTTC,
      dateEmission: new Date().toISOString().split('T')[0],
      dateEcheance: nouvelleFacture.dateEcheance,
      controle: nouvelleFacture.controleType,
      statut: 'en_attente'
    };

    setFactures(prev => ({
      ...prev,
      en_attente: [...prev.en_attente, newFacture]
    }));

    // Réinitialiser le formulaire
    setNouvelleFacture({
      entrepriseId: '',
      entrepriseNom: '',
      controleType: '',
      montantHT: '',
      tva: '18',
      dateEcheance: '',
      description: '',
      modePaiement: '',
      numeroTelephone: ''
    });
    setShowModal(false);
  };

  // Simulation des APIs de paiement
  const processPayment = async (facture: Facture, modePaiement: string, numeroTelephone: string) => {
    setPaymentStatus('processing');
    
    try {
      // Simulation d'appel API selon le mode de paiement
      let apiResponse;
      
      switch (modePaiement) {
        case 'airtel_money':
          apiResponse = await simulateAirtelMoneyAPI(facture.montant, numeroTelephone);
          break;
        case 'mobile_money':
          apiResponse = await simulateMobileMoneyAPI(facture.montant, numeroTelephone);
          break;
        case 'carte_bancaire':
          apiResponse = await simulateCardPaymentAPI(facture.montant);
          break;
        default:
          throw new Error('Mode de paiement non supporté');
      }

      if (apiResponse.success) {
        // Déplacer la facture vers "payées"
        setFactures(prev => {
          const updatedFacture = {
            ...facture,
            statut: 'payee' as const,
            datePaiement: new Date().toISOString().split('T')[0],
            modePaiement: modePaiement as any
          };

          return {
            ...prev,
            en_attente: prev.en_attente.filter(f => f.id !== facture.id),
            en_retard: prev.en_retard.filter(f => f.id !== facture.id),
            payees: [...prev.payees, updatedFacture]
          };
        });

        setPaymentStatus('success');
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentStatus('idle');
          setSelectedFacture(null);
        }, 2000);
      } else {
        throw new Error(apiResponse.message || 'Erreur de paiement');
      }
    } catch (error) {
      console.error('Erreur de paiement:', error);
      setPaymentStatus('error');
      setTimeout(() => setPaymentStatus('idle'), 3000);
    }
  };

  // Simulation API Airtel Money
  const simulateAirtelMoneyAPI = async (montant: number, numeroTelephone: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation délai
    
    // Simulation de réponse API
    return {
      success: Math.random() > 0.2, // 80% de succès
      transactionId: `AM${Date.now()}`,
      message: 'Paiement Airtel Money effectué avec succès',
      montant,
      numeroTelephone
    };
  };

  // Simulation API Mobile Money (Moov Money)
  const simulateMobileMoneyAPI = async (montant: number, numeroTelephone: string) => {
    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulation délai
    
    return {
      success: Math.random() > 0.15, // 85% de succès
      transactionId: `MM${Date.now()}`,
      message: 'Paiement Mobile Money effectué avec succès',
      montant,
      numeroTelephone
    };
  };

  // Simulation API Carte bancaire
  const simulateCardPaymentAPI = async (montant: number) => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulation délai
    
    return {
      success: Math.random() > 0.1, // 90% de succès
      transactionId: `CB${Date.now()}`,
      message: 'Paiement par carte bancaire effectué avec succès',
      montant
    };
  };

  const openPaymentModal = (facture: Facture) => {
    setSelectedFacture(facture);
    setShowPaymentModal(true);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'carte_bancaire': return 'Carte bancaire';
      case 'airtel_money': return 'Airtel Money';
      case 'mobile_money': return 'Mobile Money';
      default: return method;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <CreditCard size={32} />
          <div>
            <h1>Gestion de la Facturation</h1>
            <p>Suivi des factures et paiements</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Générer une facture
        </button>
      </div>

      <div className="stats-facturation">
        <div className="stat-facture en-attente">
          <h3>{formatMontant(factures.en_attente.reduce((sum, f) => sum + f.montant, 0))}</h3>
          <p>Montant en attente</p>
        </div>
        <div className="stat-facture payees">
          <h3>{formatMontant(factures.payees.reduce((sum, f) => sum + f.montant, 0))}</h3>
          <p>Encaissé ce mois</p>
        </div>
        <div className="stat-facture en-retard">
          <h3>{formatMontant(factures.en_retard.reduce((sum, f) => sum + f.montant, 0))}</h3>
          <p>Montant en retard</p>
        </div>
      </div>

      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span>{tab.label}</span>
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="factures-content">
        {activeTab === 'en_attente' && (
          <div className="factures-list">
            {factures.en_attente.map(facture => (
              <div key={facture.id} className="facture-card en-attente">
                <div className="card-header">
                  <div>
                    <h3>{facture.id}</h3>
                    <p>{facture.entreprise}</p>
                  </div>
                  <div className="montant">
                    {formatMontant(facture.montant)}
                  </div>
                </div>
                <div className="card-content">
                  <p><strong>Contrôle:</strong> {facture.controle}</p>
                  <p><strong>Date d'émission:</strong> {new Date(facture.dateEmission).toLocaleDateString('fr-FR')}</p>
                  {facture.dateEcheance && (
                    <p><strong>Échéance:</strong> {new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
                <div className="card-actions">
                  <button className="btn-secondary">
                    <Download size={16} />
                    PDF
                  </button>
                  <button className="btn-secondary">
                    <Send size={16} />
                    Relancer
                  </button>
                  <button className="btn-primary" onClick={() => openPaymentModal(facture)}>
                    Encaisser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'payees' && (
          <div className="factures-list">
            {factures.payees.map(facture => (
              <div key={facture.id} className="facture-card payee">
                <div className="card-header">
                  <div>
                    <h3>{facture.id}</h3>
                    <p>{facture.entreprise}</p>
                    {facture.modePaiement && (
                      <span className="payment-method">
                        {getPaymentMethodLabel(facture.modePaiement)}
                      </span>
                    )}
                  </div>
                  <div className="montant payee">
                    {formatMontant(facture.montant)}
                  </div>
                </div>
                <div className="card-content">
                  <p><strong>Contrôle:</strong> {facture.controle}</p>
                  <p><strong>Date d'émission:</strong> {new Date(facture.dateEmission).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Date de paiement:</strong> {new Date(facture.datePaiement!).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="card-actions">
                  <button className="btn-secondary">
                    <Download size={16} />
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'en_retard' && (
          <div className="factures-list">
            {factures.en_retard.map(facture => (
              <div key={facture.id} className="facture-card en-retard">
                <div className="card-header">
                  <div>
                    <h3>{facture.id}</h3>
                    <p>{facture.entreprise}</p>
                    <div className="alerte-retard">
                      <AlertCircle size={16} />
                      Échue depuis {facture.joursRetard} jours
                    </div>
                  </div>
                  <div className="montant en-retard">
                    {formatMontant(facture.montant)}
                  </div>
                </div>
                <div className="card-content">
                  <p><strong>Contrôle:</strong> {facture.controle}</p>
                  <p><strong>Date d'émission:</strong> {new Date(facture.dateEmission).toLocaleDateString('fr-FR')}</p>
                  {facture.dateEcheance && (
                    <p><strong>Échéance:</strong> {new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
                <div className="card-actions">
                  <button className="btn-secondary">
                    <Download size={16} />
                    PDF
                  </button>
                  <button className="btn-warning">
                    <Send size={16} />
                    Relance urgente
                  </button>
                  <button className="btn-primary" onClick={() => openPaymentModal(facture)}>
                    Encaisser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal pour générer une nouvelle facture */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h2>Générer une nouvelle facture</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitFacture} className="modal-form">
              <div className="form-section">
                <h3 className="section-title">
                  <Building2 size={20} />
                  Informations de facturation
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="entreprise">Entreprise *</label>
                    <select
                      id="entreprise"
                      value={nouvelleFacture.entrepriseId}
                      onChange={(e) => handleInputChange('entrepriseId', e.target.value)}
                      required
                    >
                      <option value="">Sélectionner une entreprise</option>
                      {entreprises.map(entreprise => (
                        <option key={entreprise.id} value={entreprise.id}>
                          {entreprise.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="controle">Type de contrôle *</label>
                    <select
                      id="controle"
                      value={nouvelleFacture.controleType}
                      onChange={(e) => handleInputChange('controleType', e.target.value)}
                      required
                    >
                      <option value="">Sélectionner un type</option>
                      {typesControles.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="montantHT">Montant HT (XAF) *</label>
                    <input
                      type="number"
                      id="montantHT"
                      value={nouvelleFacture.montantHT}
                      onChange={(e) => handleInputChange('montantHT', e.target.value)}
                      placeholder="Ex: 100000"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="tva">TVA (%)</label>
                    <input
                      type="number"
                      id="tva"
                      value={nouvelleFacture.tva}
                      onChange={(e) => handleInputChange('tva', e.target.value)}
                      placeholder="18"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateEcheance">Date d'échéance</label>
                    <input
                      type="date"
                      id="dateEcheance"
                      value={nouvelleFacture.dateEcheance}
                      onChange={(e) => handleInputChange('dateEcheance', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Montant TTC</label>
                    <div className="montant-ttc">
                      {formatMontant(calculateMontantTTC())}
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      value={nouvelleFacture.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Description détaillée du contrôle effectué..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={20} />
                  Générer la facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de paiement */}
      {showPaymentModal && selectedFacture && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Encaisser la facture {selectedFacture.id}</h2>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="payment-modal-content">
              <div className="payment-summary">
                <h3>Résumé</h3>
                <p><strong>Entreprise:</strong> {selectedFacture.entreprise}</p>
                <p><strong>Montant:</strong> {formatMontant(selectedFacture.montant)}</p>
                <p><strong>Contrôle:</strong> {selectedFacture.controle}</p>
              </div>

              <div className="payment-methods">
                <h3>Mode de paiement</h3>
                <div className="payment-options">
                  <button
                    className={`payment-option ${nouvelleFacture.modePaiement === 'carte_bancaire' ? 'active' : ''}`}
                    onClick={() => handleInputChange('modePaiement', 'carte_bancaire')}
                  >
                    <CreditCard size={24} />
                    <span>Carte bancaire</span>
                  </button>
                  
                  <button
                    className={`payment-option ${nouvelleFacture.modePaiement === 'airtel_money' ? 'active' : ''}`}
                    onClick={() => handleInputChange('modePaiement', 'airtel_money')}
                  >
                    <div className="payment-logo airtel">📱</div>
                    <span>Airtel Money</span>
                  </button>
                  
                  <button
                    className={`payment-option ${nouvelleFacture.modePaiement === 'mobile_money' ? 'active' : ''}`}
                    onClick={() => handleInputChange('modePaiement', 'mobile_money')}
                  >
                    <div className="payment-logo moov">💳</div>
                    <span>Mobile Money</span>
                  </button>
                </div>

                {(nouvelleFacture.modePaiement === 'airtel_money' || nouvelleFacture.modePaiement === 'mobile_money') && (
                  <div className="form-group">
                    <label htmlFor="numeroTelephone">Numéro de téléphone</label>
                    <input
                      type="tel"
                      id="numeroTelephone"
                      value={nouvelleFacture.numeroTelephone}
                      onChange={(e) => handleInputChange('numeroTelephone', e.target.value)}
                      placeholder="+241 XX XX XX XX"
                      required
                    />
                  </div>
                )}
              </div>

              {paymentStatus === 'processing' && (
                <div className="payment-status processing">
                  <div className="spinner"></div>
                  <p>Traitement du paiement en cours...</p>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="payment-status success">
                  <div className="success-icon">✅</div>
                  <p>Paiement effectué avec succès !</p>
                </div>
              )}

              {paymentStatus === 'error' && (
                <div className="payment-status error">
                  <div className="error-icon">❌</div>
                  <p>Erreur lors du paiement. Veuillez réessayer.</p>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowPaymentModal(false)}
                  disabled={paymentStatus === 'processing'}
                >
                  Annuler
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => processPayment(
                    selectedFacture, 
                    nouvelleFacture.modePaiement, 
                    nouvelleFacture.numeroTelephone
                  )}
                  disabled={!nouvelleFacture.modePaiement || paymentStatus === 'processing'}
                >
                  {paymentStatus === 'processing' ? 'Traitement...' : 'Confirmer le paiement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturation;