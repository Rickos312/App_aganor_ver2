import { apiRequest } from './api';

export interface Instrument {
  id: number;
  entreprise_id: number;
  type: string;
  marque?: string;
  modele?: string;
  numero_serie?: string;
  localisation?: string;
  statut: 'actif' | 'inactif' | 'maintenance';
  date_derniere_verification?: string;
  date_prochaine_verification?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Entreprise {
  id: number;
  siret: string;
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  secteur: string;
  statut: 'conforme' | 'non_conforme' | 'en_attente';
  dernier_controle?: string;
  latitude?: number;
  longitude?: number;
  point_contact_nom?: string;
  point_contact_prenom?: string;
  point_contact_telephone?: string;
  point_contact_email?: string;
  nombre_instruments?: number;
  controles_en_cours?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EntrepriseWithInstruments extends Entreprise {
  instruments?: Instrument[];
  controles?: any[];
}

// Récupérer toutes les entreprises
export const getAllEntreprises = async (): Promise<Entreprise[]> => {
  return await apiRequest('/entreprises');
};

// Récupérer une entreprise par ID avec ses instruments
export const getEntrepriseById = async (id: number): Promise<EntrepriseWithInstruments> => {
  return await apiRequest(`/entreprises/${id}`);
};

// Créer une nouvelle entreprise
export const createEntreprise = async (entrepriseData: Omit<Entreprise, 'id' | 'created_at' | 'updated_at'>): Promise<{ message: string; id: number }> => {
  return await apiRequest('/entreprises', {
    method: 'POST',
    body: JSON.stringify(entrepriseData),
  });
};

// Mettre à jour une entreprise
export const updateEntreprise = async (id: number, entrepriseData: Partial<Entreprise>): Promise<{ message: string }> => {
  return await apiRequest(`/entreprises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(entrepriseData),
  });
};

// Supprimer une entreprise
export const deleteEntreprise = async (id: number): Promise<{ message: string }> => {
  return await apiRequest(`/entreprises/${id}`, {
    method: 'DELETE',
  });
};

// Ajouter un instrument à une entreprise
export const addInstrumentToEntreprise = async (
  entrepriseId: number, 
  instrumentData: Omit<Instrument, 'id' | 'entreprise_id' | 'created_at' | 'updated_at'>
): Promise<{ message: string; id: number }> => {
  return await apiRequest(`/entreprises/${entrepriseId}/instruments`, {
    method: 'POST',
    body: JSON.stringify(instrumentData),
  });
};

// Récupérer les statistiques des entreprises
export const getEntreprisesStats = async (): Promise<any> => {
  return await apiRequest('/entreprises/stats/overview');
};