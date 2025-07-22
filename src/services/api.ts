// Service API pour les requêtes authentifiées
const API_BASE_URL = 'http://localhost:3003/api';

// Interface pour les réponses d'erreur
interface ApiError {
  error: string;
  message?: string;
}

// Fonction utilitaire pour effectuer des requêtes authentifiées
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(errorData.message || errorData.error || 'Erreur de requête');
    }

    // Vérifier si la réponse contient du JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    // Si pas de JSON, retourner un objet vide
    return {} as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur de connexion au serveur');
  }
}

// Fonction pour stocker le token d'authentification
export function setAuthToken(token: string): void {
  localStorage.setItem('authToken', token);
}

// Fonction pour récupérer le token d'authentification
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

// Fonction pour supprimer le token d'authentification
export function removeAuthToken(): void {
  localStorage.removeItem('authToken');
}

// Fonction pour vérifier si l'utilisateur est authentifié
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}