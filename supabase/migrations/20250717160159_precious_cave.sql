/*
  # Base de données des Contrôles

  1. Nouvelle Table
    - `controles`
      - `id` (uuid, primary key)
      - `numero_controle` (text, unique, auto-generated)
      - `entreprise_id` (uuid, foreign key)
      - `agent_id` (uuid, foreign key)
      - `type_controle` (text, required)
      - `date_planifiee` (date, required)
      - `date_realisation` (date)
      - `heure_debut` (time)
      - `heure_fin` (time)
      - `statut` (text, default 'planifie')
      - `resultat` (text)
      - `observations` (text)
      - `rapport_url` (text)
      - `priorite` (text, default 'normale')
      - `progression` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Table de liaison contrôles-instruments
    - `controle_instruments`
      - `id` (uuid, primary key)
      - `controle_id` (uuid, foreign key)
      - `instrument_id` (uuid, foreign key)
      - `resultat` (text)
      - `observations` (text)
      - `created_at` (timestamp)

  3. Sécurité
    - Enable RLS sur les tables
    - Politiques pour les utilisateurs authentifiés

  4. Données initiales
    - Insertion des contrôles existants avec incrémentation automatique
*/

-- Créer la table des contrôles
CREATE TABLE IF NOT EXISTS controles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_controle text UNIQUE,
  entreprise_id uuid NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  type_controle text NOT NULL,
  date_planifiee date NOT NULL,
  date_realisation date,
  heure_debut time,
  heure_fin time,
  statut text DEFAULT 'planifie' CHECK (statut IN ('planifie', 'en_cours', 'termine', 'reporte', 'annule')),
  resultat text CHECK (resultat IN ('conforme', 'non_conforme', 'en_attente')),
  observations text,
  rapport_url text,
  priorite text DEFAULT 'normale' CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')),
  progression integer DEFAULT 0 CHECK (progression >= 0 AND progression <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Créer la table de liaison contrôles-instruments
CREATE TABLE IF NOT EXISTS controle_instruments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  controle_id uuid NOT NULL REFERENCES controles(id) ON DELETE CASCADE,
  instrument_id uuid NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
  resultat text CHECK (resultat IN ('conforme', 'non_conforme', 'en_attente')),
  observations text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(controle_id, instrument_id)
);

-- Activer RLS
ALTER TABLE controles ENABLE ROW LEVEL SECURITY;
ALTER TABLE controle_instruments ENABLE ROW LEVEL SECURITY;

-- Politiques pour les contrôles
CREATE POLICY "Utilisateurs authentifiés peuvent lire les contrôles"
  ON controles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent gérer les contrôles"
  ON controles
  FOR ALL
  TO authenticated
  USING (true);

-- Politiques pour controle_instruments
CREATE POLICY "Utilisateurs authentifiés peuvent lire les contrôle_instruments"
  ON controle_instruments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent gérer les contrôle_instruments"
  ON controle_instruments
  FOR ALL
  TO authenticated
  USING (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_controles_entreprise ON controles(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_controles_agent ON controles(agent_id);
CREATE INDEX IF NOT EXISTS idx_controles_date ON controles(date_planifiee);
CREATE INDEX IF NOT EXISTS idx_controles_statut ON controles(statut);
CREATE INDEX IF NOT EXISTS idx_controles_numero ON controles(numero_controle);
CREATE INDEX IF NOT EXISTS idx_controle_instruments_controle ON controle_instruments(controle_id);
CREATE INDEX IF NOT EXISTS idx_controle_instruments_instrument ON controle_instruments(instrument_id);

-- Fonction pour générer automatiquement le numéro de contrôle
CREATE OR REPLACE FUNCTION generate_numero_controle()
RETURNS text AS $$
DECLARE
  year_part text;
  sequence_part text;
  next_number integer;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero_controle FROM 4) AS integer)), 0) + 1
  INTO next_number
  FROM controles
  WHERE numero_controle LIKE 'CT-' || year_part || '%';
  
  sequence_part := LPAD(next_number::text, 4, '0');
  
  RETURN 'CT-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-générer le numéro de contrôle
