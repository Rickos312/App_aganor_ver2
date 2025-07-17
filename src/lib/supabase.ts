
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://mxegclbmbtuaeohcohhn.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables d\'environnement Supabase manquantes');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Définie' : 'Manquante');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Types pour TypeScript
export interface Agent {
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
}

export interface Entreprise {
  id: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface Controle {
  id: string;
  entreprise_id: string;
  agent_id: string;
  type_controle: string;
  date_planifiee: string;
  date_realisation?: string;
  heure_debut?: string;
  heure_fin?: string;
  statut: 'planifie' | 'en_cours' | 'termine' | 'reporte' | 'annule';
  resultat?: 'conforme' | 'non_conforme' | 'en_attente';
  observations?: string;
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  progression: number;
  created_at?: string;
  updated_at?: string;
}