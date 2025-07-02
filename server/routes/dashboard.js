import express from 'express';
import { allQuery, getQuery } from '../database/init.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Obtenir les statistiques du tableau de bord
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Statistiques générales
    const entreprisesStats = await getQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'conforme' THEN 1 ELSE 0 END) as conformes,
        SUM(CASE WHEN statut = 'non_conforme' THEN 1 ELSE 0 END) as non_conformes,
        SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente
      FROM entreprises
    `);

    const controlesStats = await getQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'planifie' THEN 1 ELSE 0 END) as planifies,
        SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as en_cours,
        SUM(CASE WHEN statut = 'termine' THEN 1 ELSE 0 END) as termines,
        SUM(CASE WHEN resultat = 'conforme' THEN 1 ELSE 0 END) as conformes,
        SUM(CASE WHEN resultat = 'non_conforme' THEN 1 ELSE 0 END) as non_conformes
      FROM controles
    `);

    const facturesStats = await getQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
        SUM(CASE WHEN statut = 'payee' THEN 1 ELSE 0 END) as payees,
        SUM(CASE WHEN statut = 'en_retard' THEN 1 ELSE 0 END) as en_retard,
        SUM(CASE WHEN statut = 'en_attente' THEN montant_ttc ELSE 0 END) as montant_en_attente,
        SUM(CASE WHEN statut = 'payee' THEN montant_ttc ELSE 0 END) as montant_encaisse
      FROM factures
    `);

    const agentsStats = await getQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'actif' THEN 1 ELSE 0 END) as actifs,
        SUM(CASE WHEN statut = 'inactif' THEN 1 ELSE 0 END) as inactifs,
        SUM(CASE WHEN statut = 'conge' THEN 1 ELSE 0 END) as en_conge
      FROM agents
    `);

    // Calcul du taux de conformité
    const totalControlesTermines = controlesStats.conformes + controlesStats.non_conformes;
    const tauxConformite = totalControlesTermines > 0 
      ? ((controlesStats.conformes / totalControlesTermines) * 100).toFixed(1)
      : 0;

    res.json({
      entreprises: entreprisesStats,
      controles: {
        ...controlesStats,
        taux_conformite: parseFloat(tauxConformite)
      },
      factures: facturesStats,
      agents: agentsStats
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Obtenir les contrôles récents
router.get('/recent-controls', authenticateToken, async (req, res) => {
  try {
    const recentControles = await allQuery(`
      SELECT 
        c.id,
        c.type_controle,
        c.date_realisation,
        c.statut,
        c.resultat,
        e.nom as entreprise_nom,
        a.nom as agent_nom,
        a.prenom as agent_prenom
      FROM controles c
      LEFT JOIN entreprises e ON c.entreprise_id = e.id
      LEFT JOIN agents a ON c.agent_id = a.id
      WHERE c.statut IN ('termine', 'en_cours')
      ORDER BY c.updated_at DESC
      LIMIT 10
    `);

    res.json(recentControles);

  } catch (error) {
    console.error('Erreur lors de la récupération des contrôles récents:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Obtenir les alertes et notifications
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = [];

    // Contrôles en retard
    const controlesEnRetard = await allQuery(`
      SELECT COUNT(*) as count
      FROM controles
      WHERE statut = 'planifie' 
        AND date_planifiee < date('now')
    `);

    if (controlesEnRetard[0].count > 0) {
      alerts.push({
        type: 'warning',
        title: 'Contrôles en retard',
        message: `${controlesEnRetard[0].count} contrôle(s) planifié(s) en retard`,
        count: controlesEnRetard[0].count
      });
    }

    // Factures en retard
    const facturesEnRetard = await allQuery(`
      SELECT COUNT(*) as count, SUM(montant_ttc) as montant_total
      FROM factures
      WHERE statut = 'en_attente' 
        AND date_echeance IS NOT NULL 
        AND date_echeance < date('now')
    `);

    if (facturesEnRetard[0].count > 0) {
      alerts.push({
        type: 'error',
        title: 'Factures en retard',
        message: `${facturesEnRetard[0].count} facture(s) en retard (${facturesEnRetard[0].montant_total} XAF)`,
        count: facturesEnRetard[0].count,
        amount: facturesEnRetard[0].montant_total
      });
    }

    // Contrôles à venir dans les 7 prochains jours
    const controlesProchains = await allQuery(`
      SELECT COUNT(*) as count
      FROM controles
      WHERE statut = 'planifie' 
        AND date_planifiee BETWEEN date('now') AND date('now', '+7 days')
    `);

    if (controlesProchains[0].count > 0) {
      alerts.push({
        type: 'info',
        title: 'Contrôles à venir',
        message: `${controlesProchains[0].count} contrôle(s) planifié(s) dans les 7 prochains jours`,
        count: controlesProchains[0].count
      });
    }

    // Agents en congé
    const agentsEnConge = await allQuery(`
      SELECT COUNT(*) as count
      FROM agents
      WHERE statut = 'conge'
    `);

    if (agentsEnConge[0].count > 0) {
      alerts.push({
        type: 'info',
        title: 'Agents en congé',
        message: `${agentsEnConge[0].count} agent(s) actuellement en congé`,
        count: agentsEnConge[0].count
      });
    }

    res.json(alerts);

  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Obtenir les données pour les graphiques
router.get('/charts', authenticateToken, async (req, res) => {
  try {
    // Évolution des contrôles par mois (6 derniers mois)
    const controlesParMois = await allQuery(`
      SELECT 
        strftime('%Y-%m', date_planifiee) as mois,
        COUNT(*) as total,
        SUM(CASE WHEN resultat = 'conforme' THEN 1 ELSE 0 END) as conformes,
        SUM(CASE WHEN resultat = 'non_conforme' THEN 1 ELSE 0 END) as non_conformes
      FROM controles
      WHERE date_planifiee >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', date_planifiee)
      ORDER BY mois
    `);

    // Répartition des entreprises par secteur
    const entreprisesParSecteur = await allQuery(`
      SELECT secteur, COUNT(*) as count
      FROM entreprises
      GROUP BY secteur
      ORDER BY count DESC
    `);

    // Évolution du chiffre d'affaires (factures payées par mois)
    const chiffresAffaires = await allQuery(`
      SELECT 
        strftime('%Y-%m', date_paiement) as mois,
        SUM(montant_ttc) as montant_total,
        COUNT(*) as nombre_factures
      FROM factures
      WHERE statut = 'payee' 
        AND date_paiement >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', date_paiement)
      ORDER BY mois
    `);

    // Performance des agents (nombre de contrôles terminés)
    const performanceAgents = await allQuery(`
      SELECT 
        a.nom,
        a.prenom,
        COUNT(c.id) as controles_termines,
        SUM(CASE WHEN c.resultat = 'conforme' THEN 1 ELSE 0 END) as conformes,
        SUM(CASE WHEN c.resultat = 'non_conforme' THEN 1 ELSE 0 END) as non_conformes
      FROM agents a
      LEFT JOIN controles c ON a.id = c.agent_id AND c.statut = 'termine'
      WHERE a.statut = 'actif'
      GROUP BY a.id, a.nom, a.prenom
      ORDER BY controles_termines DESC
      LIMIT 10
    `);

    res.json({
      controles_par_mois: controlesParMois,
      entreprises_par_secteur: entreprisesParSecteur,
      chiffres_affaires: chiffresAffaires,
      performance_agents: performanceAgents
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données graphiques:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;