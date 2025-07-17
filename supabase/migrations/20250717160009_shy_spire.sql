/*
  # Base de données des Agents AGANOR

  1. Nouvelle Table
    - `agents`
      - `id` (uuid, primary key)
      - `numero_matricule` (text, unique)
      - `nom` (text, required)
      - `prenom` (text, required)
      - `email` (text, unique, required)
      - `telephone` (text)
      - `role` (text, required)
      - `zone` (text)
      - `statut` (text, default 'actif')
      - `date_embauche` (date)
      - `adresse` (text)
      - `date_naissance` (date)
      - `lieu_naissance` (text)
      - `nationalite` (text, default 'Gabonaise')
      - `situation_matrimoniale` (text)
      - `nombre_enfants` (integer, default 0)
      - `niveau_etude` (text)
      - `diplomes` (jsonb)
      - `certifications` (jsonb)
      - `salaire` (decimal)
      - `type_contrat` (text)
      - `date_fin_contrat` (date)
      - `superviseur` (text)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `password_hash` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur la table `agents`
    - Politique pour les utilisateurs authentifiés

  3. Données initiales
    - Insertion des agents existants avec incrémentation automatique
*/

-- Créer la table des agents
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_matricule text UNIQUE,
  nom text NOT NULL,
  prenom text NOT NULL,
  email text UNIQUE NOT NULL,
  telephone text,
  role text NOT NULL CHECK (role IN ('inspecteur', 'superviseur', 'admin', 'technicien_qualite', 'technicien_metrologie')),
  zone text,
  statut text DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'conge')),
  date_embauche date,
  adresse text,
  date_naissance date,
  lieu_naissance text,
  nationalite text DEFAULT 'Gabonaise',
  situation_matrimoniale text CHECK (situation_matrimoniale IN ('celibataire', 'marie', 'divorce', 'veuf')),
  nombre_enfants integer DEFAULT 0,
  niveau_etude text,
  diplomes jsonb DEFAULT '[]'::jsonb,
  certifications jsonb DEFAULT '[]'::jsonb,
  salaire decimal(10,2),
  type_contrat text CHECK (type_contrat IN ('cdi', 'cdd', 'stage', 'consultant')),
  date_fin_contrat date,
  superviseur text,
  latitude decimal(10,8),
  longitude decimal(11,8),
  password_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs authentifiés
CREATE POLICY "Agents peuvent lire leurs propres données"
  ON agents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins peuvent tout gérer"
  ON agents
  FOR ALL
  TO authenticated
  USING (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role);
CREATE INDEX IF NOT EXISTS idx_agents_statut ON agents(statut);
CREATE INDEX IF NOT EXISTS idx_agents_matricule ON agents(numero_matricule);

