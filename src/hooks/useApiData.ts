import { useState, useEffect } from 'react';
import { Agent, getAllAgents, createAgent, updateAgent, deleteAgent } from '../services/agentApi';
import { Entreprise, EntrepriseWithInstruments, getAllEntreprises, getEntrepriseById, createEntreprise, updateEntreprise, deleteEntreprise } from '../services/entrepriseApi';
import { Controle, getAllControles, createControle, updateControle, deleteControle, CreateControleData } from '../services/controleApi';

// Hook pour les agents
export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await getAllAgents();
      setAgents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des agents');
    } finally {
      setLoading(false);
    }
  };

  const createAgentHandler = async (agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createAgent(agent);
      await fetchAgents(); // Recharger la liste
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création de l\'agent');
    }
  };

  const updateAgentHandler = async (id: number, agent: Partial<Agent>) => {
    try {
      await updateAgent(id, agent);
      await fetchAgents(); // Recharger la liste
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'agent');
    }
  };

  const deleteAgentHandler = async (id: number) => {
    try {
      await deleteAgent(id);
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
    createAgent: createAgentHandler,
    updateAgent: updateAgentHandler,
    deleteAgent: deleteAgentHandler
  };
}

// Hook pour les entreprises
export function useEntreprises() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntreprises = async () => {
    try {
      setLoading(true);
      const data = await getAllEntreprises();
      setEntreprises(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des entreprises');
    } finally {
      setLoading(false);
    }
  };

  const createEntrepriseHandler = async (entreprise: Omit<Entreprise, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createEntreprise(entreprise);
      await fetchEntreprises(); // Recharger la liste
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création de l\'entreprise');
    }
  };

  const updateEntrepriseHandler = async (id: number, entreprise: Partial<Entreprise>) => {
    try {
      await updateEntreprise(id, entreprise);
      await fetchEntreprises(); // Recharger la liste
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'entreprise');
    }
  };

  const deleteEntrepriseHandler = async (id: number) => {
    try {
      await deleteEntreprise(id);
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
    createEntreprise: createEntrepriseHandler,
    updateEntreprise: updateEntrepriseHandler,
    deleteEntreprise: deleteEntrepriseHandler
  };
}

// Hook pour une entreprise spécifique avec ses instruments
export function useEntrepriseWithInstruments(id: number | null) {
  const [entreprise, setEntreprise] = useState<EntrepriseWithInstruments | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntreprise = async (entrepriseId: number) => {
    try {
      setLoading(true);
      const data = await getEntrepriseById(entrepriseId);
      setEntreprise(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEntreprise(id);
    } else {
      setEntreprise(null);
    }
  }, [id]);

  return {
    entreprise,
    loading,
    error,
    refetch: () => id && fetchEntreprise(id)
  };
}

// Hook pour les contrôles
export function useControles() {
  const [controles, setControles] = useState<Controle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchControles = async () => {
    try {
      setLoading(true);
      const data = await getAllControles();
      setControles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des contrôles');
    } finally {
      setLoading(false);
    }
  };

  const createControleHandler = async (controle: CreateControleData) => {
    try {
      await createControle(controle);
      await fetchControles(); // Recharger la liste
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création du contrôle');
    }
  };

  const updateControleHandler = async (id: number, controle: Partial<Controle>) => {
    try {
      await updateControle(id, controle);
      await fetchControles(); // Recharger la liste
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du contrôle');
    }
  };

  const deleteControleHandler = async (id: number) => {
    try {
      await deleteControle(id);
      setControles(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la suppression du contrôle');
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
    createControle: createControleHandler,
    updateControle: updateControleHandler,
    deleteControle: deleteControleHandler
  };
}