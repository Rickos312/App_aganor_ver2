import { useState, useEffect } from 'react';
import { supabase, type Agent } from '../lib/supabase';

// Hook pour les agents
export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Vérifier si Supabase est configuré
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Configuration Supabase manquante. Veuillez configurer VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
      }

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('nom', { ascending: true });
      
      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }
      
      setAgents(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des agents:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des agents');
      // En cas d'erreur, utiliser des données de test
      setAgents([
        {
          id: '1',
          nom: 'MBADINGA',
          prenom: 'Jean-Claude',
          email: 'jc.mbadinga@aganor.ga',
          telephone: '+241 06 12 34 56',
          role: 'inspecteur',
          zone: 'Libreville Nord',
          statut: 'actif',
          numero_matricule: 'AG2025001'
        },
        {
          id: '2',
          nom: 'BONGO',
          prenom: 'Marie-Claire',
          email: 'mc.bongo@aganor.ga',
          telephone: '+241 06 23 45 67',
          role: 'superviseur',
          zone: 'Port-Gentil',
          statut: 'actif',
          numero_matricule: 'AG2025002'
        },
        {
          id: '3',
          nom: 'NDONG',
          prenom: 'Martin',
          email: 'm.ndong@aganor.ga',
          telephone: '+241 06 34 56 78',
          role: 'inspecteur',
          zone: 'Libreville Sud',
          statut: 'conge',
          numero_matricule: 'AG2025003'
        }
      ] as Agent[]);
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async (agent: Partial<Agent>) => {
    try {
      // Vérifier si Supabase est configuré
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Simulation locale si Supabase n'est pas configuré
        const newAgent = {
          ...agent,
          id: Date.now().toString(),
          created_at: new Date().toISOString()
        } as Agent;
        
        setAgents(prev => [...prev, newAgent]);
        return newAgent;
      }

      const { data, error } = await supabase
        .from('agents')
        .insert([agent])
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchAgents(); // Recharger toutes les données
      return data;
    } catch (err) {
      console.error('Erreur lors de la création de l\'agent:', err);
      
      // Fallback : ajouter localement si Supabase échoue
      const newAgent = {
        ...agent,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      } as Agent;
      
      setAgents(prev => [...prev, newAgent]);
      return newAgent;
    }
  };

  const updateAgent = async (id: string, agent: Partial<Agent>) => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Simulation locale
        setAgents(prev => prev.map(a => a.id === id ? { ...a, ...agent } : a));
        return;
      }

      const { data, error } = await supabase
        .from('agents')
        .update(agent)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchAgents();
      return data;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'agent:', err);
      // Fallback local
      setAgents(prev => prev.map(a => a.id === id ? { ...a, ...agent } : a));
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Simulation locale
        setAgents(prev => prev.filter(a => a.id !== id));
        return;
      }

      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAgents(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'agent:', err);
      // Fallback local
      setAgents(prev => prev.filter(a => a.id !== id));
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
      
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Données de test si Supabase n'est pas configuré
        setStats({
          agents: { total: 11, actifs: 9, inactifs: 0, en_conge: 2 },
          entreprises: { total: 9, conformes: 5, non_conformes: 2, en_attente: 2 },
          controles: { total: 25, planifies: 5, en_cours: 20, termines: 0 },
          factures: { total: 4, en_attente: 2, payees: 1, en_retard: 1, montant_total: 455000 }
        });
        setError(null);
        setLoading(false);
        return;
      }
      
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
        montant_total: factures.reduce((sum, f) => sum + (f.montant_ttc || 0), 0)
      };

      setStats({
        agents: agentStats,
        entreprises: entrepriseStats,
        controles: controleStats,
        factures: factureStats
      });
      
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
      
      // Données de fallback
      setStats({
        agents: { total: 11, actifs: 9, inactifs: 0, en_conge: 2 },
        entreprises: { total: 9, conformes: 5, non_conformes: 2, en_attente: 2 },
        controles: { total: 25, planifies: 5, en_cours: 20, termines: 0 },
        factures: { total: 4, en_attente: 2, payees: 1, en_retard: 1, montant_total: 455000 }
      });
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