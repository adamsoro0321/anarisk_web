/**
 * Configuration et instance Axios pour les appels API
 * Version TypeScript avec typage complet
 */
import axios from "axios";
import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import useAuthStore from "../store/authStore";

// ========== CONFIGURATION ==========

const HOST = import.meta.env.VITE_API_HOST || "127.0.0.1";
const PORT = import.meta.env.VITE_API_PORT || 5000;
const API_VERSION = import.meta.env.VITE_API_VERSION || "v1";

export const baseUrl = `http://${HOST}:${PORT}/api/${API_VERSION}`;

// ========== TYPES ==========

export interface ApiError {
  success: false;
  message: string;
  error_code: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Type pour les erreurs Axios
export interface ApiAxiosError extends AxiosError<ApiError> {
  response?: AxiosResponse<ApiError>;
}

// ========== CRÉATION DE L'INSTANCE API ==========

/**
 * Crée et configure une instance Axios avec les intercepteurs
 */
const createAPI = (): AxiosInstance => {
  const api = axios.create({
    baseURL: baseUrl,
    timeout: 30000, // 30 secondes
    headers: {
      "Content-Type": "application/json",
    },
  });

  // ========== INTERCEPTEUR DE REQUÊTE ==========
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      // Récupère le token depuis le store à chaque requête
      const { token } = useAuthStore.getState();

      // Si le token existe, l'ajouter à l'en-tête Authorization
      if (token && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: AxiosError): Promise<never> => {
      return Promise.reject(error);
    }
  );

  // ========== INTERCEPTEUR DE RÉPONSE ==========
  api.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      return response;
    },
    async (error: ApiAxiosError): Promise<never> => {
      const { logout } = useAuthStore.getState();

      // Gestion des erreurs d'authentification
      if (error.response) {
        const { status } = error.response;

        if (status === 401) {
          // Token expiré ou invalide
          console.warn("Session expirée. Déconnexion...");
          logout();
          window.location.href = "/login";
        } else if (status === 403) {
          // Accès refusé
          console.warn("Accès refusé.");
        }
      }

      // Gestion des erreurs réseau
      if (error.code === "ECONNABORTED") {
        console.error("La requête a expiré (timeout)");
      } else if (!error.response) {
        console.error("Erreur réseau - Impossible de contacter le serveur");
      }

      return Promise.reject(error);
    }
  );

  return api;
};

// ========== INSTANCE SINGLETON ==========

const API = createAPI();

// ========== FONCTIONS UTILITAIRES ==========

/**
 * Vérifie si une réponse API est un succès
 */
export const isApiSuccess = <T>(
  response: ApiResponse<T>
): response is ApiSuccess<T> => {
  return response.success === true;
};

/**
 * Vérifie si une réponse API est une erreur
 */
export const isApiError = <T>(response: ApiResponse<T>): response is ApiError => {
  return response.success === false;
};

/**
 * Extrait le message d'erreur d'une erreur Axios
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as ApiAxiosError;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Une erreur inattendue s'est produite";
};

/**
 * Extrait le code d'erreur d'une erreur Axios
 */
export const getErrorCode = (error: unknown): string | null => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as ApiAxiosError;
    return axiosError.response?.data?.error_code || null;
  }
  return null;
};

// ========== EXPORTS ==========

export { API };
export default API;
