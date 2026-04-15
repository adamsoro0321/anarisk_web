import { API } from "./api";

// ========== TYPES ET INTERFACES ==========

export interface Indicateur {
  id: number;
  code_indicateur: string;
  intitule: string;
  axes_controle?: string | null;
  objectif?: string | null;
  unite_mesure?: string | null;
  variables_calcul?: string | null;
  formule_calcul?: string | null;
  seuil_declenchement?: string | null;
  regle_selection?: string | null;
  criticite?: string | null;
  calcul_ecart?: string | null;
  coefficient_moderation?: string | null;
  impact_recettes?: string | null;
  designation_anomalie?: string | null;
  type_controle?: string | null;
  sources_donnees?: string | null;
  impots_controle?: string | null;
  segments_concernes?: string | null;
  regimes_concernes?: string | null;
  forme_juridique?: string | null;
  implemente?: string | null;
  limite?: string | null;
  commentaires?: string | null;
  type?: string | null;
  actif: boolean;
  date_creation: string | null;
  date_modification?: string | null;
}

export interface IndicateurListResponse {
  success: boolean;
  data: Indicateur[];
}

export interface IndicateurSingleResponse {
  success: boolean;
  data: Indicateur;
  message?: string;
}

export interface IndicateurStatsResponse {
  success: boolean;
  data: {
    total: number;
    actifs: number;
    inactifs: number;
    implementes: number;
    non_implementes: number;
    par_criticite: Record<string, number>;
    par_type_controle: Record<string, number>;
  };
}

export interface CreateIndicateurData {
  code_indicateur: string;
  intitule: string;
  axes_controle?: string;
  objectif?: string;
  unite_mesure?: string;
  variables_calcul?: string;
  formule_calcul?: string;
  seuil_declenchement?: string;
  regle_selection?: string;
  criticite?: string;
  calcul_ecart?: string;
  coefficient_moderation?: string;
  impact_recettes?: string;
  designation_anomalie?: string;
  type_controle?: string;
  sources_donnees?: string;
  impots_controle?: string;
  segments_concernes?: string;
  regimes_concernes?: string;
  forme_juridique?: string;
  implemente?: string;
  limite?: string;
  commentaires?: string;
  type?: string;
  actif?: boolean;
}

// ========== SERVICE INDICATEURS ==========

export class IndicateurService {
  /**
   * Récupère tous les indicateurs
   */
  static async getAll(params?: Record<string, any>): Promise<IndicateurListResponse> {

 const queryParams = new URLSearchParams();
   if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }
    const url = queryParams.toString() 
    ? `/indicateurs?${queryParams.toString()}`
    : '/indicateurs';
    const response = await API.get<IndicateurListResponse>(url);
    return response.data;
  }

  /**
   * Récupère un indicateur spécifique par son ID
   */
  static async getById(id: number): Promise<IndicateurSingleResponse> {
    const response = await API.get<IndicateurSingleResponse>(`/indicateurs/${id}`);
    return response.data;
  }

  /**
   * Récupère un indicateur spécifique par son code
   */
  static async getByCode(code: string): Promise<IndicateurSingleResponse> {
    const response = await API.get<IndicateurSingleResponse>(`/indicateurs/code/${code}`);
    return response.data;
  }

  /**
   * Crée un nouvel indicateur
   */
  static async create(data: CreateIndicateurData): Promise<IndicateurSingleResponse> {
    const response = await API.post<IndicateurSingleResponse>('/indicateurs', data);
    return response.data;
  }

  /**
   * Met à jour un indicateur existant
   */
  static async update(id: number, data: Partial<CreateIndicateurData>): Promise<IndicateurSingleResponse> {
    const response = await API.put<IndicateurSingleResponse>(`/indicateurs/${id}`, data);
    return response.data;
  }

  /**
   * Désactive un indicateur (soft delete)
   */
  static async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await API.delete<{ success: boolean; message: string }>(`/indicateurs/${id}`);
    return response.data;
  }

  /**
   * Récupère les statistiques des indicateurs
   */
  static async getStats(): Promise<IndicateurStatsResponse> {
    const response = await API.get<IndicateurStatsResponse>('/indicateurs/stats');
    return response.data;
  }

  /**
   * Récupère uniquement les indicateurs actifs
   */
  static async getActive(): Promise<IndicateurListResponse> {
    const response = await API.get<IndicateurListResponse>('/indicateurs?actif=true');
    return response.data;
  }

  /**
   * Active/Désactive un indicateur
   */
  static async toggleActive(id: number, actif: boolean): Promise<IndicateurSingleResponse> {
    const response = await API.put<IndicateurSingleResponse>(`/indicateurs/${id}`, { actif });
    return response.data;
  }
}

export default IndicateurService;
