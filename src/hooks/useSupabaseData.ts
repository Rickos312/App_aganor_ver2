import { useState, useEffect } from 'react';
import { 
  AgentService, 
  EntrepriseService, 
  ControleService, 
  FactureService,
  Agent,
  Entreprise,
  Controle,
  Facture
} from '../lib/supabase';

// Hook pour les agents
export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await AgentService.getAll();
      setAgents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des agents');
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async (agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newAgent = await AgentService.create(agent);
      setAgents(prev => [...prev, newAgent]);
      return newAgent;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création de l\'agent');
    }
  };

  const updateAgent = async (id: string, agent: Partial<Agent>) => {
    try {
      const updatedAgent = await AgentService.update(id, agent);
      setAgents(prev => prev.map(a => a.id === id ? updatedAgent : a));
      return updatedAgent;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'agent');
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      await AgentService.delete(id);
      setAgents(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'agent');
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return {
    agents,
    loading,
    error,
    refetch: fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent
  };
}

// Hook pour les entreprises
export function useEntreprises() {
  const [entreprises, setEntreprises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntreprises = async () => {
    try {
      setLoading(true);
      const data = await EntrepriseService.getAll();
      setEntreprises(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des entreprises');
    } finally {
      setLoading(false);
    }
  };

  const createEntreprise = async (entreprise: Omit<Entreprise, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newEntreprise = await EntrepriseService.create(entreprise);
      await fetchEntreprises(); // Recharger pour avoir les instruments
      return newEntreprise;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création de l\'entreprise');
    }
  };

  const updateEntreprise = async (id: string, entreprise: Partial<Entreprise>) => {
    try {
      const updatedEntreprise = await EntrepriseService.update(id, entreprise);
      await fetchEntreprises(); // Recharger pour avoir les données complètes
      return updatedEntreprise;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'entreprise');
    }
  };

  const deleteEntreprise = async (id: string) => {
    try {
      await EntrepriseService.delete(id);
      setEntreprises(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'entreprise');
    }
  };

  useEffect(() => {
    fetchEntreprises();
  }, []);

  return {
    entreprises,
    loading,
    error,
    refetch: fetchEntreprises,
    createEntreprise,
    updateEntreprise,
    deleteEntreprise
  };
}

// Hook pour les contrôles
export function useControles() {
  const [controles, setControles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchControles = async () => {
    try {
      setLoading(true);
      const data = await ControleService.getAll();
      setControles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des contrôles');
    } finally {
      setLoading(false);
    }
  };

  const createControle = async (controle: Omit<Controle, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newControle = await ControleService.create(controle);
      await fetchControles(); // Recharger pour avoir les données complètes
      return newControle;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création du contrôle');
    }
  };

  const updateControle = async (id: string, controle: Partial<Controle>) => {
    try {
      const updatedControle = await ControleService.update(id, controle);
      await fetchControles(); // Recharger pour avoir les données complètes
      return updatedControle;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du contrôle');
    }
  };

  const deleteControle = async (id: string) => {
    try {
      await ControleService.delete(id);
      setControles(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la suppression du contrôle');
    }
  };

  const addInstruments = async (controleId: string, instrumentIds: string[]) => {
    try {
      await ControleService.addInstruments(controleId, instrumentIds);
      await fetchControles(); // Recharger pour avoir les données complètes
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de l\'ajout des instruments');
    }
  };

  useEffect(() => {
    fetchControles();
  }, []);

  return {
    controles,
    loading,
    error,
    refetch: fetchControles,
    createControle,
    updateControle,
    deleteControle,
    addInstruments
  };
}

// Hook pour les factures
export function useFactures() {
  const [factures, setFactures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFactures = async () => {
    try {
      setLoading(true);
      const data = await FactureService.getAll();
      setFactures(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  const createFacture = async (facture: Omit<Facture, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newFacture = await FactureService.create(facture);
      await fetchFactures(); // Recharger pour avoir les données complètes
      return newFacture;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création de la facture');
    }
  };

  const updateFacture = async (id: string, facture: Partial<Facture>) => {
    try {
      const updatedFacture = await FactureService.update(id, facture);
      await fetchFactures(); // Recharger pour avoir les données complètes
      return updatedFacture;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la facture');
    }
  };

  const deleteFacture = async (id: string) => {
    try {
      await FactureService.delete(id);
      setFactures(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la suppression de la facture');
    }
  };

  const markAsPaid = async (id: string, paymentData: {
    mode_paiement: string;
    numero_transaction?: string;
  }) => {
    try {
      const updatedFacture = await FactureService.markAsPaid(id, paymentData);
      await fetchFactures(); // Recharger pour avoir les données complètes
      return updatedFacture;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors du marquage comme payée');
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  return {
    factures,
    loading,
    error,
    refetch: fetchFactures,
    createFacture,
    updateFacture,
    deleteFacture,
    markAsPaid
  };
}

// Hook pour les statistiques générales
export function useStats() {
  const [stats, setStats] = useState({
    agents: { total: 0, actifs: 0, inactifs: 0, en_conge: 0 },
    entreprises: { total: 0, conformes: 0, non_conformes: 0, en_attente: 0 },
    controles: { total: 0, planifies: 0, en_cours: 0, termines: 0 },
    factures: { total: 0, en_attente: 0, payees: 0, en_retard: 0, montant_total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques de chaque module
      const [agents, entreprises, controles, factures] = await Promise.all([
        AgentService.getAll(),
        EntrepriseService.getAll(),
        ControleService.getAll(),
        FactureService.getAll()
      ]);

      // Calculer les statistiques
      const agentStats = {
        total: agents.length,
        actifs: agents.filter(a => a.statut === 'actif').length,
        inactifs: agents.filter(a => a.statut === 'inactif').length,
        en_conge: agents.filter(a => a.statut === 'conge').length
      };

      const entrepriseStats = {
        total: entreprises.length,
        conformes: entreprises.filter(e => e.statut === 'conforme').length,
        non_conformes: entreprises.filter(e => e.statut === 'non_conforme').length,
        en_attente: entreprises.filter(e => e.statut === 'en_attente').length
      };

      const controleStats = {
        total: controles.length,
        planifies: controles.filter(c => c.statut === 'planifie').length,
        en_cours: controles.filter(c => c.statut === 'en_cours').length,
        termines: controles.filter(c => c.statut === 'termine').length
      };

      const factureStats = {
        total: factures.length,
        en_attente: factures.filter(f => f.statut === 'en_attente').length,
        payees: factures.filter(f => f.statut === 'payee').length,
        en_retard: factures.filter(f => f.statut === 'en_retard').length,
        montant_total: factures.reduce((sum, f) => sum + f.montant_ttc, 0)
      };

      setStats({
        agents: agentStats,
        entreprises: entrepriseStats,
        controles: controleStats,
        factures: factureStats
      });
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}