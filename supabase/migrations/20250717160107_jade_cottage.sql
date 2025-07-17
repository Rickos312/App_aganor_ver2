/*
  # Base de données des Entreprises

  1. Nouvelle Table
    - `entreprises`
      - `id` (uuid, primary key)
      - `siret` (text, unique, required)
      - `nom` (text, required)
      - `adresse` (text)
      - `telephone` (text)
      - `email` (text)
      - `secteur` (text, required)
      - `statut` (text, default 'en_attente')
      - `dernier_controle` (date)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `point_contact_nom` (text)
      - `point_contact_prenom` (text)
      - `point_contact_telephone` (text)
      - `point_contact_email` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Table des instruments
    - `instruments`
      - `id` (uuid, primary key)
      - `entreprise_id` (uuid, foreign key)
      - `type` (text, required)
      - `marque` (text)
      - `modele` (text)
      - `numero_serie` (text)
      - `localisation` (text)
      - `statut` (text, default 'actif')
      - `date_derniere_verification` (date)
      - `date_prochaine_verification` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  3. Sécurité
    - Enable RLS sur les tables
    - Politiques pour les utilisateurs authentifiés

  4. Données initiales
    - Insertion des entreprises existantes avec incrémentation automatique
*/

-- Créer la table des entreprises
CREATE TABLE IF NOT EXISTS entreprises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  siret text UNIQUE NOT NULL,
  nom text NOT NULL,
  adresse text,
  telephone text,
  email text,
  secteur text NOT NULL,
  statut text DEFAULT 'en_attente' CHECK (statut IN ('conforme', 'non_conforme', 'en_attente')),
  dernier_controle date,
  latitude decimal(10,8),
  longitude decimal(11,8),
  point_contact_nom text,
  point_contact_prenom text,
  point_contact_telephone text,
  point_contact_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Créer la table des instruments
CREATE TABLE IF NOT EXISTS instruments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id uuid NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  type text NOT NULL,
  marque text,
  modele text,
  numero_serie text,
  localisation text,
  statut text DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'maintenance')),
  date_derniere_verification date,
  date_prochaine_verification date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE entreprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;

-- Politiques pour les entreprises
CREATE POLICY "Utilisateurs authentifiés peuvent lire les entreprises"
  ON entreprises
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent gérer les entreprises"
  ON entreprises
  FOR ALL
  TO authenticated
  USING (true);

