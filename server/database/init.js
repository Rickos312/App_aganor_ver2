import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../database.sqlite');

// Ensure database directory exists
const dbDir = dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new sqlite3.Database(DB_PATH);

export async function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Table des utilisateurs/agents
      db.run(`
        CREATE TABLE IF NOT EXISTS agents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          numero_matricule TEXT UNIQUE,
          nom TEXT NOT NULL,
          prenom TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          telephone TEXT,
          role TEXT NOT NULL CHECK (role IN ('inspecteur', 'superviseur', 'admin', 'technicien_qualite', 'technicien_metrologie')),
          zone TEXT,
          statut TEXT DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'conge')),
          date_embauche DATE,
          adresse TEXT,
          date_naissance DATE,
          lieu_naissance TEXT,
          nationalite TEXT DEFAULT 'Gabonaise',
          situation_matrimoniale TEXT CHECK (situation_matrimoniale IN ('celibataire', 'marie', 'divorce', 'veuf')),
          nombre_enfants INTEGER DEFAULT 0,
          niveau_etude TEXT,
          diplomes TEXT, -- JSON array
          certifications TEXT, -- JSON array
          salaire DECIMAL(10,2),
          type_contrat TEXT CHECK (type_contrat IN ('cdi', 'cdd', 'stage', 'consultant')),
          date_fin_contrat DATE,
          superviseur TEXT,
          latitude DECIMAL(10,8),
          longitude DECIMAL(11,8),
          password_hash TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Table des entreprises
      db.run(`
        CREATE TABLE IF NOT EXISTS entreprises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          siret TEXT UNIQUE NOT NULL,
          nom TEXT NOT NULL,
          adresse TEXT,
          telephone TEXT,
          email TEXT,
          secteur TEXT NOT NULL,
          statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('conforme', 'non_conforme', 'en_attente')),
          dernier_controle DATE,
          latitude DECIMAL(10,8),
          longitude DECIMAL(11,8),
          point_contact_nom TEXT,
          point_contact_prenom TEXT,
          point_contact_telephone TEXT,
          point_contact_email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Table des instruments de mesure
      db.run(`
        CREATE TABLE IF NOT EXISTS instruments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          entreprise_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          marque TEXT,
          modele TEXT,
          numero_serie TEXT,
          localisation TEXT,
          statut TEXT DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'maintenance')),
          date_derniere_verification DATE,
          date_prochaine_verification DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (entreprise_id) REFERENCES entreprises (id) ON DELETE CASCADE
        )
      `);

      // Table des contrôles
      db.run(`
        CREATE TABLE IF NOT EXISTS controles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          entreprise_id INTEGER NOT NULL,
          agent_id INTEGER NOT NULL,
          type_controle TEXT NOT NULL,
          date_planifiee DATE,
          date_realisation DATE,
          heure_debut TIME,
          heure_fin TIME,
          statut TEXT DEFAULT 'planifie' CHECK (statut IN ('planifie', 'en_cours', 'termine', 'reporte', 'annule')),
          resultat TEXT CHECK (resultat IN ('conforme', 'non_conforme', 'en_attente')),
          observations TEXT,
          rapport_url TEXT,
          priorite TEXT DEFAULT 'normale' CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')),
          progression INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (entreprise_id) REFERENCES entreprises (id) ON DELETE CASCADE,
          FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE
        )
      `);

      // Table de liaison contrôles-instruments
      db.run(`
        CREATE TABLE IF NOT EXISTS controle_instruments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          controle_id INTEGER NOT NULL,
          instrument_id INTEGER NOT NULL,
          resultat TEXT CHECK (resultat IN ('conforme', 'non_conforme', 'en_attente')),
          observations TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (controle_id) REFERENCES controles (id) ON DELETE CASCADE,
          FOREIGN KEY (instrument_id) REFERENCES instruments (id) ON DELETE CASCADE,
          UNIQUE(controle_id, instrument_id)
        )
      `);

      // Table des factures
      db.run(`
        CREATE TABLE IF NOT EXISTS factures (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          numero_facture TEXT UNIQUE NOT NULL,
          entreprise_id INTEGER NOT NULL,
          controle_id INTEGER,
          montant_ht DECIMAL(10,2) NOT NULL,
          tva DECIMAL(5,2) DEFAULT 18.0,
          montant_ttc DECIMAL(10,2) NOT NULL,
          date_emission DATE NOT NULL,
          date_echeance DATE,
          date_paiement DATE,
          statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'payee', 'en_retard', 'annulee')),
          mode_paiement TEXT CHECK (mode_paiement IN ('carte_bancaire', 'airtel_money', 'mobile_money', 'virement', 'especes')),
          numero_transaction TEXT,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (entreprise_id) REFERENCES entreprises (id) ON DELETE CASCADE,
          FOREIGN KEY (controle_id) REFERENCES controles (id) ON DELETE SET NULL
        )
      `);

      // Table des sessions utilisateur
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          agent_id INTEGER NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE
        )
      `);

      // Table des logs d'activité
      db.run(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          agent_id INTEGER,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id INTEGER,
          details TEXT, -- JSON
          ip_address TEXT,
          user_agent TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE SET NULL
        )
      `);

      // Index pour améliorer les performances
      db.run(`CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_entreprises_siret ON entreprises(siret)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_entreprises_secteur ON entreprises(secteur)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_controles_date ON controles(date_planifiee)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_controles_statut ON controles(statut)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures(statut)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_factures_date ON factures(date_emission)`);

      console.log('✅ Tables de base de données créées avec succès');
      resolve();
    });

    db.on('error', (err) => {
      console.error('❌ Erreur de base de données:', err);
      reject(err);
    });
  });
}

// Fonction utilitaire pour exécuter des requêtes
export function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

export function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}