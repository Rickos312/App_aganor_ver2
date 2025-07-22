// Service API principal pour gérer les requêtes authentifiées
const API_BASE_URL = 'https://localhost:3003/api';

// Fonction utilitaire pour récupérer le token JWT depuis localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Fonction utilitaire pour effectuer des requêtes authentifiées
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Fonction pour sauvegarder le token après connexion
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Fonction pour supprimer le token lors de la déconnexion
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};