-- Politiques pour les instruments
CREATE POLICY "Utilisateurs authentifiés peuvent lire les instruments"
  ON instruments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent gérer les instruments"
  ON instruments
  FOR ALL
  TO authenticated
  USING (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_entreprises_siret ON entreprises(siret);
CREATE INDEX IF NOT EXISTS idx_entreprises_secteur ON entreprises(secteur);
CREATE INDEX IF NOT EXISTS idx_entreprises_statut ON entreprises(statut);
CREATE INDEX IF NOT EXISTS idx_instruments_entreprise ON instruments(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_instruments_type ON instruments(type);

-- Insérer les entreprises existantes
INSERT INTO entreprises (
  siret, nom, adresse, telephone, email, secteur, statut, dernier_controle,
  latitude, longitude, point_contact_nom, point_contact_prenom,
  point_contact_telephone, point_contact_email
) VALUES 
(
  '12345678901234', 'SOGATRA', 'Boulevard de la République, Libreville',
  '+241 01 23 45 67', 'contact@sogatra.ga', 'Transport', 'conforme', '2025-01-15',
  0.3901, 9.4544, 'NZIGOU', 'Pierre', '+241 01 23 45 68', 'p.nzigou@sogatra.ga'
),
(
  '23456789012345', 'Total Gabon', 'Avenue du Colonel Parant, Port-Gentil',
  '+241 02 34 56 78', 'info@total.ga', 'Pétrole', 'non_conforme', '2025-01-14',
  -0.7193, 8.7815, 'MOUKETOU', 'Jean', '+241 02 34 56 79', 'j.mouketou@total.ga'
),
(
  '34567890123456', 'Pharmacie Centrale', 'Quartier Louis, Libreville',
  '+241 03 45 67 89', 'contact@pharmacie-centrale.ga', 'Santé', 'conforme', '2025-01-13',
  0.3901, 9.4544, 'OBIANG', 'Marie', '+241 03 45 67 90', 'm.obiang@pharmacie-centrale.ga'
),
(
  '45678901234567', 'Casino Supermarché', 'Centre-ville, Libreville',
  '+241 04 56 78 90', 'info@casino.ga', 'Commerce', 'en_attente', '2025-01-10',
  0.3901, 9.4544, 'MBOUMBA', 'Claire', '+241 04 56 78 91', 'c.mboumba@casino.ga'
),
(
  '56789012345678', 'Shell Gabon', 'Zone Industrielle, Port-Gentil',
  '+241 05 67 89 01', 'contact@shell.ga', 'Pétrole', 'conforme', '2025-01-12',
  -0.7193, 8.7815, 'KOUMBA', 'Patrick', '+241 05 67 89 02', 'p.koumba@shell.ga'
),
(
  '67890123456789', 'Carrefour Immaculé', 'Quartier Immaculé Conception, Libreville',
  '+241 06 78 90 12', 'contact@carrefour-immacule.ga', 'Commerce', 'en_attente', '2025-01-11',
  0.3901, 9.4544, 'OBIANG', 'Marie-France', '+241 06 78 90 13', 'marie.obiang@carrefour-immacule.ga'
),
(
  '78901234567890', 'Station Total Gabon', 'Boulevard Triomphal, Libreville',
  '+241 07 89 01 23', 'station@total-gabon.ga', 'Pétrole', 'conforme', '2025-01-09',
  0.3901, 9.4544, 'MBOUMBA', 'Jean-Pierre', '+241 07 89 01 24', 'jp.mboumba@total-gabon.ga'
),
(
  '89012345678901', 'Petro-Gabon', 'Route de l''Aéroport, Libreville',
  '+241 08 90 12 34', 'info@petro-gabon.ga', 'Pétrole', 'non_conforme', '2025-01-08',
  0.3901, 9.4544, 'NZIGOU', 'Patrick', '+241 08 90 12 35', 'p.nzigou@petro-gabon.ga'
),
(
  '90123456789012', 'ETS-Jean Pneu', 'Quartier Akanda, Libreville',
  '+241 09 01 23 45', 'contact@ets-jean-pneu.ga', 'Commerce', 'en_attente', '2025-01-07',
  0.3901, 9.4544, 'MOUKETOU', 'Jean', '+241 09 01 23 46', 'j.mouketou@ets-jean-pneu.ga'
);

-- Insérer les instruments pour chaque entreprise
DO $$
DECLARE
  sogatra_id uuid;
  total_id uuid;
  pharmacie_id uuid;
  casino_id uuid;
  shell_id uuid;
  carrefour_id uuid;
  station_total_id uuid;
  petro_id uuid;
  ets_jean_id uuid;
BEGIN
  -- Récupérer les IDs des entreprises
  SELECT id INTO sogatra_id FROM entreprises WHERE siret = '12345678901234';
  SELECT id INTO total_id FROM entreprises WHERE siret = '23456789012345';
  SELECT id INTO pharmacie_id FROM entreprises WHERE siret = '34567890123456';
  SELECT id INTO casino_id FROM entreprises WHERE siret = '45678901234567';
  SELECT id INTO shell_id FROM entreprises WHERE siret = '56789012345678';
  SELECT id INTO carrefour_id FROM entreprises WHERE siret = '67890123456789';
  SELECT id INTO station_total_id FROM entreprises WHERE siret = '78901234567890';
  SELECT id INTO petro_id FROM entreprises WHERE siret = '89012345678901';
  SELECT id INTO ets_jean_id FROM entreprises WHERE siret = '90123456789012';

  -- Instruments pour SOGATRA
  INSERT INTO instruments (entreprise_id, type, marque, modele, numero_serie, localisation) VALUES
  (sogatra_id, 'Balance commerciale', 'Mettler Toledo', 'XS204', 'MT2025001', 'Caisse principale');

  -- Instruments pour Total Gabon
  INSERT INTO instruments (entreprise_id, type, marque, modele, numero_serie, localisation) VALUES
  (total_id, 'Compteur carburant', 'Gilbarco', 'Encore 700S', 'GB2025001', 'Station 1'),
  (total_id, 'Compteur carburant', 'Wayne', 'Helix 6000', 'WY2025001', 'Station 2');

  -- Instruments pour Pharmacie Centrale
  INSERT INTO instruments (entreprise_id, type, marque, modele, numero_serie, localisation) VALUES
  (pharmacie_id, 'Balance de précision', 'Sartorius', 'Entris', 'SR2025001', 'Laboratoire');

  -- Instruments pour Casino Supermarché
  INSERT INTO instruments (entreprise_id, type, marque, modele, numero_serie, localisation) VALUES
  (casino_id, 'Balance commerciale', 'Mettler Toledo', 'XS204', 'MT2025002', 'Caisse 1'),
  (casino_id, 'Balance commerciale', 'Sartorius', 'Entris', 'SR2025002', 'Caisse 2');

  -- Instruments pour Shell Gabon
  INSERT INTO instruments (entreprise_id, type, marque, modele, numero_serie, localisation) VALUES
  (shell_id, 'Pompe à essence', 'Gilbarco', 'Encore 700S', 'GB2025002', 'Îlot 1'),
  (shell_id, 'Pompe à essence', 'Wayne', 'Helix 6000', 'WY2025002', 'Îlot 2');

  -- Instruments pour Carrefour Immaculé
  INSERT INTO instruments (entreprise_id, type, marque, modele, numero_serie, localisation) VALUES
  (carrefour_id, 'Balance commerciale', 'Mettler Toledo', 'XS204', 'MT2025003', 'Caisse principale');

  -- Instruments pour Station Total Gabon
  INSERT INTO instruments (entreprise_id, type, marque, modele, numero_serie, localisation) VALUES
  (station_total_id, 'Pompe à essence', 'Gilbarco', 'Encore 700S', 'GB2025003', 'Îlot 1');

  -- Instruments pour Petro-Gabon
  INSERT INTO instruments (entreprise_id, type, marque, modele, numero_serie, localisation) VALUES
  (petro_id, 'Pompe à essence', 'Wayne', 'Helix 6000', 'WY2025003', 'Îlot principal');

  -- Instruments pour ETS-Jean Pneu
  INSERT INTO instruments (entreprise_id, type, marque, modele, numero_serie, localisation) VALUES
  (ets_jean_id, 'Manomètre à pression', 'Bourdon Haenni', 'BH-250', 'BH2025001', 'Atelier principal');
END $$;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entreprises_updated_at
  BEFORE UPDATE ON entreprises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER instruments_updated_at
  BEFORE UPDATE ON instruments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();