import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import '../lib/firebase'; // Importer la configuration Firebase

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
      const auth = getAuth();
      
      // Utiliser signInWithEmailAndPassword du SDK Firebase
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      console.log('Connexion réussie ! Utilisateur :', userCredential.user);
      
      // Passer les données utilisateur au callback onLogin
      const userData = {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        nom: userCredential.user.displayName || 'Utilisateur',
        prenom: '',
        role: 'Inspecteur'
      };
      
      onLogin(userData);
    } catch (error: any) {
      console.error('Erreur de connexion Firebase:', error.code, error.message);
      
      // Gérer les erreurs d'authentification Firebase
      let errorMessage = "Une erreur inconnue est survenue.";
      if (error.code === 'auth/user-not-found') {
        errorMessage = "Aucun utilisateur trouvé avec cet email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Mot de passe incorrect.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Adresse email invalide.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Trop de tentatives de connexion. Veuillez réessayer plus tard.";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Identifiants invalides. Vérifiez votre email et mot de passe.";
      }
      
      setError(errorMessage);
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
      const auth = getAuth();
      
      // Créer un compte avec Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
      
      console.log('Compte créé avec succès ! Utilisateur :', userCredential.user);
      
      // Passer les données utilisateur au callback onLogin
      const userData = {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        nom: registerData.nom,
        prenom: registerData.prenom,
        role: registerData.role
      };
      
      onLogin(userData);
    } catch (error: any) {
      console.error('Erreur de création de compte Firebase:', error.code, error.message);
      
      // Gérer les erreurs de création de compte Firebase
      let errorMessage = "Une erreur inconnue est survenue.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Un compte avec cet email existe déjà.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Adresse email invalide.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Le mot de passe est trop faible.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "La création de compte est désactivée.";
      }
      
      setError(errorMessage);
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
              }
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