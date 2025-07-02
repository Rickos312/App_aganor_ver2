import express from 'express';
import { getQuery, allQuery, runQuery } from '../database/init.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Obtenir toutes les entreprises
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { secteur, statut, search } = req.query;
    
    let sql = `
      SELECT 
        e.*,
        COUNT(i.id) as nombre_instruments,
        (SELECT COUNT(*) FROM controles c WHERE c.entreprise_id = e.id AND c.statut IN ('planifie', 'en_cours')) as controles_en_cours
      FROM entreprises e
      LEFT JOIN instruments i ON e.id = i.entreprise_id AND i.statut = 'actif'
      WHERE 1=1
    `;
    
    const params = [];
    
    if (secteur) {
      sql += ' AND e.secteur = ?';
      params.push(secteur);
    }
    
    if (statut) {
      sql += ' AND e.statut = ?';
      params.push(statut);
    }
    
    if (search) {
      sql += ' AND (e.nom LIKE ? OR e.siret LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' GROUP BY e.id ORDER BY e.nom';
    
    const entreprises = await allQuery(sql, params);
    
    res.json(entreprises);

  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Obtenir une entreprise par ID avec ses instruments
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const entreprise = await getQuery('SELECT * FROM entreprises WHERE id = ?', [id]);
    
    if (!entreprise) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }
    
    // Récupérer les instruments de l'entreprise
    const instruments = await allQuery(
      'SELECT * FROM instruments WHERE entreprise_id = ? ORDER BY type, localisation',
      [id]
    );
    
    // Récupérer les contrôles récents
    const controles = await allQuery(`
      SELECT 
        c.*,
        a.nom as agent_nom,
        a.prenom as agent_prenom
      FROM controles c
      LEFT JOIN agents a ON c.agent_id = a.id
      WHERE c.entreprise_id = ?
      ORDER BY c.date_planifiee DESC
      LIMIT 10
    `, [id]);
    
    res.json({
      ...entreprise,
      instruments,
      controles
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'entreprise:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Créer une nouvelle entreprise
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      siret, nom, adresse, telephone, email, secteur, latitude, longitude,
      point_contact_nom, point_contact_prenom, point_contact_telephone,
      point_contact_email, instruments
    } = req.body;

    // Validation des champs obligatoires
    if (!siret || !nom || !secteur) {
      return res.status(400).json({ error: 'SIRET, nom et secteur sont obligatoires' });
    }

    // Vérifier l'unicité du SIRET
    const existingEntreprise = await getQuery('SELECT id FROM entreprises WHERE siret = ?', [siret]);
    if (existingEntreprise) {
      return res.status(400).json({ error: 'Une entreprise avec ce SIRET existe déjà' });
    }

    const sql = `
      INSERT INTO entreprises (
        siret, nom, adresse, telephone, email, secteur, statut,
        latitude, longitude, point_contact_nom, point_contact_prenom,
        point_contact_telephone, point_contact_email, dernier_controle
      ) VALUES (?, ?, ?, ?, ?, ?, 'en_attente', ?, ?, ?, ?, ?, ?, date('now'))
    `;

    const result = await runQuery(sql, [
      siret, nom, adresse, telephone, email, secteur,
      latitude, longitude, point_contact_nom, point_contact_prenom,
      point_contact_telephone, point_contact_email
    ]);

    // Ajouter les instruments si fournis
    if (instruments && instruments.length > 0) {
      for (const instrument of instruments) {
        if (instrument.type && instrument.marque && instrument.modele && instrument.numero_serie) {
          await runQuery(`
            INSERT INTO instruments (entreprise_id, type, marque, modele, numero_serie, localisation, statut)
            VALUES (?, ?, ?, ?, ?, ?, 'actif')
          `, [
            result.id, instrument.type, instrument.marque,
            instrument.modele, instrument.numero_serie, instrument.localisation
          ]);
        }
      }
    }

    // Log de l'activité
    await runQuery(
      'INSERT INTO activity_logs (agent_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'CREATE', 'ENTREPRISE', result.id, JSON.stringify({ nom, siret, secteur })]
    );

    res.status(201).json({
      message: 'Entreprise créée avec succès',
      id: result.id
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'entreprise:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Mettre à jour une entreprise
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      siret, nom, adresse, telephone, email, secteur, statut,
      latitude, longitude, point_contact_nom, point_contact_prenom,
      point_contact_telephone, point_contact_email
    } = req.body;

    // Vérifier que l'entreprise existe
    const existingEntreprise = await getQuery('SELECT * FROM entreprises WHERE id = ?', [id]);
    if (!existingEntreprise) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }

    // Vérifier l'unicité du SIRET (sauf pour l'entreprise actuelle)
    if (siret && siret !== existingEntreprise.siret) {
      const siretExists = await getQuery('SELECT id FROM entreprises WHERE siret = ? AND id != ?', [siret, id]);
      if (siretExists) {
        return res.status(400).json({ error: 'Une entreprise avec ce SIRET existe déjà' });
      }
    }

    const sql = `
      UPDATE entreprises SET
        siret = ?, nom = ?, adresse = ?, telephone = ?, email = ?, secteur = ?,
        statut = ?, latitude = ?, longitude = ?, point_contact_nom = ?,
        point_contact_prenom = ?, point_contact_telephone = ?, point_contact_email = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await runQuery(sql, [
      siret, nom, adresse, telephone, email, secteur, statut,
      latitude, longitude, point_contact_nom, point_contact_prenom,
      point_contact_telephone, point_contact_email, id
    ]);

    // Log de l'activité
    await runQuery(
      'INSERT INTO activity_logs (agent_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'UPDATE', 'ENTREPRISE', id, JSON.stringify({ nom, siret, secteur })]
    );

    res.json({ message: 'Entreprise mise à jour avec succès' });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'entreprise:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Supprimer une entreprise
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'entreprise existe
    const entreprise = await getQuery('SELECT * FROM entreprises WHERE id = ?', [id]);
    if (!entreprise) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }

    // Vérifier s'il y a des contrôles en cours
    const controlesEnCours = await getQuery(
      'SELECT COUNT(*) as count FROM controles WHERE entreprise_id = ? AND statut IN ("planifie", "en_cours")',
      [id]
    );

    if (controlesEnCours.count > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cette entreprise car elle a des contrôles en cours' 
      });
    }

    // Supprimer l'entreprise (les instruments et contrôles seront supprimés en cascade)
    await runQuery('DELETE FROM entreprises WHERE id = ?', [id]);

    // Log de l'activité
    await runQuery(
      'INSERT INTO activity_logs (agent_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'DELETE', 'ENTREPRISE', id, JSON.stringify({ nom: entreprise.nom, siret: entreprise.siret })]
    );

    res.json({ message: 'Entreprise supprimée avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'entreprise:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Obtenir les statistiques des entreprises
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await allQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'conforme' THEN 1 ELSE 0 END) as conformes,
        SUM(CASE WHEN statut = 'non_conforme' THEN 1 ELSE 0 END) as non_conformes,
        SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente
      FROM entreprises
    `);

    const secteurStats = await allQuery(`
      SELECT secteur, COUNT(*) as count
      FROM entreprises
      GROUP BY secteur
      ORDER BY count DESC
    `);

    res.json({
      ...stats[0],
      par_secteur: secteurStats
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Ajouter un instrument à une entreprise
router.post('/:id/instruments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, marque, modele, numero_serie, localisation } = req.body;

    // Vérifier que l'entreprise existe
    const entreprise = await getQuery('SELECT id FROM entreprises WHERE id = ?', [id]);
    if (!entreprise) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }

    // Validation des champs obligatoires
    if (!type || !marque || !modele || !numero_serie) {
      return res.status(400).json({ error: 'Type, marque, modèle et numéro de série sont obligatoires' });
    }

    const sql = `
      INSERT INTO instruments (entreprise_id, type, marque, modele, numero_serie, localisation, statut)
      VALUES (?, ?, ?, ?, ?, ?, 'actif')
    `;

    const result = await runQuery(sql, [id, type, marque, modele, numero_serie, localisation]);

    // Log de l'activité
    await runQuery(
      'INSERT INTO activity_logs (agent_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'CREATE', 'INSTRUMENT', result.id, JSON.stringify({ entreprise_id: id, type, marque, modele })]
    );

    res.status(201).json({
      message: 'Instrument ajouté avec succès',
      id: result.id
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'instrument:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;