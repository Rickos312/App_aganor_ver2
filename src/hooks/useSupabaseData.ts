import { useState, useEffect } from 'react';
import { 
  supabase
} from '../lib/supabase';

// Types pour TypeScript
interface Agent {
  id: string;
  numero_matricule?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'inspecteur' | 'superviseur' | 'admin' | 'technicien_qualite' | 'technicien_metrologie';
  zone?: string;
  statut: 'actif' | 'inactif' | 'conge';
  date_embauche?: string;
  adresse?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  nationalite?: string;
  situation_matrimoniale?: 'celibataire' | 'marie' | 'divorce' | 'veuf';
  nombre_enfants?: number;
  niveau_etude?: string;
  diplomes?: string[];
  certifications?: string[];
  salaire?: number;
  type_contrat?: 'cdi' | 'cdd' | 'stage' | 'consultant';
  date_fin_contrat?: string;
  superviseur?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
  controles_en_cours?: number;
  dernier_controle?: string;
}

// Hook pour les agents
export function useAgents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select(`
          *,
          controles(count)
        `)
        .order('nom', { ascending: true });
      
      if (error) throw error;
      
      setAgents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des agents');
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async (agent: any) => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .insert([agent])
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchAgents(); // Recharger toutes les données pour avoir les statistiques à jour
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création de l\'agent');
    }
  };

  const updateAgent = async (id: string, agent: any) => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .update(agent)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchAgents(); // Recharger toutes les données
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'agent');
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchAgents(); // Recharger toutes les données
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
      const { data, error } = await supabase
        .from('entreprises')
        .select(`
          *,
          instruments (*)
        `)
        .order('nom', { ascending: true });
      
      if (error) throw error;
      
      setEntreprises(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des entreprises');
    } finally {
      setLoading(false);
    }
  };

  const createEntreprise = async (entreprise: any) => {
    try {
      const { data, error } = await supabase
        .from('entreprises')
        .insert([entreprise])
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchEntreprises(); // Recharger pour avoir les instruments
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création de l\'entreprise');
    }
  };

  const updateEntreprise = async (id: string, entreprise: any) => {
    try {
      const { data, error } = await supabase
        .from('entreprises')
        .update(entreprise)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchEntreprises(); // Recharger pour avoir les données complètes
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'entreprise');
    }
  };

  const deleteEntreprise = async (id: string) => {
    try {
      const { error } = await supabase
        .from('entreprises')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
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
      const { data, error } = await supabase
        .from('controles')
        .select(`
          *,
          entreprises (nom, adresse),
          agents (nom, prenom, role)
        `)
        .order('date_planifiee', { ascending: false });
      
      if (error) throw error;
      
      setControles(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des contrôles');
    } finally {
      setLoading(false);
    }
  };

  const createControle = async (controle: any) => {
    try {
      const { data, error } = await supabase
        .from('controles')
        .insert([controle])
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchControles(); // Recharger pour avoir les données complètes
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création du contrôle');
    }
  };

  const updateControle = async (id: string, controle: any) => {
    try {
      const { data, error } = await supabase
        .from('controles')
        .update(controle)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchControles(); // Recharger pour avoir les données complètes
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du contrôle');
    }
  };

  const deleteControle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('controles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setControles(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la suppression du contrôle');
    }
  };

  const addInstruments = async (controleId: string, instrumentIds: string[]) => {
    try {
      const controleInstruments = instrumentIds.map(instrumentId => ({
        controle_id: controleId,
        instrument_id: instrumentId,
        resultat: 'en_attente' as const
      }));

      const { error } = await supabase
        .from('controle_instruments')
        .insert(controleInstruments);
      
      if (error) throw error;
      
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
      const { data, error } = await supabase
        .from('factures')
        .select(`
          *,
          entreprises (nom, adresse, telephone, email),
          controles (type_controle, date_realisation)
        `)
        .order('date_emission', { ascending: false });
      
      if (error) throw error;
      
      setFactures(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  const createFacture = async (facture: any) => {
    try {
      const { data, error } = await supabase
        .from('factures')
        .insert([facture])
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchFactures(); // Recharger pour avoir les données complètes
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création de la facture');
    }
  };

  const updateFacture = async (id: string, facture: any) => {
    try {
      const { data, error } = await supabase
        .from('factures')
        .update(facture)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchFactures(); // Recharger pour avoir les données complètes
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la facture');
    }
  };

  const deleteFacture = async (id: string) => {
    try {
      const { error } = await supabase
        .from('factures')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
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
      const { data, error } = await supabase
        .from('factures')
        .update({
          statut: 'payee',
          date_paiement: new Date().toISOString().split('T')[0],
          ...paymentData
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchFactures(); // Recharger pour avoir les données complètes
      return data;
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
      const [agentsRes, entreprisesRes, controlesRes, facturesRes] = await Promise.all([
        supabase.from('agents').select('*'),
        supabase.from('entreprises').select('*'),
        supabase.from('controles').select('*'),
        supabase.from('factures').select('*')
      ]);

      const agents = agentsRes.data || [];
      const entreprises = entreprisesRes.data || [];
      const controles = controlesRes.data || [];
      const factures = facturesRes.data || [];

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