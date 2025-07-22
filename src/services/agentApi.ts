import { apiRequest } from './api';

export interface Agent {
  id: number;
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
  controlesEnCours?: number;
  dernierControle?: string;
  created_at?: string;
  updated_at?: string;
}

// Récupérer tous les agents
export const getAllAgents = async (): Promise<Agent[]> => {
  return await apiRequest('/agents');
};

// Récupérer un agent par ID
export const getAgentById = async (id: number): Promise<Agent> => {
  return await apiRequest(`/agents/${id}`);
};

// Créer un nouvel agent
export const createAgent = async (agentData: Omit<Agent, 'id' | 'created_at' | 'updated_at'>): Promise<{ message: string; id: number }> => {
  return await apiRequest('/agents', {
    method: 'POST',
    body: JSON.stringify(agentData),
  });
};

// Mettre à jour un agent
export const updateAgent = async (id: number, agentData: Partial<Agent>): Promise<{ message: string }> => {
  return await apiRequest(`/agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(agentData),
  });
};

// Supprimer un agent
export const deleteAgent = async (id: number): Promise<{ message: string }> => {
  return await apiRequest(`/agents/${id}`, {
    method: 'DELETE',
  });
};

// Récupérer les statistiques des agents
export const getAgentsStats = async (): Promise<any> => {
  return await apiRequest('/agents/stats/overview');
};