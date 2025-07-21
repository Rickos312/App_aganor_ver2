import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCwRxatY_ZLWqLK-L5f1FgSDvK4sL6O9MU",
  authDomain: "erpaganor.firebaseapp.com",
  projectId: "erpaganor",
  storageBucket: "erpaganor.firebasestorage.app",
  messagingSenderId: "522950219648",
  appId: "1:522950219648:web:c74a04840d994e5f0b5365",
  measurementId: "G-2PH0BDFNM7"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Types pour TypeScript
export interface Agent {
  id?: string;
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
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface Entreprise {
  id?: string;
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
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface Instrument {
  id?: string;
  entreprise_id: string;
  type: string;
  marque?: string;
  modele?: string;
  numero_serie?: string;
  localisation?: string;
  statut: 'actif' | 'inactif' | 'maintenance';
  date_derniere_verification?: string;
  date_prochaine_verification?: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface Controle {
  id?: string;
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
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface Facture {
  id?: string;
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
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

// Services pour chaque module
export class AgentService {
  static async getAll(): Promise<Agent[]> {
    const querySnapshot = await getDocs(collection(db, 'agents'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Agent));
  }

  static async getById(id: string): Promise<Agent | null> {
    const docRef = doc(db, 'agents', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Agent;
    }
    return null;
  }

  static async create(agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>): Promise<Agent> {
    const now = Timestamp.now();
    const agentData = {
      ...agent,
      created_at: now,
      updated_at: now
    };
    
    const docRef = await addDoc(collection(db, 'agents'), agentData);
    return {
      id: docRef.id,
      ...agentData
    } as Agent;
  }

  static async update(id: string, agent: Partial<Agent>): Promise<Agent> {
    const docRef = doc(db, 'agents', id);
    const updateData = {
      ...agent,
      updated_at: Timestamp.now()
    };
    
    await updateDoc(docRef, updateData);
    
    const updatedDoc = await getDoc(docRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as Agent;
  }

  static async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'agents', id));
  }

  static async getByEmail(email: string): Promise<Agent | null> {
    const q = query(collection(db, 'agents'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Agent;
    }
    return null;
  }
}

export class EntrepriseService {
  static async getAll(): Promise<any[]> {
    const querySnapshot = await getDocs(collection(db, 'entreprises'));
    const entreprises = [];
    
    for (const doc of querySnapshot.docs) {
      const entreprise = {
        id: doc.id,
        ...doc.data()
      };
      
      // Récupérer les instruments pour chaque entreprise
      const instrumentsQuery = query(
        collection(db, 'instruments'), 
        where('entreprise_id', '==', doc.id)
      );
      const instrumentsSnapshot = await getDocs(instrumentsQuery);
      entreprise.instruments = instrumentsSnapshot.docs.map(instDoc => ({
        id: instDoc.id,
        ...instDoc.data()
      }));
      
      entreprises.push(entreprise);
    }
    
    return entreprises;
  }

  static async create(entreprise: Omit<Entreprise, 'id' | 'created_at' | 'updated_at'>): Promise<Entreprise> {
    const now = Timestamp.now();
    const entrepriseData = {
      ...entreprise,
      created_at: now,
      updated_at: now
    };
    
    const docRef = await addDoc(collection(db, 'entreprises'), entrepriseData);
    return {
      id: docRef.id,
      ...entrepriseData
    } as Entreprise;
  }

  static async update(id: string, entreprise: Partial<Entreprise>): Promise<Entreprise> {
    const docRef = doc(db, 'entreprises', id);
    const updateData = {
      ...entreprise,
      updated_at: Timestamp.now()
    };
    
    await updateDoc(docRef, updateData);
    
    const updatedDoc = await getDoc(docRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as Entreprise;
  }

  static async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'entreprises', id));
  }

  static async addInstrument(instrument: Omit<Instrument, 'id' | 'created_at' | 'updated_at'>): Promise<Instrument> {
    const now = Timestamp.now();
    const instrumentData = {
      ...instrument,
      created_at: now,
      updated_at: now
    };
    
    const docRef = await addDoc(collection(db, 'instruments'), instrumentData);
    return {
      id: docRef.id,
      ...instrumentData
    } as Instrument;
  }
}

export class ControleService {
  static async getAll(): Promise<any[]> {
    const querySnapshot = await getDocs(collection(db, 'controles'));
    const controles = [];
    
    for (const doc of querySnapshot.docs) {
      const controle = {
        id: doc.id,
        ...doc.data()
      };
      
      // Récupérer les données de l'entreprise
      if (controle.entreprise_id) {
        const entrepriseDoc = await getDoc(doc(db, 'entreprises', controle.entreprise_id));
        if (entrepriseDoc.exists()) {
          controle.entreprises = entrepriseDoc.data();
        }
      }
      
      // Récupérer les données de l'agent
      if (controle.agent_id) {
        const agentDoc = await getDoc(doc(db, 'agents', controle.agent_id));
        if (agentDoc.exists()) {
          controle.agents = agentDoc.data();
        }
      }
      
      controles.push(controle);
    }
    
    return controles;
  }

  static async create(controle: Omit<Controle, 'id' | 'created_at' | 'updated_at'>): Promise<Controle> {
    const now = Timestamp.now();
    const controleData = {
      ...controle,
      created_at: now,
      updated_at: now
    };
    
    const docRef = await addDoc(collection(db, 'controles'), controleData);
    return {
      id: docRef.id,
      ...controleData
    } as Controle;
  }

  static async update(id: string, controle: Partial<Controle>): Promise<Controle> {
    const docRef = doc(db, 'controles', id);
    const updateData = {
      ...controle,
      updated_at: Timestamp.now()
    };
    
    await updateDoc(docRef, updateData);
    
    const updatedDoc = await getDoc(docRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as Controle;
  }

  static async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'controles', id));
  }

