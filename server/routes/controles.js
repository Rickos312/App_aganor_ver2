import express from 'express';
import { getQuery, allQuery, runQuery } from '../database/init.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Obtenir tous les contrôles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { statut, agent_id, entreprise_id, date_debut, date_fin } = req.query;
    
    let sql = `
      SELECT 
        c.*,
        e.nom as entreprise_nom,
        e.adresse as entreprise_adresse,
        a.nom as agent_nom,
        a.prenom as agent_prenom,
        a.role as agent_role
      FROM controles c
      LEFT JOIN entreprises e ON c.entreprise_id = e.id
      LEFT JOIN agents a ON c.agent_id = a.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (statut) {
      sql += ' AND c.statut = ?';
      params.push(statut);
    }
    
    if (agent_id) {
      sql += ' AND c.agent_id = ?';
      params.push(agent_id);
    }
    
    if (entreprise_id) {
      sql += ' AND c.entreprise_id = ?';
      params.push(entreprise_id);
    }
    
    if (date_debut) {
      sql += ' AND c.date_planifiee >= ?';
      params.push(date_debut);
    }
    
    if (date_fin) {
      sql += ' AND c.date_planifiee <= ?';
      params.push(date_fin);
    }
    
    sql += ' ORDER BY c.date_planifiee DESC, c.heure_debut';
    
    const controles = await allQuery(sql, params);
    
    // Pour chaque contrôle, récupérer les instruments associés
    for (const controle of controles) {
      const instruments = await allQuery(`
        SELECT i.*, ci.resultat as resultat_controle, ci.observations as observations_controle
        FROM controle_instruments ci
        JOIN instruments i ON ci.instrument_id = i.id
        WHERE ci.controle_id = ?
      `, [controle.id]);
      
      controle.instruments = instruments;
    }
    
    res.json(controles);

  } catch (error) {
    console.error('Erreur lors de la récupération des contrôles:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Obtenir un contrôle par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const controle = await getQuery(`
      SELECT 
        c.*,
        e.nom as entreprise_nom,
        e.adresse as entreprise_adresse,
        e.telephone as entreprise_telephone,
        e.email as entreprise_email,
        a.nom as agent_nom,
        a.prenom as agent_prenom,
        a.role as agent_role,
        a.telephone as agent_telephone
      FROM controles c
      LEFT JOIN entreprises e ON c.entreprise_id = e.id
      LEFT JOIN agents a ON c.agent_id = a.id
      WHERE c.id = ?
    `, [id]);
    
    if (!controle) {
      return res.status(404).json({ error: 'Contrôle non trouvé' });
    }
    
    // Récupérer les instruments associés
    const instruments = await allQuery(`
      SELECT i.*, ci.resultat as resultat_controle, ci.observations as observations_controle
      FROM controle_instruments ci
      JOIN instruments i ON ci.instrument_id = i.id
      WHERE ci.controle_id = ?
    `, [id]);
    
    controle.instruments = instruments;
    
    res.json(controle);

  } catch (error) {
    console.error('Erreur lors de la récupération du contrôle:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Créer un nouveau contrôle
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      entreprise_id, agent_id, type_controle, date_planifiee, heure_debut,
      priorite, observations, instruments_ids
    } = req.body;

    // Validation des champs obligatoires
    if (!entreprise_id || !agent_id || !type_controle || !date_planifiee) {
      return res.status(400).json({ 
        error: 'Entreprise, agent, type de contrôle et date planifiée sont obligatoires' 
      });
    }

    // Vérifier que l'entreprise existe
    const entreprise = await getQuery('SELECT id FROM entreprises WHERE id = ?', [entreprise_id]);
    if (!entreprise) {
      return res.status(400).json({ error: 'Entreprise non trouvée' });
    }

    // Vérifier que l'agent existe et est actif
    const agent = await getQuery('SELECT id FROM agents WHERE id = ? AND statut = "actif"', [agent_id]);
    if (!agent) {
      return res.status(400).json({ error: 'Agent non trouvé ou inactif' });
    }

    const sql = `
      INSERT INTO controles (
        entreprise_id, agent_id, type_controle, date_planifiee, heure_debut,
        statut, priorite, observations, progression
      ) VALUES (?, ?, ?, ?, ?, 'planifie', ?, ?, 0)
    `;

    const result = await runQuery(sql, [
      entreprise_id, agent_id, type_controle, date_planifiee, heure_debut,
      priorite || 'normale', observations
    ]);

    // Associer les instruments si fournis
    if (instruments_ids && instruments_ids.length > 0) {
      for (const instrument_id of instruments_ids) {
        await runQuery(`
          INSERT INTO controle_instruments (controle_id, instrument_id, resultat)
          VALUES (?, ?, 'en_attente')
        `, [result.id, instrument_id]);
      }
    }

    // Log de l'activité
    await runQuery(
      'INSERT INTO activity_logs (agent_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'CREATE', 'CONTROLE', result.id, JSON.stringify({ 
        entreprise_id, agent_id, type_controle, date_planifiee 
      })]
    );

    res.status(201).json({
      message: 'Contrôle planifié avec succès',
      id: result.id
    });

  } catch (error) {
    console.error('Erreur lors de la création du contrôle:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Mettre à jour un contrôle
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      entreprise_id, agent_id, type_controle, date_planifiee, date_realisation,
      heure_debut, heure_fin, statut, resultat, observations, priorite, progression
    } = req.body;

    // Vérifier que le contrôle existe
    const existingControle = await getQuery('SELECT * FROM controles WHERE id = ?', [id]);
    if (!existingControle) {
      return res.status(404).json({ error: 'Contrôle non trouvé' });
    }

    const sql = `
      UPDATE controles SET
        entreprise_id = ?, agent_id = ?, type_controle = ?, date_planifiee = ?,
        date_realisation = ?, heure_debut = ?, heure_fin = ?, statut = ?,
        resultat = ?, observations = ?, priorite = ?, progression = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await runQuery(sql, [
      entreprise_id, agent_id, type_controle, date_planifiee, date_realisation,
      heure_debut, heure_fin, statut, resultat, observations, priorite, progression, id
    ]);

    // Si le contrôle est terminé, mettre à jour la date du dernier contrôle de l'entreprise
    if (statut === 'termine' && date_realisation) {
      await runQuery(
        'UPDATE entreprises SET dernier_controle = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [date_realisation, entreprise_id]
      );
    }

    // Log de l'activité
    await runQuery(
      'INSERT INTO activity_logs (agent_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'UPDATE', 'CONTROLE', id, JSON.stringify({ statut, resultat, progression })]
    );

    res.json({ message: 'Contrôle mis à jour avec succès' });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du contrôle:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Supprimer un contrôle
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le contrôle existe
    const controle = await getQuery('SELECT * FROM controles WHERE id = ?', [id]);
    if (!controle) {
      return res.status(404).json({ error: 'Contrôle non trouvé' });
    }

    // Empêcher la suppression des contrôles en cours ou terminés
    if (controle.statut === 'en_cours' || controle.statut === 'termine') {
      return res.status(400).json({ 
        error: 'Impossible de supprimer un contrôle en cours ou terminé' 
      });
    }

    // Supprimer le contrôle (les associations avec les instruments seront supprimées en cascade)
    await runQuery('DELETE FROM controles WHERE id = ?', [id]);

    // Log de l'activité
    await runQuery(
      'INSERT INTO activity_logs (agent_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'DELETE', 'CONTROLE', id, JSON.stringify({ 
        entreprise_id: controle.entreprise_id, 
        type_controle: controle.type_controle 
      })]
    );

    res.json({ message: 'Contrôle supprimé avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression du contrôle:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Obtenir les statistiques des contrôles
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await allQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'planifie' THEN 1 ELSE 0 END) as planifies,
        SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as en_cours,
        SUM(CASE WHEN statut = 'termine' THEN 1 ELSE 0 END) as termines,
        SUM(CASE WHEN statut = 'reporte' THEN 1 ELSE 0 END) as reportes,
        SUM(CASE WHEN statut = 'annule' THEN 1 ELSE 0 END) as annules,
        SUM(CASE WHEN resultat = 'conforme' THEN 1 ELSE 0 END) as conformes,
        SUM(CASE WHEN resultat = 'non_conforme' THEN 1 ELSE 0 END) as non_conformes
      FROM controles
    `);

    const controlesMoisActuel = await getQuery(`
      SELECT COUNT(*) as count
      FROM controles
      WHERE strftime('%Y-%m', date_planifiee) = strftime('%Y-%m', 'now')
    `);

    res.json({
      ...stats[0],
      mois_actuel: controlesMoisActuel.count
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Démarrer un contrôle
router.post('/:id/start', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const controle = await getQuery('SELECT * FROM controles WHERE id = ?', [id]);
    if (!controle) {
      return res.status(404).json({ error: 'Contrôle non trouvé' });
    }

    if (controle.statut !== 'planifie') {
      return res.status(400).json({ error: 'Ce contrôle ne peut pas être démarré' });
    }

    await runQuery(`
      UPDATE controles SET 
        statut = 'en_cours', 
        date_realisation = date('now'),
        heure_debut = time('now'),
        progression = 10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);

    // Log de l'activité
    await runQuery(
      'INSERT INTO activity_logs (agent_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'START', 'CONTROLE', id, JSON.stringify({ action: 'start_controle' })]
    );

    res.json({ message: 'Contrôle démarré avec succès' });

  } catch (error) {
    console.error('Erreur lors du démarrage du contrôle:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Terminer un contrôle
router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { resultat, observations } = req.body;

    const controle = await getQuery('SELECT * FROM controles WHERE id = ?', [id]);
    if (!controle) {
      return res.status(404).json({ error: 'Contrôle non trouvé' });
    }

    if (controle.statut !== 'en_cours') {
      return res.status(400).json({ error: 'Ce contrôle ne peut pas être terminé' });
    }

    if (!resultat || !['conforme', 'non_conforme'].includes(resultat)) {
      return res.status(400).json({ error: 'Résultat requis (conforme ou non_conforme)' });
    }

    await runQuery(`
      UPDATE controles SET 
        statut = 'termine', 
        resultat = ?,
        observations = ?,
        heure_fin = time('now'),
        progression = 100,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [resultat, observations, id]);

    // Mettre à jour le statut de l'entreprise
    await runQuery(
      'UPDATE entreprises SET statut = ?, dernier_controle = date("now"), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [resultat, controle.entreprise_id]
    );

    // Log de l'activité
    await runQuery(
      'INSERT INTO activity_logs (agent_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'COMPLETE', 'CONTROLE', id, JSON.stringify({ resultat, observations })]
    );

    res.json({ message: 'Contrôle terminé avec succès' });

  } catch (error) {
    console.error('Erreur lors de la finalisation du contrôle:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;