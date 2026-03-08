import { API } from "./api";

export interface QuantumeItem {
  id: number;
  libelle: string;
  date_creation: string | null;
}

export interface QuantumeListResponse {
  success: boolean;
  count: number;
  data: QuantumeItem[];
}

export interface QuantumeSingleResponse {
  success: boolean;
  data: QuantumeItem;
  message?: string;
}

export interface QuantumeGenerateResponse {
  success: boolean;
  message?: string;
  task_id?: string;
  status_url?: string;
}

export class QuantumeService {
  static async getAll(): Promise<QuantumeListResponse> {
    const response = await API.get<QuantumeListResponse>('/quantumes');
    return response.data;
  }

  static async getById(id: number): Promise<QuantumeSingleResponse> {
    const response = await API.get<QuantumeSingleResponse>(`/quantumes/${id}`);
    return response.data;
  }

  static async create(libelle: string): Promise<QuantumeSingleResponse> {
    const response = await API.post<QuantumeSingleResponse>('/quantumes', { libelle });
    return response.data;
  }

  static async update(id: number, libelle: string): Promise<QuantumeSingleResponse> {
    const response = await API.put<QuantumeSingleResponse>(`/quantumes/${id}`, { libelle });
    return response.data;
  }

  static async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await API.delete<{ success: boolean; message: string }>(`/quantumes/${id}`);
    return response.data;
  }

  /**
   * Lance la génération de la pré-liste pour un quantum donné.
   * Déclenche la tâche Celery run_risk_analysis côté backend.
   * @param quantumeId  id du quantum sélectionné
   * @param quantumeLibelle  libellé du quantum (transmis au backend pour traçabilité)
   */
  static async generate(quantumeId: number, quantumeLibelle: string): Promise<QuantumeGenerateResponse> {
    const response = await API.post<QuantumeGenerateResponse>('/generate_quantume', {
      quantume_id: quantumeId,
      quantume: quantumeLibelle,
    });
    return response.data;
  }
}

export default QuantumeService;
