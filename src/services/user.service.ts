import { API } from "./api";

// ========== TYPES ET INTERFACES ==========

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  status: string;
  date_creation?: string;
  date_modification?: string;
  ur?: string | null;
  brigade?: string | null;
  roles: string[];
}

export interface UserListResponse {
  success: boolean;
  data: User[];
  pagination?: {
    total: number;
    pages: number;
    current_page: number;
    per_page: number;
  };
  message?: string;
}

export interface UserSingleResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface CreateUserData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role?: string;
  ur?: string;
  brigade?: string;
}

export interface UpdateUserData {
  nom?: string;
  prenom?: string;
  email?: string;
  password?: string;
  status?: string;
  role?: string;
  ur?: string;
  brigade?: string;
}

// ========== SERVICE UTILISATEURS ==========

export class UserService {
  /**
   * Récupère tous les utilisateurs avec pagination
   */
  static async getAll(params?: { page?: number; per_page?: number }): Promise<UserListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.per_page) queryParams.append("per_page", params.per_page.toString());
    }

    const url = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await API.get<UserListResponse>(url);
    return response.data;
  }

  /**
   * Récupère un utilisateur par son ID
   */
  static async getById(id: number): Promise<UserSingleResponse> {
    const response = await API.get<UserSingleResponse>(`/users/${id}`);
    return response.data;
  }

  /**
   * Crée un nouvel utilisateur
   */
  static async create(data: CreateUserData): Promise<UserSingleResponse> {
    const response = await API.post<UserSingleResponse>("/users", data);
    return response.data;
  }

  /**
   * Met à jour un utilisateur
   */
  static async update(id: number, data: UpdateUserData): Promise<UserSingleResponse> {
    const response = await API.put<UserSingleResponse>(`/users/${id}`, data);
    return response.data;
  }

  /**
   * Supprime un utilisateur
   */
  static async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await API.delete<{ success: boolean; message: string }>(`/users/${id}`);
    return response.data;
  }

  /**
   * Change le statut d'un utilisateur (actif/inactif)
   */
  static async changeStatus(
    id: number,
    status: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await API.patch<{ success: boolean; message: string }>(`/users/${id}/status`, {
      status,
    });
    return response.data;
  }
}

export default UserService;
