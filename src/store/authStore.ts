// store/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import CryptoJS from "crypto-js";

// Types
export interface User {
  id: number;
  email: string;
  name?: string;
  nom?: string;
  prenom?: string;
  role?: string;
  roles?: string[];
  ur?: string;
  brigade?: string;
  [key: string]: unknown;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  expiresAt: number | null;
  login: (userData: User, token: string, expiresAt: number) => void;
  logout: () => void;
  setToken: (token: string, expiresAt: number) => void;
  clearToken: () => void;
}

// Clé secrète pour le chiffrement AES
const SECRET_KEY = "1234567890abcdef"; // Assure-toi que cette clé est sécurisée en production

// Fonction pour chiffrer les données
const encryptData = (data: unknown): string => {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    SECRET_KEY
  ).toString();
  return encrypted;
};

// Fonction pour déchiffrer les données
const decryptData = (encryptedData: string): unknown => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decrypted;
};

// Stockage personnalisé avec chiffrement
const encryptedLocalStorage = {
  getItem: (name: string): string | null => {
    const encryptedData = localStorage.getItem(name);
    if (!encryptedData) return null;
    return decryptData(encryptedData) as string;
  },
  setItem: (name: string, value: string): void => {
    const encryptedData = encryptData(value);
    localStorage.setItem(name, encryptedData);
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

// Création du store Zustand avec persistance et chiffrement
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      expiresAt: null,
      login: (userData: User, token: string, expiresAt: number) =>
        set({ user: userData, token: token, expiresAt: expiresAt }),
      logout: () => {
        // Nettoyer le state
        set({ user: null, token: null, expiresAt: null });
        // Nettoyer explicitement le localStorage
        localStorage.removeItem("auth-storage");
      },
      setToken: (token: string, expiresAt: number) =>
        set({ token: token, expiresAt: expiresAt }),
      clearToken: () => set({ token: null, expiresAt: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => encryptedLocalStorage),
    }
  )
);

export default useAuthStore;