  static async addInstruments(controleId: string, instrumentIds: string[]): Promise<void> {
    // Dans Firestore, nous pouvons stocker les IDs des instruments directement dans le document controle
    const controleRef = doc(db, 'controles', controleId);
    await updateDoc(controleRef, {
      instrument_ids: instrumentIds,
      updated_at: Timestamp.now()
    });
  }
}

export class FactureService {
  static async getAll(): Promise<any[]> {
    const querySnapshot = await getDocs(collection(db, 'factures'));
    const factures = [];
    
    for (const doc of querySnapshot.docs) {
      const facture = {
        id: doc.id,
        ...doc.data()
      };
      
      // Récupérer les données de l'entreprise
      if (facture.entreprise_id) {
        const entrepriseDoc = await getDoc(doc(db, 'entreprises', facture.entreprise_id));
        if (entrepriseDoc.exists()) {
          facture.entreprises = entrepriseDoc.data();
        }
      }
      
      // Récupérer les données du contrôle
      if (facture.controle_id) {
        const controleDoc = await getDoc(doc(db, 'controles', facture.controle_id));
        if (controleDoc.exists()) {
          facture.controles = controleDoc.data();
        }
      }
      
      factures.push(facture);
    }
    
    return factures;
  }

  static async create(facture: Omit<Facture, 'id' | 'created_at' | 'updated_at'>): Promise<Facture> {
    const now = Timestamp.now();
    const factureData = {
      ...facture,
      created_at: now,
      updated_at: now
    };
    
    const docRef = await addDoc(collection(db, 'factures'), factureData);
    return {
      id: docRef.id,
      ...factureData
    } as Facture;
  }

  static async update(id: string, facture: Partial<Facture>): Promise<Facture> {
    const docRef = doc(db, 'factures', id);
    const updateData = {
      ...facture,
      updated_at: Timestamp.now()
    };
    
    await updateDoc(docRef, updateData);
    
    const updatedDoc = await getDoc(docRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as Facture;
  }

  static async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'factures', id));
  }

  static async markAsPaid(id: string, paymentData: {
    mode_paiement: string;
    numero_transaction?: string;
  }): Promise<Facture> {
    const docRef = doc(db, 'factures', id);
    const updateData = {
      statut: 'payee' as const,
      date_paiement: new Date().toISOString().split('T')[0],
      ...paymentData,
      updated_at: Timestamp.now()
    };
    
    await updateDoc(docRef, updateData);
    
    const updatedDoc = await getDoc(docRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as Facture;
  }
}

// Fonction utilitaire pour l'authentification
export const signInUser = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => {
  return await signOut(auth);
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};