-- Insérer les agents existants
INSERT INTO agents (
  numero_matricule, nom, prenom, email, telephone, role, zone, statut,
  date_embauche, adresse, date_naissance, lieu_naissance, nationalite,
  situation_matrimoniale, nombre_enfants, niveau_etude, diplomes,
  certifications, salaire, type_contrat, superviseur, latitude, longitude,
  password_hash
) VALUES 
(
  'AG2025001', 'MBADINGA', 'Jean-Claude', 'jc.mbadinga@aganor.ga', '+241 06 12 34 56',
  'inspecteur', 'Libreville Nord', 'actif', '2020-01-15',
  'Quartier Nombakélé, Libreville', '1985-03-20', 'Libreville', 'Gabonaise',
  'marie', 2, 'Master', '["Master en Métrologie", "Licence en Physique"]'::jsonb,
  '["ISO 9001", "Métrologie Légale"]'::jsonb, 750000, 'cdi', 'Marie-Claire BONGO',
  0.3901, 9.4544, '$2b$10$example_hash_1'
),
(
  'AG2025002', 'BONGO', 'Marie-Claire', 'mc.bongo@aganor.ga', '+241 06 23 45 67',
  'superviseur', 'Port-Gentil', 'actif', '2018-06-01',
  'Centre-ville, Port-Gentil', '1980-07-15', 'Port-Gentil', 'Gabonaise',
  'marie', 3, 'École d''ingénieur', '["Ingénieur en Métrologie", "Master en Management"]'::jsonb,
  '["ISO 17025", "Management Qualité", "Audit Interne"]'::jsonb, 950000, 'cdi', null,
  -0.7193, 8.7815, '$2b$10$example_hash_2'
),
(
  'AG2025003', 'NDONG', 'Martin', 'm.ndong@aganor.ga', '+241 06 34 56 78',
  'inspecteur', 'Libreville Sud', 'actif', '2021-03-10',
  'Quartier Akanda, Libreville', '1988-11-05', 'Oyem', 'Gabonaise',
  'celibataire', 0, 'Master', '["Master en Instrumentation", "Licence en Électronique"]'::jsonb,
  '["Métrologie Électrique", "Sécurité Industrielle"]'::jsonb, 650000, 'cdi', 'Marie-Claire BONGO',
  0.4162, 9.4673, '$2b$10$example_hash_3'
),
(
  'AG2025004', 'OBAME', 'Pascal', 'p.obame@aganor.ga', '+241 06 45 67 89',
  'admin', 'Toutes zones', 'actif', '2019-09-01',
  'Centre administratif, Libreville', '1982-04-12', 'Franceville', 'Gabonaise',
  'marie', 1, 'Master', '["Master en Administration", "Licence en Gestion"]'::jsonb,
  '["Gestion de Projet", "Administration Système"]'::jsonb, 850000, 'cdi', null,
  0.3901, 9.4544, '$2b$10$example_hash_4'
),
(
  'AG2025005', 'MIGUELI', 'Paul', 'p.migueli@aganor.ga', '+241 77 52 42 21',
  'technicien_qualite', 'Libreville', 'actif', '2022-01-15',
  'Quartier Glass, Libreville', '1990-08-25', 'Lambaréné', 'Gabonaise',
  'celibataire', 0, 'BTS/DUT', '["BTS Qualité", "Formation Métrologie"]'::jsonb,
  '["ISO 9001", "Contrôle Qualité"]'::jsonb, 450000, 'cdi', 'Jean-Claude MBADINGA',
  0.3901, 9.4544, '$2b$10$example_hash_5'
),
(
  'AG2025006', 'MBA EKOMY', 'Jean', 'j.mba-ekomy@aganor.ga', '+241 77 92 44 21',
  'technicien_metrologie', 'Libreville', 'actif', '2021-08-10',
  'Quartier Batterie IV, Libreville', '1987-12-03', 'Libreville', 'Gabonaise',
  'marie', 1, 'BTS/DUT', '["BTS Métrologie", "Formation Technique"]'::jsonb,
  '["Métrologie Légale", "Étalonnage"]'::jsonb, 480000, 'cdi', 'Jean-Claude MBADINGA',
  0.3901, 9.4544, '$2b$10$example_hash_6'
),
(
  'AG2025007', 'KOUMBA', 'Jérome', 'j.koumba@aganor.ga', '+241 77 92 44 21',
  'technicien_metrologie', 'Libreville', 'conge', '2020-05-20',
  'Quartier PK5, Libreville', '1989-09-18', 'Oyem', 'Gabonaise',
  'celibataire', 0, 'BTS/DUT', '["BTS Métrologie"]'::jsonb,
  '["Métrologie Légale"]'::jsonb, 460000, 'cdi', 'Jean-Claude MBADINGA',
  0.3901, 9.4544, '$2b$10$example_hash_7'
),
(
  'AG2025008', 'DIESSIEMOU', 'Gildas', 'g.diessiemou@aganor.ga', '+241 67 67 44 21',
  'technicien_metrologie', 'Libreville', 'actif', '2022-03-01',
  'Quartier Lalala, Libreville', '1991-06-12', 'Franceville', 'Gabonaise',
  'marie', 2, 'BTS/DUT', '["BTS Métrologie", "Formation Spécialisée"]'::jsonb,
  '["Métrologie Légale", "Contrôle Technique"]'::jsonb, 470000, 'cdi', 'Jean-Claude MBADINGA',
  0.3901, 9.4544, '$2b$10$example_hash_8'
),
(
  'AG2025009', 'OYINI', 'Viviane', 'v.oyini@aganor.ga', '+241 77 92 47 65',
  'technicien_metrologie', 'Libreville', 'actif', '2021-11-15',
  'Quartier Nzeng-Ayong, Libreville', '1990-04-28', 'Lambaréné', 'Gabonaise',
  'marie', 1, 'BTS/DUT', '["BTS Métrologie"]'::jsonb,
  '["Métrologie Légale", "Qualité"]'::jsonb, 465000, 'cdi', 'Jean-Claude MBADINGA',
  0.3901, 9.4544, '$2b$10$example_hash_9'
),
(
  'AG2025010', 'PENDY', 'Vanessa', 'v.pendy@aganor.ga', '+241 20 96 24 421',
  'technicien_metrologie', 'Libreville', 'actif', '2022-07-01',
  'Quartier Cocotiers, Libreville', '1992-01-15', 'Port-Gentil', 'Gabonaise',
  'celibataire', 0, 'BTS/DUT', '["BTS Métrologie"]'::jsonb,
  '["Métrologie Légale"]'::jsonb, 455000, 'cdi', 'Jean-Claude MBADINGA',
  0.3901, 9.4544, '$2b$10$example_hash_10'
);

-- Fonction pour générer automatiquement le numéro de matricule
CREATE OR REPLACE FUNCTION generate_matricule()
RETURNS text AS $$
DECLARE
  year_part text;
  sequence_part text;
  next_number integer;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero_matricule FROM 7) AS integer)), 0) + 1
  INTO next_number
  FROM agents
  WHERE numero_matricule LIKE 'AG' || year_part || '%';
  
  sequence_part := LPAD(next_number::text, 3, '0');
  
  RETURN 'AG' || year_part || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-générer le matricule si non fourni
CREATE OR REPLACE FUNCTION set_matricule_if_null()
RETURNS trigger AS $$
BEGIN
  IF NEW.numero_matricule IS NULL THEN
    NEW.numero_matricule := generate_matricule();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_set_matricule
  BEFORE INSERT OR UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION set_matricule_if_null();