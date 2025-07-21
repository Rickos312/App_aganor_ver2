import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { signInUser } from '../lib/firebase';

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
      const userCredential = await signInUser(formData.email, formData.password);
      const user = userCredential.user;
      
      // Récupérer les informations supplémentaires de l'agent depuis Firestore
      // Pour l'instant, on utilise les informations de base de Firebase Auth
      const userData = {
        id: user.uid,
        email: user.email,
        nom: user.displayName || 'Utilisateur',
        role: 'Inspecteur' // À récupérer depuis Firestore plus tard
      };
      
      onLogin(userData);
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      // Messages d'erreur personnalisés
      switch (error.code) {
        case 'auth/user-not-found':
          setError('Aucun compte trouvé avec cette adresse email');
          break;
        case 'auth/wrong-password':
          setError('Mot de passe incorrect');
          break;
        case 'auth/invalid-email':
          setError('Adresse email invalide');
          break;
        case 'auth/too-many-requests':
          setError('Trop de tentatives de connexion. Veuillez réessayer plus tard');
          break;
        default:
          setError('Erreur de connexion. Veuillez vérifier vos identifiants');
      }
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