/*
  # Base de données des Factures

  1. Nouvelle Table
    - `factures`
      - `id` (uuid, primary key)
      - `numero_facture` (text, unique, auto-generated)
      - `entreprise_id` (uuid, foreign key)
      - `controle_id` (uuid, foreign key, nullable)
      - `montant_ht` (decimal, required)
      - `tva` (decimal, default 18.0)
      - `montant_ttc` (decimal, required)
      - `date_emission` (date, required)
      - `date_echeance` (date)
      - `date_paiement` (date)
      - `statut` (text, default 'en_attente')
      - `mode_paiement` (text)
      - `numero_transaction` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur la table
    - Politiques pour les utilisateurs authentifiés

  3. Données initiales
    - Insertion des factures existantes avec incrémentation automatique
*/

-- Créer la table des factures
CREATE TABLE IF NOT EXISTS factures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_facture text UNIQUE,
  entreprise_id uuid NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  controle_id uuid REFERENCES controles(id) ON DELETE SET NULL,
  montant_ht decimal(10,2) NOT NULL,
  tva decimal(5,2) DEFAULT 18.0,
  montant_ttc decimal(10,2) NOT NULL,
  date_emission date NOT NULL,
  date_echeance date,
  date_paiement date,
  statut text DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'payee', 'en_retard', 'annulee')),
  mode_paiement text CHECK (mode_paiement IN ('carte_bancaire', 'airtel_money', 'mobile_money', 'virement', 'especes')),
  numero_transaction text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;

-- Politiques pour les factures
CREATE POLICY "Utilisateurs authentifiés peuvent lire les factures"
  ON factures
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent gérer les factures"
  ON factures
  FOR ALL
  TO authenticated
  USING (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_factures_entreprise ON factures(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_factures_controle ON factures(controle_id);
CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures(statut);
CREATE INDEX IF NOT EXISTS idx_factures_date_emission ON factures(date_emission);
CREATE INDEX IF NOT EXISTS idx_factures_date_echeance ON factures(date_echeance);
CREATE INDEX IF NOT EXISTS idx_factures_numero ON factures(numero_facture);

-- Fonction pour générer automatiquement le numéro de facture
CREATE OR REPLACE FUNCTION generate_numero_facture()
RETURNS text AS $$
DECLARE
  year_part text;
  sequence_part text;
  next_number integer;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero_facture FROM 3 FOR 4) AS integer)), 0) + 1
  INTO next_number
  FROM factures
  WHERE numero_facture LIKE 'F-' || year_part || '%';
  
  sequence_part := LPAD(next_number::text, 3, '0');
  
  RETURN 'F-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-générer le numéro de facture
CREATE OR REPLACE FUNCTION set_numero_facture_if_null()
RETURNS trigger AS $$
BEGIN
  IF NEW.numero_facture IS NULL THEN
    NEW.numero_facture := generate_numero_facture();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER factures_set_numero
  BEFORE INSERT OR UPDATE ON factures
  FOR EACH ROW
  EXECUTE FUNCTION set_numero_facture_if_null();

-- Fonction pour mettre à jour automatiquement les factures en retard
CREATE OR REPLACE FUNCTION update_factures_en_retard()
RETURNS void AS $$
BEGIN
  UPDATE factures 
  SET statut = 'en_retard', updated_at = now()
  WHERE statut = 'en_attente' 
    AND date_echeance IS NOT NULL 
    AND date_echeance < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Insérer les factures existantes
DO $$
DECLARE
  sogatra_id uuid;
  total_id uuid;
  pharmacie_id uuid;
  casino_id uuid;
  controle_termine_id uuid;
BEGIN
  -- Récupérer les IDs des entreprises
  SELECT id INTO sogatra_id FROM entreprises WHERE siret = '12345678901234';
  SELECT id INTO total_id FROM entreprises WHERE siret = '23456789012345';
  SELECT id INTO pharmacie_id FROM entreprises WHERE siret = '34567890123456';
  SELECT id INTO casino_id FROM entreprises WHERE siret = '45678901234567';

  -- Récupérer l'ID du contrôle terminé
  SELECT id INTO controle_termine_id FROM controles WHERE statut = 'termine' LIMIT 1;

  -- Insérer les factures
  INSERT INTO factures (
    numero_facture, entreprise_id, controle_id, montant_ht, tva, montant_ttc,
    date_emission, date_echeance, statut, description
  ) VALUES 
  (
    'F-2025-001', sogatra_id, controle_termine_id, 106779.66, 18.0, 126000,
    '2025-01-15', '2025-02-15', 'en_attente', 'Contrôle métrologique - Balance commerciale'
  ),
  (
    'F-2025-002', total_id, null, 72033.90, 18.0, 85000,
    '2025-01-12', '2025-02-12', 'en_attente', 'Contrôle métrologique - Compteur carburant'
  ),
  (
    'F-2024-156', pharmacie_id, null, 80508.47, 18.0, 95000,
    '2024-12-15', '2025-01-15', 'payee', 'Contrôle métrologique - Balance de précision'
  ),
  (
    'F-2024-155', casino_id, null, 127118.64, 18.0, 150000,
    '2024-12-10', '2025-01-10', 'en_retard', 'Contrôle métrologique - Balance commerciale'
  );

  -- Mettre à jour la facture payée avec les détails de paiement
  UPDATE factures 
  SET date_paiement = '2025-01-10',
      mode_paiement = 'airtel_money',
      numero_transaction = 'AM2025001234'
  WHERE numero_facture = 'F-2024-156';
END $$;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER factures_updated_at
  BEFORE UPDATE ON factures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Créer une tâche cron pour mettre à jour automatiquement les factures en retard (si pg_cron est disponible)
-- SELECT cron.schedule('update-factures-retard', '0 1 * * *', 'SELECT update_factures_en_retard();');