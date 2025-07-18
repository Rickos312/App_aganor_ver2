import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, getQuery, runQuery } from '../lib/supabase.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'aganor_secret_key_2025';

// Middleware d'authentification
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const agent = await getQuery('agents', { id: decoded.id, statut: 'actif' });
    
    if (!agent) {
      return res.status(403).json({ error: 'Agent non trouvé ou inactif' });
    }

    req.user = agent;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token invalide' });
  }
};

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Rechercher l'agent
    const agent = await getQuery('agents', { email });
    
    if (!agent) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    if (agent.statut !== 'actif') {
      return res.status(401).json({ error: 'Compte inactif' });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, agent.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { 
        id: agent.id, 
        email: agent.email, 
        role: agent.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Enregistrer la session dans Supabase
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    await runQuery('sessions', {
      agent_id: agent.id,
      token: token,
      expires_at: expiresAt.toISOString()
    });

    // Log de l'activité dans Supabase
    await runQuery('activity_logs', {
      agent_id: agent.id,
      action: 'LOGIN',
      entity_type: 'AUTH',
      details: JSON.stringify({ success: true }),
      ip_address: req.ip
    });

    // Retourner les informations de l'agent (sans le mot de passe)
    const { password_hash, ...agentData } = agent;
    
    res.json({
      message: 'Connexion réussie',
      token,
      agent: agentData
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Déconnexion
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Supprimer la session de Supabase
    await supabase.from('sessions').delete().eq('token', token);

    // Log de l'activité dans Supabase
    await runQuery('activity_logs', {
      agent_id: req.user.id,
      action: 'LOGOUT',
      entity_type: 'AUTH',
      details: JSON.stringify({ success: true }),
      ip_address: req.ip
    });

    res.json({ message: 'Déconnexion réussie' });

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Vérification du token
router.get('/verify', authenticateToken, (req, res) => {
  const { password_hash, ...agentData } = req.user;
  res.json({ 
    valid: true, 
    agent: agentData 
  });
});

// Changement de mot de passe
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, req.user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Hasher le nouveau mot de passe
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe dans Supabase
    await runQuery('agents', {
      id: req.user.id,
      password_hash: newPasswordHash
    }, 'update');

    // Log de l'activité dans Supabase
    await runQuery('activity_logs', {
      agent_id: req.user.id,
      action: 'PASSWORD_CHANGE',
      entity_type: 'AUTH',
      details: JSON.stringify({ success: true }),
      ip_address: req.ip
    });

    res.json({ message: 'Mot de passe modifié avec succès' });

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;