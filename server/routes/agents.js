import express from 'express';
import bcrypt from 'bcryptjs';
import { supabase, getQuery, allQuery, runQuery } from '../lib/supabase.js';
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
    
    // Construire les filtres
    const filters = {};
    
    if (role) {
      filters.role = role;
    }
    
    if (zone) {
      filters.zone = zone;
    }
    
    if (statut) {
      filters.statut = statut;
    }
    
    // Récupérer les agents avec les contrôles associés
    let query = supabase
      .from('agents')
      .select(`
        *,
        controles_en_cours:controles!agent_id(count),
        dernier_controle:controles!agent_id(date_realisation)
      `)
      .order('nom', { ascending: true })
      .order('prenom', { ascending: true });

    // Appliquer les filtres
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data: agents, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Parser les champs JSON
    const agentsWithParsedData = (agents || []).map(agent => ({
      ...agent,
      diplomes: agent.diplomes || [],
      certifications: agent.certifications || [],
      controles_en_cours: agent.controles_en_cours?.[0]?.count || 0,
      dernier_controle: agent.dernier_controle?.[0]?.date_realisation || null
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
    
    const agent = await getQuery('agents', { id });
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent non trouvé' });
    }
    
    // Les champs JSON sont déjà parsés par Supabase
    agent.diplomes = agent.diplomes || [];
    agent.certifications = agent.certifications || [];
    
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
    const existingAgent = await getQuery('agents', { email });
    if (existingAgent) {
      return res.status(400).json({ error: 'Un agent avec cet email existe déjà' });
    }

    // Vérifier l'unicité du matricule si fourni
    if (numero_matricule) {
      const existingMatricule = await getQuery('agents', { numero_matricule });
      if (existingMatricule) {
        return res.status(400).json({ error: 'Un agent avec ce matricule existe déjà' });
      }
    }

    // Hasher le mot de passe (par défaut: aganor2025)
    const defaultPassword = password || 'aganor2025';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const result = await runQuery('agents', {
      numero_matricule,
      nom,
      prenom,
      email,
      telephone,
      role,
      zone,
      statut: statut || 'actif',
      date_embauche,
      adresse,
      date_naissance,
      lieu_naissance,
      nationalite,
      situation_matrimoniale,
      nombre_enfants: nombre_enfants || 0,
      niveau_etude,
      diplomes: diplomes || [],
      certifications: certifications || [],
      salaire,
      type_contrat,
      date_fin_contrat,
      superviseur,
      latitude,
      longitude,
      password_hash: passwordHash
    });

    // Log de l'activité dans Supabase
    await runQuery('activity_logs', {
      agent_id: req.user.id,
      action: 'CREATE',
      entity_type: 'AGENT',
      entity_id: result.id,
      details: JSON.stringify({ nom, prenom, email, role })
    });

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
    const existingAgent = await getQuery('agents', { id });
    if (!existingAgent) {
      return res.status(404).json({ error: 'Agent non trouvé' });
    }

    // Vérifier l'unicité de l'email (sauf pour l'agent actuel)
    if (email && email !== existingAgent.email) {
      const { data: emailExists } = await supabase
        .from('agents')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .single();
        
      if (emailExists) {
        return res.status(400).json({ error: 'Un agent avec cet email existe déjà' });
      }
    }

    // Vérifier l'unicité du matricule (sauf pour l'agent actuel)
    if (numero_matricule && numero_matricule !== existingAgent.numero_matricule) {
      const { data: matriculeExists } = await supabase
        .from('agents')
        .select('id')
        .eq('numero_matricule', numero_matricule)
        .neq('id', id)
        .single();
        
      if (matriculeExists) {
        return res.status(400).json({ error: 'Un agent avec ce matricule existe déjà' });
      }
    }

    await runQuery('agents', {
      id,
      numero_matricule,
      nom,
      prenom,
      email,
      telephone,
      role,
      zone,
      statut,
      date_embauche,
      adresse,
      date_naissance,
      lieu_naissance,
      nationalite,
      situation_matrimoniale,
      nombre_enfants,
      niveau_etude,
      diplomes: diplomes || [],
      certifications: certifications || [],
      salaire,
      type_contrat,
      date_fin_contrat,
      superviseur,
      latitude,
      longitude
    }, 'update');

    // Log de l'activité dans Supabase
    await runQuery('activity_logs', {
      agent_id: req.user.id,
      action: 'UPDATE',
      entity_type: 'AGENT',
      entity_id: id,
      details: JSON.stringify({ nom, prenom, email, role })
    });

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
    const agent = await getQuery('agents', { id });
    if (!agent) {
      return res.status(404).json({ error: 'Agent non trouvé' });
    }

    // Empêcher la suppression de son propre compte
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    // Vérifier s'il y a des contrôles en cours
    const { data: controlesEnCours } = await supabase
      .from('controles')
      .select('id', { count: 'exact' })
      .eq('agent_id', id)
      .in('statut', ['planifie', 'en_cours']);

    if (controlesEnCours && controlesEnCours.length > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cet agent car il a des contrôles en cours' 
      });
    }

    // Supprimer l'agent
    await runQuery('agents', { id }, 'delete');

    // Log de l'activité dans Supabase
    await runQuery('activity_logs', {
      agent_id: req.user.id,
      action: 'DELETE',
      entity_type: 'AGENT',
      entity_id: id,
      details: JSON.stringify({ nom: agent.nom, prenom: agent.prenom })
    });

    res.json({ message: 'Agent supprimé avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'agent:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Obtenir les statistiques des agents
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    // Récupérer tous les agents pour calculer les statistiques
    const agents = await allQuery('agents');
    
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

    // Récupérer les contrôles en cours
    const { data: controles } = await supabase
      .from('controles')
      .select('id', { count: 'exact' })
      .in('statut', ['planifie', 'en_cours']);

    res.json({
      ...stats,
      controles_en_cours: controles?.length || 0
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;