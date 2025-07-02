import express from 'express';
import { getQuery, allQuery, runQuery } from '../database/init.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Obtenir toutes les factures
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { statut, entreprise_id, date_debut, date_fin } = req.query;
    
    let sql = `
      SELECT 
        f.*,
        e.nom as entreprise_nom,
        e.adresse as entreprise_adresse,
        c.type_controle
      FROM factures f
      LEFT JOIN entreprises e ON f.entreprise_id = e.id
      LEFT JOIN controles c ON f.controle_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (statut) {
      sql += ' AND f.statut = ?';
      params.push(statut);
    }
    
    if (entreprise_id) {
      sql += ' AND f.entreprise_id = ?';
      params.push(entreprise_id);
    }
    
    if (date_debut) {
      sql += ' AND f.date_emission >= ?';
      params.push(date_debut);
    }
    
    if (date_fin) {
      sql += ' AND f.date_emission <= ?';
      params.push(date_fin);
    }
    
    sql += ' ORDER BY f.date_emission DESC';
    
    const factures = await allQuery(sql, params);
    
    res.json(factures);

  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Obtenir une facture par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const facture = await getQuery(`
      SELECT 
        f.*,
        e.nom as entreprise_nom,
        e.adresse as entreprise_adresse,
        e.telephone as entreprise_telephone,
        e.email as entreprise_email,
        e.point_contact_nom,
        e.point_contact_prenom,
        c.type_controle,
        c.date_realisation
      FROM factures f
      LEFT JOIN entreprises e ON f.entreprise_id = e.id
      LEFT JOIN controles c ON f.controle_id = c.id
      WHERE f.id = ?
    `, [id]);
    
    if (!facture) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }
    
    res.json(facture);

  } catch (error) {
    console.error('Erreur lors de la récupération de la facture:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Créer une nouvelle facture
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      entreprise_id, controle_id, montant_ht, tva, date_echeance, description
    } = req.body;

    // Validation des champs obligatoires
    if (!entreprise_id || !montant_ht) {
      return res.status(400).json({ error: 'Entreprise et montant HT sont obligatoires' });
    }

    // Vérifier que l'entreprise existe
    const entreprise = await getQuery('SELECT id FROM entreprises WHERE id = ?', [entreprise_id]);
    if (!entreprise) {
      return res.status(400).json({ error: 'Entreprise non trouvée' });
    }

    // Générer le numéro de facture
    const year = new Date().getFullYear();
    const lastFacture = await getQuery(
      'SELECT numero_facture FROM factures WHERE numero_facture LIKE ? ORDER BY id DESC LIMIT 1',
      [`F-${year}-%`]
    );
    
    let nextNumber = 1;
    if (lastFacture) {
      const lastNumber = parseInt(lastFacture.numero_facture.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    
    const numeroFacture = `F-${year}-${nextNumber.toString().padStart(3, '0')}`;

    // Calculer le montant TTC
    const tauxTva = tva || 18.0;
    const montantTtc = montant_ht * (1 + tauxTva / 100);

    const sql = `
      INSERT INTO factures (
        numero_facture, entreprise_id, controle_id, montant_ht, tva, montant_ttc,
        date_emission, date_echeance, statut, description
      ) VALUES (?, ?, ?, ?, ?, ?, date('now'), ?, 'en_attente', ?)
    `;

    const result = await runQuery(sql, [
      numeroFacture, entreprise_id, controle_id, montant_ht, tauxTva, montantTtc,
      date_echeance, description
    ]);

    // Log de l'activité
    await runQuery(
      'INSERT INTO activity_logs (agent_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'CREATE', 'FACTURE', result.id, JSON.stringify({ 
        numero_facture: numeroFacture, entreprise_id, montant_ttc 
      })]
    );

    res.status(201).json({
      message: 'Facture créée avec succès',
      id: result.id,
      numero_facture: numeroFacture
    });

  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Mettre à jour une facture
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      entreprise_id, controle_id, montant_ht, tva, date_echeance, 
      statut, description
    } = req.body;

    // Vérifier que la facture existe
    const existingFacture = await getQuery('SELECT * FROM factures WHERE id = ?', [id]);
    if (!existingFacture) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    // Empêcher la modification des factures payées
    if (existingFacture.statut === 'payee') {
      return res.status(400).json({ error: 'Impossible de modifier une facture payée' });
    }

    // Calculer le montant TTC si le montant HT ou la TVA ont changé
    const tauxTva = tva !== undefined ? tva : existingFacture.tva;
    const montantHt = montant_ht !== undefined ? montant_ht : existingFacture.montant_ht;
    const montantTtc = montantHt * (1 + tauxTva / 100);

    const sql = `
      UPDATE factures SET
        entreprise_id = ?, controle_id = ?, montant_ht = ?, tva = ?, montant_ttc = ?,
        date_echeance = ?, statut = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await runQuery(sql, [
      entreprise_id, controle_id, montantHt, tauxTva, montantTtc,
      date_echeance, statut, description, id
    ]);

    // Log de l'activité
    await runQuery(
      'INSERT INTO activity_logs (agent_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'UPDATE', 'FACTURE', id, JSON.stringify({ statut, montant_ttc: montantTtc })]
    );

    res.json({ message: 'Facture mise à jour avec succès' });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Marquer une facture comme payée
