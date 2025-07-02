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
    
    let sql = `
      SELECT 
        id, numero_matricule, nom, prenom, email, telephone, role, zone, statut,
        date_embauche, adresse, date_naissance, lieu_naissance, nationalite,
        situation_matrimoniale, nombre_enfants, niveau_etude, diplomes,
        certifications, salaire, type_contrat, date_fin_contrat, superviseur,
        latitude, longitude, created_at, updated_at,
        (SELECT COUNT(*) FROM controles WHERE agent_id = agents.id AND statut IN ('planifie', 'en_cours')) as controles_en_cours,
        (SELECT MAX(date_realisation) FROM controles WHERE agent_id = agents.id AND statut = 'termine') as dernier_controle
      FROM agents 
      WHERE 1=1
    `;
    
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
    
    sql += ' ORDER BY nom, prenom';
    
    const agents = await allQuery(sql, params);
    
    // Parser les champs JSON
    const agentsWithParsedData = agents.map(agent => ({
      ...agent,
      diplomes: agent.diplomes ? JSON.parse(agent.diplomes) : [],
      certifications: agent.certifications ? JSON.parse(agent.certifications) : [],
      controles_en_cours: agent.controles_en_cours || 0,
      dernier_controle: agent.dernier_controle || null
    }));
    
    res.json(agentsWithParsedData);

  } catch (error) {
    console.error('Erreur lors de la récupération des agents:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Obtenir un agent par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const agent = await getQuery(`
      SELECT 
        id, numero_matricule, nom, prenom, email, telephone, role, zone, statut,
        date_embauche, adresse, date_naissance, lieu_naissance, nationalite,
        situation_matrimoniale, nombre_enfants, niveau_etude, diplomes,
        certifications, salaire, type_contrat, date_fin_contrat, superviseur,
        latitude, longitude, created_at, updated_at
      FROM agents 
      WHERE id = ?
    `, [id]);
    
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await runQuery(sql, [
      numero_matricule, nom, prenom, email, telephone, role, zone, statut || 'actif',
      date_embauche, adresse, date_naissance, lieu_naissance, nationalite,
      situation_matrimoniale, nombre_enfants || 0, niveau_etude,
      diplomes ? JSON.stringify(diplomes) : null,
      certifications ? JSON.stringify(certifications) : null,
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
        numero_matricule = ?, nom = ?, prenom = ?, email = ?, telephone = ?,
        role = ?, zone = ?, statut = ?, date_embauche = ?, adresse = ?,
        date_naissance = ?, lieu_naissance = ?, nationalite = ?,
        situation_matrimoniale = ?, nombre_enfants = ?, niveau_etude = ?,
        diplomes = ?, certifications = ?, salaire = ?, type_contrat = ?,
        date_fin_contrat = ?, superviseur = ?, latitude = ?, longitude = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await runQuery(sql, [
      numero_matricule, nom, prenom, email, telephone, role, zone, statut,
      date_embauche, adresse, date_naissance, lieu_naissance, nationalite,
      situation_matrimoniale, nombre_enfants, niveau_etude,
      diplomes ? JSON.stringify(diplomes) : null,
      certifications ? JSON.stringify(certifications) : null,
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
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    // Vérifier s'il y a des contrôles en cours
    const controlesEnCours = await getQuery(
      'SELECT COUNT(*) as count FROM controles WHERE agent_id = ? AND statut IN ("planifie", "en_cours")',
      [id]
    );

    if (controlesEnCours.count > 0) {
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
    const stats = await allQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'actif' THEN 1 ELSE 0 END) as actifs,
        SUM(CASE WHEN statut = 'inactif' THEN 1 ELSE 0 END) as inactifs,
        SUM(CASE WHEN statut = 'conge' THEN 1 ELSE 0 END) as en_conge,
        SUM(CASE WHEN role = 'inspecteur' THEN 1 ELSE 0 END) as inspecteurs,
        SUM(CASE WHEN role = 'superviseur' THEN 1 ELSE 0 END) as superviseurs,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'technicien_qualite' THEN 1 ELSE 0 END) as techniciens_qualite,
        SUM(CASE WHEN role = 'technicien_metrologie' THEN 1 ELSE 0 END) as techniciens_metrologie
      FROM agents
    `);

    const controlesStats = await getQuery(`
      SELECT COUNT(*) as controles_en_cours
      FROM controles 
      WHERE statut IN ('planifie', 'en_cours')
    `);

    res.json({
      ...stats[0],
      controles_en_cours: controlesStats.controles_en_cours
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;