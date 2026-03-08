// API.js
import axios from "axios";
import useAuthStore from "../store/authStore";

const host = "127.0.0.1";
const baseUrl = `http://${host}:${5000}/api/v1`;

// Fonction pour créer et configurer l'instance d'API
const createAPI = () => {
  const API = axios.create({
    baseURL: baseUrl,
  });

  // Récupère le token et la fonction logout depuis le store
  const token = useAuthStore.getState().token;
  const logout = useAuthStore.getState().logout;

  // Intercepteur de requête
  API.interceptors.request.use(
    (config) => {
      const authToken = token;
      // Si le token existe, l'ajouter à l'en-tête Authorization
      if (authToken && authToken !== "null") {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
      // Si le token est expiré, appeler la fonction logout
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Intercepteur de réponse
  API.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        // logout();
        //   window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return API;
};

// Crée et exporte l'instance d'API
const API = createAPI();
export { API, baseUrl };
