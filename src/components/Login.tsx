import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    role: 'inspecteur' as 'inspecteur' | 'superviseur' | 'admin' | 'technicien_qualite' | 'technicien_metrologie',
    zone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Effacer l'erreur quand l'utilisateur tape
    if (error) setError('');
  };

  const handleRegisterInputChange = (field: keyof typeof registerData, value: string) => {
    setRegisterData(prev => ({
      ...prev,
      [field]: value
    }));
    // Effacer l'erreur quand l'utilisateur tape
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      // Stocker le token JWT dans le localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      // Passer les données utilisateur au callback onLogin
      const userData = {
        id: data.agent.id,
        email: data.agent.email,
        nom: data.agent.nom || 'Utilisateur',
        prenom: data.agent.prenom || '',
        role: data.agent.role || 'Inspecteur'
      };
      
      onLogin(userData);
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      // Afficher le message d'erreur du backend ou un message par défaut
      setError(error.message || 'Erreur de connexion. Veuillez vérifier vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!registerData.nom || !registerData.prenom || !registerData.email || !registerData.password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation du mot de passe
    if (registerData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Vérification de la confirmation du mot de passe
    if (registerData.password !== registerData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setError('Format d\'email invalide');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: registerData.nom,
          prenom: registerData.prenom,
          email: registerData.email,
          password: registerData.password,
          telephone: registerData.telephone,
          role: registerData.role,
          zone: registerData.zone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du compte');
      }

      // Stocker le token JWT dans le localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      // Passer les données utilisateur au callback onLogin
      const userData = {
        id: data.agent.id,
        email: data.agent.email,
        nom: data.agent.nom,
        prenom: data.agent.prenom,
        role: data.agent.role
      };
      
      onLogin(userData);
    } catch (error: any) {
      console.error('Erreur de création de compte:', error);
      setError(error.message || 'Erreur lors de la création du compte. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRegisterPasswordVisibility = () => {
    setShowRegisterPassword(!showRegisterPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const switchMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setFormData({ email: '', password: '' });
    setRegisterData({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      confirmPassword: '',
      telephone: '',
      role: 'inspecteur',
      zone: ''
    });
  };

  const roles = [
    { value: 'inspecteur', label: 'Inspecteur' },
    { value: 'superviseur', label: 'Superviseur' },
    { value: 'admin', label: 'Administrateur' },
    { value: 'technicien_qualite', label: 'Technicien Qualité' },
    { value: 'technicien_metrologie', label: 'Technicien Métrologie Légale' }
  ];

  const zones = [
    'Libreville Nord',
    'Libreville Sud', 
    'Libreville Centre',
    'Port-Gentil',
    'Franceville',
    'Oyem',
    'Lambaréné',
    'Mouila',
    'Tchibanga',
    'Toutes zones'
  ];

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="background-pattern"></div>
        <div className="background-overlay"></div>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          {/* Header avec logo et titre */}
          <div className="login-header">
            <div className="logo-container">
              <img src="/aganor-logo.png" alt="AGANOR" className="aganor-logo" />
            </div>
            <h1 className="login-title">
              {isRegisterMode ? 'Créer un compte' : 'CRM Métrologie'}
            </h1>
            <p className="login-subtitle">Votre passerelle vers la Qualité</p>
          </div>

          {/* Formulaire de connexion ou d'inscription */}
          <form onSubmit={isRegisterMode ? handleRegisterSubmit : handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {isRegisterMode ? (
              <>
                {/* Formulaire d'inscription */}
                <div className="form-group">
                  <label htmlFor="nom">Nom *</label>
                  <div className="input-container">
                    <input
                      type="text"
                      id="nom"
                      value={registerData.nom}
                      onChange={(e) => handleRegisterInputChange('nom', e.target.value)}
                      placeholder="Votre nom"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="prenom">Prénom *</label>
                  <div className="input-container">
                    <input
                      type="text"
                      id="prenom"
                      value={registerData.prenom}
                      onChange={(e) => handleRegisterInputChange('prenom', e.target.value)}
                      placeholder="Votre prénom"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="register-email">Adresse email *</label>
                  <div className="input-container">
                    <Mail className="input-icon" size={20} />
                    <input
                      type="email"
                      id="register-email"
                      value={registerData.email}
                      onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                      placeholder="votre.email@aganor.ga"
                      disabled={loading}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="telephone">Téléphone</label>
                  <div className="input-container">
                    <input
                      type="tel"
                      id="telephone"
                      value={registerData.telephone}
                      onChange={(e) => handleRegisterInputChange('telephone', e.target.value)}
                      placeholder="+241 XX XX XX XX"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="role">Rôle *</label>
                  <div className="input-container">
                    <select
                      id="role"
                      value={registerData.role}
                      onChange={(e) => handleRegisterInputChange('role', e.target.value as any)}
                      disabled={loading}
                      required
                    >
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="zone">Zone d'intervention</label>
                  <div className="input-container">
                    <select
                      id="zone"
                      value={registerData.zone}
                      onChange={(e) => handleRegisterInputChange('zone', e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Sélectionner une zone</option>
                      {zones.map(zone => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="register-password">Mot de passe *</label>
                  <div className="input-container">
                    <Lock className="input-icon" size={20} />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      id="register-password"
                      value={registerData.password}
                      onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                      placeholder="Minimum 6 caractères"
                      disabled={loading}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={toggleRegisterPasswordVisibility}
                      disabled={loading}
                    >
                      {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirmer le mot de passe *</label>
                  <div className="input-container">
                    <Lock className="input-icon" size={20} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm-password"
                      value={registerData.confirmPassword}
                      onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirmer votre mot de passe"
                      disabled={loading}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={toggleConfirmPasswordVisibility}
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Formulaire de connexion */}
                <div className="form-group">
                  <label htmlFor="email">Adresse email</label>
                  <div className="input-container">
                    <Mail className="input-icon" size={20} />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="votre.email@aganor.ga"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Mot de passe</label>
                  <div className="input-container">
                    <Lock className="input-icon" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Votre mot de passe"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="spinner" size={20} />
                  {isRegisterMode ? 'Création en cours...' : 'Connexion en cours...'}
                </>
              ) : (
                isRegisterMode ? 'Créer le compte' : 'Se connecter'
              )}
            </button>

            {/* Bouton pour basculer entre connexion et inscription */}
            <button
              type="button"
              className="switch-mode-button"
              onClick={switchMode}
              disabled={loading}
            >
              {isRegisterMode 
                ? 'Déjà un compte ? Se connecter' 
                : 'Pas de compte ? Créer un compte'
              </div>
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p>Agence Gabonaise de Normalisation</p>
            <p className="version">Version 1.0.0</p>
          </div>
        </div>

        {/* Informations de démonstration - seulement en mode connexion */}
        {!isRegisterMode && (
          <div className="demo-info">
            <h3>Compte de démonstration</h3>
            <div className="demo-credentials">
              <p><strong>Email :</strong> jc.mbadinga@aganor.ga</p>
              <p><strong>Mot de passe :</strong> aganor2025</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;