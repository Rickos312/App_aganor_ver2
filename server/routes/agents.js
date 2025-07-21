import express from 'express';
import bcrypt from 'bcryptjs';
import { getQuery, allQuery, runQuery } from '../database/init.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Middleware d'autorisation pour les admins
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superviseur') {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }
  next();
};

// Obtenir tous les agents
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role, zone, statut } = req.query;

    let sql = `SELECT * FROM agents WHERE 1=1`;
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (zone) {
      sql += ' AND zone = ?';
      params.push(zone);
    }

    if (statut) {
      sql += ' AND statut = ?';
      params.push(statut);
    }

    sql += ' ORDER BY nom ASC, prenom ASC';

    const agents = await allQuery(sql, params);

    // Ajouter les contrôles en cours et dernier contrôle pour chaque agent
    const agentsWithData = await Promise.all(agents.map(async (agent) => {
      // Compter les contrôles en cours
      const controlesEnCours = await getQuery(
        `SELECT COUNT(*) as count FROM controles WHERE agent_id = ? AND statut IN ('planifie', 'en_cours')`,
        [agent.id]
      );
      
      // Récupérer le dernier contrôle
      const dernierControle = await getQuery(
        `SELECT date_realisation FROM controles WHERE agent_id = ? AND date_realisation IS NOT NULL ORDER BY date_realisation DESC LIMIT 1`,
        [agent.id]
      );

      return {
        ...agent,
        diplomes: agent.diplomes ? JSON.parse(agent.diplomes) : [],
        certifications: agent.certifications ? JSON.parse(agent.certifications) : [],
        controlesEnCours: controlesEnCours ? controlesEnCours.count : 0,
        dernierControle: dernierControle ? dernierControle.date_realisation : null,
      };
    }));
    
    res.json(agentsWithData);

  } catch (error) {
    console.error('Erreur lors de la récupération des agents:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Obtenir un agent par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await getQuery('SELECT * FROM agents WHERE id = ?', [id]);

    if (!agent) {
      return res.status(404).json({ error: 'Agent non trouvé' });
    }

    // Parser les champs JSON
    agent.diplomes = agent.diplomes ? JSON.parse(agent.diplomes) : [];
    agent.certifications = agent.certifications ? JSON.parse(agent.certifications) : [];
    
    res.json(agent);

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'agent:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Créer un nouvel agent
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      numero_matricule, nom, prenom, email, telephone, role, zone, statut,
      date_embauche, adresse, date_naissance, lieu_naissance, nationalite,
      situation_matrimoniale, nombre_enfants, niveau_etude, diplomes,
      certifications, salaire, type_contrat, date_fin_contrat, superviseur,
      latitude, longitude, password
    } = req.body;

    // Validation des champs obligatoires
    if (!nom || !prenom || !email || !role) {
      return res.status(400).json({ error: 'Nom, prénom, email et rôle sont obligatoires' });
    }

    // Vérifier l'unicité de l'email
    const existingAgent = await getQuery('SELECT id FROM agents WHERE email = ?', [email]);
    if (existingAgent) {
      return res.status(400).json({ error: 'Un agent avec cet email existe déjà' });
    }

    // Vérifier l'unicité du matricule si fourni
    if (numero_matricule) {
      const existingMatricule = await getQuery('SELECT id FROM agents WHERE numero_matricule = ?', [numero_matricule]);
      if (existingMatricule) {
        return res.status(400).json({ error: 'Un agent avec ce matricule existe déjà' });
      }
    }

    // Hasher le mot de passe (par défaut: aganor2025)
    const defaultPassword = password || 'aganor2025';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const sql = `
      INSERT INTO agents (
        numero_matricule, nom, prenom, email, telephone, role, zone, statut,
        date_embauche, adresse, date_naissance, lieu_naissance, nationalite,
        situation_matrimoniale, nombre_enfants, niveau_etude, diplomes,
        certifications, salaire, type_contrat, date_fin_contrat, superviseur,
        latitude, longitude, password_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await runQuery(sql, [
      numero_matricule, nom, prenom, email, telephone, role, zone, statut || 'actif',
      date_embauche, adresse, date_naissance, lieu_naissance, nationalite,
      situation_matrimoniale, nombre_enfants || 0, niveau_etude,
      JSON.stringify(diplomes || []), JSON.stringify(certifications || []),
      salaire, type_contrat, date_fin_contrat, superviseur,
      latitude, longitude, passwordHash
    ]);

    // Log de l'activité
    await runQuery(
      'INSERT INTO activity_logs (agent_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'CREATE', 'AGENT', result.id, JSON.stringify({ nom, prenom, email, role })]
    );

    res.status(201).json({
      message: 'Agent créé avec succès',
      id: result.id
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'agent:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Mettre à jour un agent
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numero_matricule, nom, prenom, email, telephone, role, zone, statut,
      date_embauche, adresse, date_naissance, lieu_naissance, nationalite,
      situation_matrimoniale, nombre_enfants, niveau_etude, diplomes,
      certifications, salaire, type_contrat, date_fin_contrat, superviseur,
      latitude, longitude
    } = req.body;

    // Vérifier que l'agent existe
    const existingAgent = await getQuery('SELECT * FROM agents WHERE id = ?', [id]);
    if (!existingAgent) {
      return res.status(404).json({ error: 'Agent non trouvé' });
    }

    // Vérifier l'unicité de l'email (sauf pour l'agent actuel)
    if (email && email !== existingAgent.email) {
      const emailExists = await getQuery('SELECT id FROM agents WHERE email = ? AND id != ?', [email, id]);
      if (emailExists) {
        return res.status(400).json({ error: 'Un agent avec cet email existe déjà' });
      }
    }

    // Vérifier l'unicité du matricule (sauf pour l'agent actuel)
    if (numero_matricule && numero_matricule !== existingAgent.numero_matricule) {
      const matriculeExists = await getQuery('SELECT id FROM agents WHERE numero_matricule = ? AND id != ?', [numero_matricule, id]);
      if (matriculeExists) {
        return res.status(400).json({ error: 'Un agent avec ce matricule existe déjà' });
      }
    }

    const sql = `
      UPDATE agents SET
        numero_matricule = ?, nom = ?, prenom = ?, email = ?, telephone = ?, role = ?, zone = ?, statut = ?,
        date_embauche = ?, adresse = ?, date_naissance = ?, lieu_naissance = ?, nationalite = ?,
        situation_matrimoniale = ?, nombre_enfants = ?, niveau_etude = ?, diplomes = ?,
        certifications = ?, salaire = ?, type_contrat = ?, date_fin_contrat = ?, superviseur = ?,
        latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await runQuery(sql, [
      numero_matricule, nom, prenom, email, telephone, role, zone, statut,
      date_embauche, adresse, date_naissance, lieu_naissance, nationalite,
      situation_matrimoniale, nombre_enfants, niveau_etude,
      JSON.stringify(diplomes || []), JSON.stringify(certifications || []),
      salaire, type_contrat, date_fin_contrat, superviseur,
      latitude, longitude, id
    ]);

    // Log de l'activité
    await runQuery(
      'INSERT INTO activity_logs (agent_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'UPDATE', 'AGENT', id, JSON.stringify({ nom, prenom, email, role })]
    );

    res.json({ message: 'Agent mis à jour avec succès' });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'agent:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Supprimer un agent
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'agent existe
    const agent = await getQuery('SELECT * FROM agents WHERE id = ?', [id]);
    if (!agent) {
      return res.status(404).json({ error: 'Agent non trouvé' });
    }

    // Empêcher la suppression de son propre compte
    if (id === req.user.id.toString()) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    // Vérifier s'il y a des contrôles planifiés ou en cours pour cet agent
    const controlesEnCours = await getQuery(
      'SELECT COUNT(*) as count FROM controles WHERE agent_id = ? AND statut IN ("planifie", "en_cours")',
      [id]
    );

    if (controlesEnCours && controlesEnCours.count > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cet agent car il a des contrôles en cours' 
      });
    }

    // Supprimer l'agent
    await runQuery('DELETE FROM agents WHERE id = ?', [id]);

    // Log de l'activité
    await runQuery(
      'INSERT INTO activity_logs (agent_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'DELETE', 'AGENT', id, JSON.stringify({ nom: agent.nom, prenom: agent.prenom })]
    );

    res.json({ message: 'Agent supprimé avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'agent:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Obtenir les statistiques des agents
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const agents = await allQuery('SELECT * FROM agents');
    
    const stats = {
      total: agents.length,
      actifs: agents.filter(a => a.statut === 'actif').length,
      inactifs: agents.filter(a => a.statut === 'inactif').length,
      en_conge: agents.filter(a => a.statut === 'conge').length,
      inspecteurs: agents.filter(a => a.role === 'inspecteur').length,
      superviseurs: agents.filter(a => a.role === 'superviseur').length,
      admins: agents.filter(a => a.role === 'admin').length,
      techniciens_qualite: agents.filter(a => a.role === 'technicien_qualite').length,
      techniciens_metrologie: agents.filter(a => a.role === 'technicien_metrologie').length
    };

    // Récupérer le nombre de contrôles en cours
    const controlesEnCours = await getQuery('SELECT COUNT(*) as count FROM controles WHERE statut IN ("planifie", "en_cours")');

    res.json({
      ...stats,
      controles_en_cours: controlesEnCours ? controlesEnCours.count : 0
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;