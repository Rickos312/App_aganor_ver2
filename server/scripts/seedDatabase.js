import bcrypt from 'bcryptjs';
import { runQuery } from '../database/init.js';

async function seedDatabase() {
  try {
    console.log('🌱 Début du peuplement de la base de données...');

    // Agents de test
    const agents = [
      {
        numero_matricule: 'AG2025001',
        nom: 'MBADINGA',
        prenom: 'Jean-Claude',
        email: 'jc.mbadinga@aganor.ga',
        telephone: '+241 06 12 34 56',
        role: 'inspecteur',
        zone: 'Libreville Nord',
        statut: 'actif',
        date_embauche: '2020-01-15',
        adresse: 'Quartier Nombakélé, Libreville',
        date_naissance: '1985-03-20',
        lieu_naissance: 'Libreville',
        nationalite: 'Gabonaise',
        situation_matrimoniale: 'marie',
        nombre_enfants: 2,
        niveau_etude: 'Master',
        diplomes: JSON.stringify(['Master en Métrologie', 'Licence en Physique']),
        certifications: JSON.stringify(['ISO 9001', 'Métrologie Légale']),
        salaire: 750000,
        type_contrat: 'cdi',
        superviseur: 'Marie-Claire BONGO',
        latitude: 0.3901,
        longitude: 9.4544
      },
      {
        numero_matricule: 'AG2025002',
        nom: 'BONGO',
        prenom: 'Marie-Claire',
        email: 'mc.bongo@aganor.ga',
        telephone: '+241 06 23 45 67',
        role: 'superviseur',
        zone: 'Port-Gentil',
        statut: 'actif',
        date_embauche: '2018-06-01',
        adresse: 'Centre-ville, Port-Gentil',
        date_naissance: '1980-07-15',
        lieu_naissance: 'Port-Gentil',
        nationalite: 'Gabonaise',
        situation_matrimoniale: 'marie',
        nombre_enfants: 3,
        niveau_etude: 'École d\'ingénieur',
        diplomes: JSON.stringify(['Ingénieur en Métrologie', 'Master en Management']),
        certifications: JSON.stringify(['ISO 17025', 'Management Qualité', 'Audit Interne']),
        salaire: 950000,
        type_contrat: 'cdi',
        superviseur: null,
        latitude: -0.7193,
        longitude: 8.7815
      },
      {
        numero_matricule: 'AG2025003',
        nom: 'NDONG',
        prenom: 'Martin',
        email: 'm.ndong@aganor.ga',
        telephone: '+241 06 34 56 78',
        role: 'inspecteur',
        zone: 'Libreville Sud',
        statut: 'actif',
        date_embauche: '2021-03-10',
        adresse: 'Quartier Akanda, Libreville',
        date_naissance: '1988-11-05',
        lieu_naissance: 'Oyem',
        nationalite: 'Gabonaise',
        situation_matrimoniale: 'celibataire',
        nombre_enfants: 0,
        niveau_etude: 'Master',
        diplomes: JSON.stringify(['Master en Instrumentation', 'Licence en Électronique']),
        certifications: JSON.stringify(['Métrologie Électrique', 'Sécurité Industrielle']),
        salaire: 650000,
        type_contrat: 'cdi',
        superviseur: 'Marie-Claire BONGO',
        latitude: 0.4162,
        longitude: 9.4673
      },
      {
        numero_matricule: 'AG2025004',
        nom: 'OBAME',
        prenom: 'Pascal',
        email: 'p.obame@aganor.ga',
        telephone: '+241 06 45 67 89',
        role: 'admin',
        zone: 'Toutes zones',
        statut: 'actif',
        date_embauche: '2019-09-01',
        adresse: 'Centre administratif, Libreville',
        date_naissance: '1982-04-12',
        lieu_naissance: 'Franceville',
        nationalite: 'Gabonaise',
        situation_matrimoniale: 'marie',
        nombre_enfants: 1,
        niveau_etude: 'Master',
        diplomes: JSON.stringify(['Master en Administration', 'Licence en Gestion']),
        certifications: JSON.stringify(['Gestion de Projet', 'Administration Système']),
        salaire: 850000,
        type_contrat: 'cdi',
        superviseur: null,
        latitude: 0.3901,
        longitude: 9.4544
      },
      {
        numero_matricule: 'AG2025005',
        nom: 'MIGUELI',
        prenom: 'Paul',
        email: 'p.migueli@aganor.ga',
        telephone: '+241 77 52 42 21',
        role: 'technicien_qualite',
        zone: 'Libreville',
        statut: 'actif',
        date_embauche: '2022-01-15',
        adresse: 'Quartier Glass, Libreville',
        date_naissance: '1990-08-25',
        lieu_naissance: 'Lambaréné',
        nationalite: 'Gabonaise',
        situation_matrimoniale: 'celibataire',
        nombre_enfants: 0,
        niveau_etude: 'BTS/DUT',
        diplomes: JSON.stringify(['BTS Qualité', 'Formation Métrologie']),
        certifications: JSON.stringify(['ISO 9001', 'Contrôle Qualité']),
        salaire: 450000,
        type_contrat: 'cdi',
        superviseur: 'Jean-Claude MBADINGA',
        latitude: 0.3901,
        longitude: 9.4544
      }
    ];

    // Hash des mots de passe (mot de passe par défaut: "aganor2025")
    const defaultPasswordHash = await bcrypt.hash('aganor2025', 10);

    for (const agent of agents) {
      agent.password_hash = defaultPasswordHash;
      
      const sql = `
        INSERT INTO agents (
          numero_matricule, nom, prenom, email, telephone, role, zone, statut,
          date_embauche, adresse, date_naissance, lieu_naissance, nationalite,
          situation_matrimoniale, nombre_enfants, niveau_etude, diplomes,
          certifications, salaire, type_contrat, superviseur, latitude, longitude, password_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await runQuery(sql, [
        agent.numero_matricule, agent.nom, agent.prenom, agent.email, agent.telephone,
        agent.role, agent.zone, agent.statut, agent.date_embauche, agent.adresse,
        agent.date_naissance, agent.lieu_naissance, agent.nationalite,
        agent.situation_matrimoniale, agent.nombre_enfants, agent.niveau_etude,
        agent.diplomes, agent.certifications, agent.salaire, agent.type_contrat,
        agent.superviseur || null, agent.latitude, agent.longitude, agent.password_hash
      ]);
    }

    // Entreprises de test
    const entreprises = [
      {
        siret: '12345678901234',
        nom: 'SOGATRA',
        adresse: 'Boulevard de la République, Libreville',
        telephone: '+241 01 23 45 67',
        email: 'contact@sogatra.ga',
        secteur: 'Transport',
        statut: 'conforme',
        dernier_controle: '2025-01-15',
        latitude: 0.3901,
        longitude: 9.4544,
        point_contact_nom: 'NZIGOU',
        point_contact_prenom: 'Pierre',
        point_contact_telephone: '+241 01 23 45 68',
        point_contact_email: 'p.nzigou@sogatra.ga'
      },
      {
        siret: '23456789012345',
        nom: 'Total Gabon',
        adresse: 'Avenue du Colonel Parant, Port-Gentil',
        telephone: '+241 02 34 56 78',
        email: 'info@total.ga',
        secteur: 'Pétrole',
        statut: 'non_conforme',
        dernier_controle: '2025-01-14',
        latitude: -0.7193,
        longitude: 8.7815,
        point_contact_nom: 'MOUKETOU',
        point_contact_prenom: 'Jean',
        point_contact_telephone: '+241 02 34 56 79',
        point_contact_email: 'j.mouketou@total.ga'
      },
      {
        siret: '34567890123456',
        nom: 'Pharmacie Centrale',
        adresse: 'Quartier Louis, Libreville',
        telephone: '+241 03 45 67 89',
        email: 'contact@pharmacie-centrale.ga',
        secteur: 'Santé',
        statut: 'conforme',
        dernier_controle: '2025-01-13',
        latitude: 0.3901,
        longitude: 9.4544,
        point_contact_nom: 'OBIANG',
        point_contact_prenom: 'Marie',
        point_contact_telephone: '+241 03 45 67 90',
        point_contact_email: 'm.obiang@pharmacie-centrale.ga'
      },
      {
        siret: '45678901234567',
        nom: 'Casino Supermarché',
        adresse: 'Centre-ville, Libreville',
        telephone: '+241 04 56 78 90',
        email: 'info@casino.ga',
        secteur: 'Commerce',
        statut: 'en_attente',
        dernier_controle: '2025-01-10',
        latitude: 0.3901,
        longitude: 9.4544,
        point_contact_nom: 'MBOUMBA',
        point_contact_prenom: 'Claire',
        point_contact_telephone: '+241 04 56 78 91',
        point_contact_email: 'c.mboumba@casino.ga'
      },
      {
        siret: '56789012345678',
        nom: 'Shell Gabon',
        adresse: 'Zone Industrielle, Port-Gentil',
        telephone: '+241 05 67 89 01',
        email: 'contact@shell.ga',
        secteur: 'Pétrole',
        statut: 'conforme',
        dernier_controle: '2025-01-12',
        latitude: -0.7193,
        longitude: 8.7815,
        point_contact_nom: 'KOUMBA',
        point_contact_prenom: 'Patrick',
        point_contact_telephone: '+241 05 67 89 02',
        point_contact_email: 'p.koumba@shell.ga'
      }
    ];

    for (const entreprise of entreprises) {
      const sql = `
        INSERT INTO entreprises (
          siret, nom, adresse, telephone, email, secteur, statut, dernier_controle,
          latitude, longitude, point_contact_nom, point_contact_prenom,
          point_contact_telephone, point_contact_email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await runQuery(sql, [
        entreprise.siret, entreprise.nom, entreprise.adresse, entreprise.telephone,
        entreprise.email, entreprise.secteur, entreprise.statut, entreprise.dernier_controle,
        entreprise.latitude, entreprise.longitude, entreprise.point_contact_nom,
        entreprise.point_contact_prenom, entreprise.point_contact_telephone,
        entreprise.point_contact_email
      ]);
    }

    // Instruments de test
    const instruments = [
      { entreprise_id: 1, type: 'Balance commerciale', marque: 'Mettler Toledo', modele: 'XS204', numero_serie: 'MT2025001', localisation: 'Caisse principale' },
      { entreprise_id: 2, type: 'Compteur carburant', marque: 'Gilbarco', modele: 'Encore 700S', numero_serie: 'GB2025001', localisation: 'Station 1' },
      { entreprise_id: 2, type: 'Compteur carburant', marque: 'Wayne', modele: 'Helix 6000', numero_serie: 'WY2025001', localisation: 'Station 2' },
      { entreprise_id: 3, type: 'Balance de précision', marque: 'Sartorius', modele: 'Entris', numero_serie: 'SR2025001', localisation: 'Laboratoire' },
      { entreprise_id: 4, type: 'Balance commerciale', marque: 'Mettler Toledo', modele: 'XS204', numero_serie: 'MT2025002', localisation: 'Caisse 1' },
      { entreprise_id: 4, type: 'Balance commerciale', marque: 'Sartorius', modele: 'Entris', numero_serie: 'SR2025002', localisation: 'Caisse 2' },
      { entreprise_id: 5, type: 'Pompe à essence', marque: 'Gilbarco', modele: 'Encore 700S', numero_serie: 'GB2025002', localisation: 'Îlot 1' },
      { entreprise_id: 5, type: 'Pompe à essence', marque: 'Wayne', modele: 'Helix 6000', numero_serie: 'WY2025002', localisation: 'Îlot 2' }
    ];

    for (const instrument of instruments) {
      const sql = `
        INSERT INTO instruments (entreprise_id, type, marque, modele, numero_serie, localisation, statut)
        VALUES (?, ?, ?, ?, ?, ?, 'actif')
      `;
      
      await runQuery(sql, [
        instrument.entreprise_id, instrument.type, instrument.marque,
        instrument.modele, instrument.numero_serie, instrument.localisation
      ]);
    }

    // Contrôles de test
    const controles = [
      {
        entreprise_id: 1,
        agent_id: 1,
        type_controle: 'Balance commerciale',
        date_planifiee: '2025-01-16',
        heure_debut: '09:00',
        statut: 'planifie',
        priorite: 'normale'
      },
      {
        entreprise_id: 2,
        agent_id: 2,
        type_controle: 'Compteur carburant',
        date_planifiee: '2025-01-17',
        heure_debut: '14:00',
        statut: 'planifie',
        priorite: 'haute'
      },
      {
        entreprise_id: 3,
        agent_id: 3,
        type_controle: 'Balance de précision',
        date_planifiee: '2025-01-15',
        date_realisation: '2025-01-15',
        heure_debut: '10:00',
        heure_fin: '12:00',
        statut: 'termine',
        resultat: 'conforme',
        observations: 'Contrôle effectué avec succès. Tous les instruments sont conformes.',
        progression: 100
      },
      {
        entreprise_id: 4,
        agent_id: 1,
        type_controle: 'Balance commerciale',
        date_planifiee: '2025-01-18',
        heure_debut: '08:30',
        statut: 'en_cours',
        progression: 65
      }
    ];

    for (const controle of controles) {
      const sql = `
        INSERT INTO controles (
          entreprise_id, agent_id, type_controle, date_planifiee, date_realisation,
          heure_debut, heure_fin, statut, resultat, observations, priorite, progression
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await runQuery(sql, [
        controle.entreprise_id, controle.agent_id, controle.type_controle,
        controle.date_planifiee, controle.date_realisation || null,
        controle.heure_debut, controle.heure_fin || null,
        controle.statut, controle.resultat || null, controle.observations || null,
        controle.priorite || null, controle.progression || null
      ]);
    }

    // Factures de test
    const factures = [
      {
        numero_facture: 'F-2025-001',
        entreprise_id: 1,
        controle_id: 3,
        montant_ht: 106779.66,
        tva: 18.0,
        montant_ttc: 126000,
        date_emission: '2025-01-15',
        date_echeance: '2025-02-15',
        statut: 'en_attente',
        description: 'Contrôle métrologique - Balance commerciale'
      },
      {
        numero_facture: 'F-2025-002',
        entreprise_id: 2,
        montant_ht: 72033.90,
        tva: 18.0,
        montant_ttc: 85000,
        date_emission: '2025-01-12',
        date_echeance: '2025-02-12',
        statut: 'en_attente',
        description: 'Contrôle métrologique - Compteur carburant'
      },
      {
        numero_facture: 'F-2024-156',
        entreprise_id: 3,
        montant_ht: 80508.47,
        tva: 18.0,
        montant_ttc: 95000,
        date_emission: '2024-12-15',
        date_echeance: '2025-01-15',
        date_paiement: '2025-01-10',
        statut: 'payee',
        mode_paiement: 'airtel_money',
        numero_transaction: 'AM2025001234',
        description: 'Contrôle métrologique - Balance de précision'
      },
      {
        numero_facture: 'F-2024-155',
        entreprise_id: 4,
        montant_ht: 127118.64,
        tva: 18.0,
        montant_ttc: 150000,
        date_emission: '2024-12-10',
        date_echeance: '2025-01-10',
        statut: 'en_retard',
        description: 'Contrôle métrologique - Balance commerciale'
      }
    ];

    for (const facture of factures) {
      const sql = `
        INSERT INTO factures (
          numero_facture, entreprise_id, controle_id, montant_ht, tva, montant_ttc,
          date_emission, date_echeance, date_paiement, statut, mode_paiement,
          numero_transaction, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await runQuery(sql, [
        facture.numero_facture, facture.entreprise_id, facture.controle_id || null,
        facture.montant_ht, facture.tva, facture.montant_ttc,
        facture.date_emission, facture.date_echeance, facture.date_paiement || null,
        facture.statut, facture.mode_paiement || null, facture.numero_transaction || null,
        facture.description
      ]);
    }

    console.log('✅ Base de données peuplée avec succès !');
    console.log('📊 Données créées :');
    console.log(`   - ${agents.length} agents`);
    console.log(`   - ${entreprises.length} entreprises`);
    console.log(`   - ${instruments.length} instruments`);
    console.log(`   - ${controles.length} contrôles`);
    console.log(`   - ${factures.length} factures`);
    console.log('🔑 Mot de passe par défaut pour tous les agents : aganor2025');

  } catch (error) {
    console.error('❌ Erreur lors du peuplement de la base de données:', error);
    throw error;
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Peuplement terminé avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export default seedDatabase;