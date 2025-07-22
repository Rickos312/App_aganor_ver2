import { useState, useEffect } from 'react';
import { AgentService, Agent, CreateAgentData, UpdateAgentData, AgentStats } from '../services/agentApi';

// Hook pour la gestion des agents
export function useAgents(filters?: {
  role?: string;
  zone?: string;
  statut?: string;
}) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AgentService.getAll(filters);
      setAgents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des agents');
      console.error('Erreur lors du chargement des agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async (agentData: CreateAgentData): Promise<Agent> => {
    try {
      setError(null);
      const response = await AgentService.create(agentData);
      
      // Recharger la liste des agents après création
      await fetchAgents();
      
      // Retourner l'agent créé (simulé avec les données fournies + l'ID)
      return {
        id: response.id,
        ...agentData,
        controlesEnCours: 0,
        dernierControle: new Date().toISOString().split('T')[0]
      } as Agent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'agent';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateAgent = async (id: number, agentData: Partial<UpdateAgentData>): Promise<void> => {
    try {
      setError(null);
      await AgentService.update(id, agentData);
      
      // Mettre à jour l'agent dans la liste locale
      setAgents(prev => prev.map(agent => 
        agent.id === id ? { ...agent, ...agentData } : agent
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'agent';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteAgent = async (id: number): Promise<void> => {
    try {
      setError(null);
      await AgentService.delete(id);
      
      // Supprimer l'agent de la liste locale
      setAgents(prev => prev.filter(agent => agent.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'agent';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [filters?.role, filters?.zone, filters?.statut]);

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

// Hook pour les statistiques des agents
export function useAgentStats() {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AgentService.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
      console.error('Erreur lors du chargement des statistiques:', err);
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