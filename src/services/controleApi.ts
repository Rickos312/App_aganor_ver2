import { apiRequest } from './api';

export interface Controle {
  id: number;
  entreprise_id: number;
  agent_id: number;
  type_controle: string;
  date_planifiee: string;
  date_realisation?: string;
  heure_debut?: string;
  heure_fin?: string;
  statut: 'planifie' | 'en_cours' | 'termine' | 'reporte' | 'annule';
  resultat?: 'conforme' | 'non_conforme' | 'en_attente';
  observations?: string;
  rapport_url?: string;
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  progression: number;
  created_at?: string;
  updated_at?: string;
  // Données jointes
  entreprise_nom?: string;
  entreprise_adresse?: string;
  agent_nom?: string;
  agent_prenom?: string;
  agent_role?: string;
  instruments?: any[];
}

export interface CreateControleData {
  entreprise_id: number;
  agent_id: number;
  type_controle: string;
  date_planifiee: string;
  heure_debut?: string;
  priorite?: 'basse' | 'normale' | 'haute' | 'urgente';
  observations?: string;
  instruments_ids?: number[];
}

// Récupérer tous les contrôles
export const getAllControles = async (): Promise<Controle[]> => {
  return await apiRequest('/controles');
};

// Récupérer un contrôle par ID
export const getControleById = async (id: number): Promise<Controle> => {
  return await apiRequest(`/controles/${id}`);
};

// Créer un nouveau contrôle
export const createControle = async (controleData: CreateControleData): Promise<{ message: string; id: number }> => {
  return await apiRequest('/controles', {
    method: 'POST',
    body: JSON.stringify(controleData),
  });
};

// Mettre à jour un contrôle
export const updateControle = async (id: number, controleData: Partial<Controle>): Promise<{ message: string }> => {
  return await apiRequest(`/controles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(controleData),
  });
};

// Supprimer un contrôle
export const deleteControle = async (id: number): Promise<{ message: string }> => {
  return await apiRequest(`/controles/${id}`, {
    method: 'DELETE',
  });
};

// Démarrer un contrôle
export const startControle = async (id: number): Promise<{ message: string }> => {
  return await apiRequest(`/controles/${id}/start`, {
    method: 'POST',
  });
};

// Terminer un contrôle
export const completeControle = async (
  id: number, 
  data: { resultat: 'conforme' | 'non_conforme'; observations?: string }
): Promise<{ message: string }> => {
  return await apiRequest(`/controles/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Récupérer les statistiques des contrôles
export const getControlesStats = async (): Promise<any> => {
  return await apiRequest('/controles/stats/overview');
};