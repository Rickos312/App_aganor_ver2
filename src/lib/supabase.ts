import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export interface Instrument {
  id: string;
  entreprise_id: string;
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

export interface Controle {
  id: string;
  numero_controle?: string;
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
  rapport_url?: string;
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  progression: number;
  created_at?: string;
  updated_at?: string;
}

export interface ControleInstrument {
  id: string;
  controle_id: string;
  instrument_id: string;
  resultat?: 'conforme' | 'non_conforme' | 'en_attente';
  observations?: string;
  created_at?: string;
}

export interface Facture {
  id: string;
  numero_facture?: string;
  entreprise_id: string;
  controle_id?: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  date_emission: string;
  date_echeance?: string;
  date_paiement?: string;
  statut: 'en_attente' | 'payee' | 'en_retard' | 'annulee';
  mode_paiement?: 'carte_bancaire' | 'airtel_money' | 'mobile_money' | 'virement' | 'especes';
  numero_transaction?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Services pour chaque module
export class AgentService {
  static async getAll() {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('nom', { ascending: true });
    
    if (error) throw error;
    return data as Agent[];
  }

  static async create(agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('agents')
      .insert([agent])
      .select()
      .single();
    
    if (error) throw error;
    return data as Agent;
  }

  static async update(id: string, agent: Partial<Agent>) {
    const { data, error } = await supabase
      .from('agents')
      .update(agent)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Agent;
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}

export class EntrepriseService {
  static async getAll() {
    const { data, error } = await supabase
      .from('entreprises')
      .select(`
        *,
        instruments (*)
      `)
      .order('nom', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async create(entreprise: Omit<Entreprise, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('entreprises')
      .insert([entreprise])
      .select()
      .single();
    
    if (error) throw error;
    return data as Entreprise;
  }

  static async update(id: string, entreprise: Partial<Entreprise>) {
    const { data, error } = await supabase
      .from('entreprises')
      .update(entreprise)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Entreprise;
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('entreprises')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  static async addInstrument(instrument: Omit<Instrument, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('instruments')
      .insert([instrument])
      .select()
      .single();
    
    if (error) throw error;
    return data as Instrument;
  }
}

export class ControleService {
  static async getAll() {
    const { data, error } = await supabase
      .from('controles')
      .select(`
        *,
        entreprises (nom, adresse),
        agents (nom, prenom, role),
        controle_instruments (
          *,
          instruments (*)
        )
      `)
      .order('date_planifiee', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async create(controle: Omit<Controle, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('controles')
      .insert([controle])
      .select()
      .single();
    
    if (error) throw error;
    return data as Controle;
  }

  static async update(id: string, controle: Partial<Controle>) {
    const { data, error } = await supabase
      .from('controles')
      .update(controle)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Controle;
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('controles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  static async addInstruments(controleId: string, instrumentIds: string[]) {
    const controleInstruments = instrumentIds.map(instrumentId => ({
      controle_id: controleId,
      instrument_id: instrumentId,
      resultat: 'en_attente' as const
    }));

    const { data, error } = await supabase
      .from('controle_instruments')
      .insert(controleInstruments)
      .select();
    
    if (error) throw error;
    return data;
  }
}

export class FactureService {
  static async getAll() {
    const { data, error } = await supabase
      .from('factures')
      .select(`
        *,
        entreprises (nom, adresse, telephone, email),
        controles (type_controle, date_realisation)
      `)
      .order('date_emission', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async create(facture: Omit<Facture, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('factures')
      .insert([facture])
      .select()
      .single();
    
    if (error) throw error;
    return data as Facture;
  }

  static async update(id: string, facture: Partial<Facture>) {
    const { data, error } = await supabase
      .from('factures')
      .update(facture)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Facture;
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('factures')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  static async markAsPaid(id: string, paymentData: {
    mode_paiement: string;
    numero_transaction?: string;
  }) {
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
    return data as Facture;
  }
}