CREATE OR REPLACE FUNCTION set_numero_controle_if_null()
RETURNS trigger AS $$
BEGIN
  IF NEW.numero_controle IS NULL THEN
    NEW.numero_controle := generate_numero_controle();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER controles_set_numero
  BEFORE INSERT OR UPDATE ON controles
  FOR EACH ROW
  EXECUTE FUNCTION set_numero_controle_if_null();

-- Insérer les contrôles existants
DO $$
DECLARE
  sogatra_id uuid;
  total_id uuid;
  pharmacie_id uuid;
  casino_id uuid;
  mbadinga_id uuid;
  bongo_id uuid;
  ndong_id uuid;
  obame_id uuid;
  controle1_id uuid;
  controle2_id uuid;
  controle3_id uuid;
  controle4_id uuid;
  instrument1_id uuid;
  instrument2_id uuid;
  instrument3_id uuid;
  instrument4_id uuid;
BEGIN
  -- Récupérer les IDs des entreprises
  SELECT id INTO sogatra_id FROM entreprises WHERE siret = '12345678901234';
  SELECT id INTO total_id FROM entreprises WHERE siret = '23456789012345';
  SELECT id INTO pharmacie_id FROM entreprises WHERE siret = '34567890123456';
  SELECT id INTO casino_id FROM entreprises WHERE siret = '45678901234567';

  -- Récupérer les IDs des agents
  SELECT id INTO mbadinga_id FROM agents WHERE email = 'jc.mbadinga@aganor.ga';
  SELECT id INTO bongo_id FROM agents WHERE email = 'mc.bongo@aganor.ga';
  SELECT id INTO ndong_id FROM agents WHERE email = 'm.ndong@aganor.ga';
  SELECT id INTO obame_id FROM agents WHERE email = 'p.obame@aganor.ga';

  -- Insérer les contrôles
  INSERT INTO controles (
    entreprise_id, agent_id, type_controle, date_planifiee, heure_debut,
    statut, priorite
  ) VALUES 
  (
    sogatra_id, mbadinga_id, 'Balance commerciale', '2025-01-16', '09:00',
    'planifie', 'normale'
  ) RETURNING id INTO controle1_id;

  INSERT INTO controles (
    entreprise_id, agent_id, type_controle, date_planifiee, heure_debut,
    statut, priorite
  ) VALUES 
  (
    total_id, bongo_id, 'Compteur carburant', '2025-01-17', '14:00',
    'planifie', 'haute'
  ) RETURNING id INTO controle2_id;

  INSERT INTO controles (
    entreprise_id, agent_id, type_controle, date_planifiee, date_realisation,
    heure_debut, heure_fin, statut, resultat, observations, progression
  ) VALUES 
  (
    pharmacie_id, ndong_id, 'Balance de précision', '2025-01-15', '2025-01-15',
    '10:00', '12:00', 'termine', 'conforme', 
    'Contrôle effectué avec succès. Tous les instruments sont conformes.', 100
  ) RETURNING id INTO controle3_id;

  INSERT INTO controles (
    entreprise_id, agent_id, type_controle, date_planifiee, heure_debut,
    statut, progression
  ) VALUES 
  (
    casino_id, mbadinga_id, 'Balance commerciale', '2025-01-18', '08:30',
    'en_cours', 65
  ) RETURNING id INTO controle4_id;

  -- Associer les instruments aux contrôles
  SELECT id INTO instrument1_id FROM instruments WHERE entreprise_id = sogatra_id LIMIT 1;
  SELECT id INTO instrument2_id FROM instruments WHERE entreprise_id = total_id LIMIT 1;
  SELECT id INTO instrument3_id FROM instruments WHERE entreprise_id = pharmacie_id LIMIT 1;
  SELECT id INTO instrument4_id FROM instruments WHERE entreprise_id = casino_id LIMIT 1;

  -- Insérer les associations contrôle-instruments
  INSERT INTO controle_instruments (controle_id, instrument_id, resultat) VALUES
  (controle1_id, instrument1_id, 'en_attente'),
  (controle2_id, instrument2_id, 'en_attente'),
  (controle3_id, instrument3_id, 'conforme'),
  (controle4_id, instrument4_id, 'en_attente');
END $$;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER controles_updated_at
  BEFORE UPDATE ON controles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();