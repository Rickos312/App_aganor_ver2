import { apiRequest } from './api';

// Types pour les agents
export interface Agent {
  id?: number;
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

export interface CreateAgentData {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'inspecteur' | 'superviseur' | 'admin' | 'technicien_qualite' | 'technicien_metrologie';
  zone?: string;
  statut?: 'actif' | 'inactif' | 'conge';
  date_embauche?: string;
  numero_matricule?: string;
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
  password?: string;
}

export interface UpdateAgentData extends Partial<CreateAgentData> {
  id: number;
}

export interface AgentStats {
  total: number;
  actifs: number;
  inactifs: number;
  en_conge: number;
  inspecteurs: number;
  superviseurs: number;
  admins: number;
  techniciens_qualite: number;
  techniciens_metrologie: number;
  controles_en_cours: number;
}

// Service pour la gestion des agents
export class AgentService {
  // Récupérer tous les agents
  static async getAll(filters?: {
    role?: string;
    zone?: string;
    statut?: string;
  }): Promise<Agent[]> {
    const queryParams = new URLSearchParams();
    
    if (filters?.role) queryParams.append('role', filters.role);
    if (filters?.zone) queryParams.append('zone', filters.zone);
    if (filters?.statut) queryParams.append('statut', filters.statut);
    
    const endpoint = `/agents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<Agent[]>(endpoint);
  }

  // Récupérer un agent par ID
  static async getById(id: number): Promise<Agent> {
    return apiRequest<Agent>(`/agents/${id}`);
  }

  // Créer un nouvel agent
  static async create(agentData: CreateAgentData): Promise<{ message: string; id: number }> {
    return apiRequest<{ message: string; id: number }>('/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
  }

  // Mettre à jour un agent
  static async update(id: number, agentData: Partial<UpdateAgentData>): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agentData),
    });
  }

  // Supprimer un agent
  static async delete(id: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/agents/${id}`, {
      method: 'DELETE',
    });
  }

  // Récupérer les statistiques des agents
  static async getStats(): Promise<AgentStats> {
    return apiRequest<AgentStats>('/agents/stats/overview');
  }
}