router.post('/:id/pay', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { mode_paiement, numero_transaction } = req.body;

    const facture = await getQuery('SELECT * FROM factures WHERE id = ?', [id]);
    if (!facture) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    if (facture.statut === 'payee') {
      return res.status(400).json({ error: 'Cette facture est déjà payée' });
    }

    if (!mode_paiement || !['carte_bancaire', 'airtel_money', 'mobile_money', 'virement', 'especes'].includes(mode_paiement)) {
      return res.status(400).json({ error: 'Mode de paiement invalide' });
    }

    await runQuery(`
      UPDATE factures SET 
        statut = 'payee',
        date_paiement = date('now'),
        mode_paiement = ?,
        numero_transaction = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [mode_paiement, numero_transaction, id]);

    // Log de l'activité
    await runQuery(
      'INSERT INTO activity_logs (agent_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'PAY', 'FACTURE', id, JSON.stringify({ 
        mode_paiement, numero_transaction, montant: facture.montant_ttc 
      })]
    );

    res.json({ message: 'Paiement enregistré avec succès' });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du paiement:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Supprimer une facture
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const facture = await getQuery('SELECT * FROM factures WHERE id = ?', [id]);
    if (!facture) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    // Empêcher la suppression des factures payées
    if (facture.statut === 'payee') {
      return res.status(400).json({ error: 'Impossible de supprimer une facture payée' });
    }

    await runQuery('DELETE FROM factures WHERE id = ?', [id]);

    // Log de l'activité
    await runQuery(
      'INSERT INTO activity_logs (agent_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'DELETE', 'FACTURE', id, JSON.stringify({ 
        numero_facture: facture.numero_facture, montant: facture.montant_ttc 
      })]
    );

    res.json({ message: 'Facture supprimée avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression de la facture:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Obtenir les statistiques des factures
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await allQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
        SUM(CASE WHEN statut = 'payee' THEN 1 ELSE 0 END) as payees,
        SUM(CASE WHEN statut = 'en_retard' THEN 1 ELSE 0 END) as en_retard,
        SUM(CASE WHEN statut = 'annulee' THEN 1 ELSE 0 END) as annulees,
        SUM(CASE WHEN statut = 'en_attente' THEN montant_ttc ELSE 0 END) as montant_en_attente,
        SUM(CASE WHEN statut = 'payee' THEN montant_ttc ELSE 0 END) as montant_encaisse,
        SUM(CASE WHEN statut = 'en_retard' THEN montant_ttc ELSE 0 END) as montant_en_retard
      FROM factures
    `);

    const facturesMoisActuel = await allQuery(`
      SELECT 
        COUNT(*) as count,
        SUM(montant_ttc) as montant_total
      FROM factures
      WHERE strftime('%Y-%m', date_emission) = strftime('%Y-%m', 'now')
    `);

    // Mettre à jour les factures en retard
    await runQuery(`
      UPDATE factures 
      SET statut = 'en_retard' 
      WHERE statut = 'en_attente' 
        AND date_echeance IS NOT NULL 
        AND date_echeance < date('now')
    `);

    res.json({
      ...stats[0],
      mois_actuel: {
        count: facturesMoisActuel[0].count || 0,
        montant_total: facturesMoisActuel[0].montant_total || 0
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Simulation des APIs de paiement
router.post('/payment/simulate/:provider', authenticateToken, async (req, res) => {
  try {
    const { provider } = req.params;
    const { montant, numero_telephone } = req.body;

    // Simulation de délai d'API
    await new Promise(resolve => setTimeout(resolve, 2000));

    let success = false;
    let message = '';
    let transactionId = '';

    switch (provider) {
      case 'airtel_money':
        success = Math.random() > 0.2; // 80% de succès
        transactionId = `AM${Date.now()}`;
        message = success ? 'Paiement Airtel Money effectué avec succès' : 'Échec du paiement Airtel Money';
        break;
      
      case 'mobile_money':
        success = Math.random() > 0.15; // 85% de succès
        transactionId = `MM${Date.now()}`;
        message = success ? 'Paiement Mobile Money effectué avec succès' : 'Échec du paiement Mobile Money';
        break;
      
      case 'carte_bancaire':
        success = Math.random() > 0.1; // 90% de succès
        transactionId = `CB${Date.now()}`;
        message = success ? 'Paiement par carte bancaire effectué avec succès' : 'Échec du paiement par carte';
        break;
      
      default:
        return res.status(400).json({ error: 'Fournisseur de paiement non supporté' });
    }

    res.json({
      success,
      transactionId: success ? transactionId : null,
      message,
      montant,
      numero_telephone: provider !== 'carte_bancaire' ? numero_telephone : undefined
    });

  } catch (error) {
    console.error('Erreur lors de la simulation de paiement:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;