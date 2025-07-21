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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    setFormData(prev => ({
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
        id: data.user.id,
        email: data.user.email,
        nom: data.user.nom || 'Utilisateur',
        prenom: data.user.prenom || '',
        role: data.user.role || 'Inspecteur'
      };
      
      onLogin(userData);
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      // Afficher le message d'erreur du backend ou un message par défaut
      setError(error.message || 'Erreur de connexion. Veuillez vérifier vos identifiants');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
            <h1 className="login-title">CRM Métrologie</h1>
            <p className="login-subtitle">Votre passerelle vers la Qualité</p>
          </div>

          {/* Formulaire de connexion */}
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

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

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="spinner" size={20} />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p>Agence Gabonaise de Normalisation</p>
            <p className="version">Version 1.0.0</p>
          </div>
        </div>

        {/* Informations de démonstration */}
        <div className="demo-info">
          <h3>Compte de démonstration</h3>
          <div className="demo-credentials">
            <p><strong>Email :</strong> jc.mbadinga@aganor.ga</p>
            <p><strong>Mot de passe :</strong> aganor2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;