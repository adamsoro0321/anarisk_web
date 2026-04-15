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

// ---- Statut des artefacts ----
export interface ArtefactInfo {
  name: string;
  type?: string;             // 'csv' | 'dossier'  (pré-liste)
  size_formatted?: string | null;
  modified?: string;
  nb_fiches?: number;        // fiches seulement
}

export interface ArtefactStatus {
  exists: boolean;
  info: ArtefactInfo | null;
}

export interface QuantumeStatusItem extends QuantumeItem {
  preliste:   ArtefactStatus;
  programme:  ArtefactStatus;
  fiches:     ArtefactStatus;
}

export interface QuantumeStatusResponse {
  success: boolean;
  count: number;
  data: QuantumeStatusItem[];
}

// ---- Tâches ----
export interface TaskItem {
  task_id: string;
  name: string;
  state: 'ACTIVE' | 'RESERVED' | 'SCHEDULED';
  worker: string | null;
  time_start: number | null;
}

export interface TaskListResponse {
  success: boolean;
  count: number;
  data: TaskItem[];
}

export interface TaskStatusResponse {
  success: boolean;
  task_id: string;
  state: string;
  status?: string;
  current?: number;
  total?: number;
  percent?: number;
  result?: Record<string, unknown>;
  error?: string;
}

export interface RevokeTaskResponse {
  success: boolean;
  task_id: string;
  state: string;
  terminate: boolean;
  lock_released: boolean;
  message: string;
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
  static async generate(quantumeLibelle: string): Promise<QuantumeGenerateResponse> {
    const response = await API.post<QuantumeGenerateResponse>(`/generate_preliste?quantume=${encodeURIComponent(quantumeLibelle)}`);
    return response.data;
  }

  static async generateFiches(quantumeLibelle: string): Promise<QuantumeGenerateResponse> {
    const response = await API.post<QuantumeGenerateResponse>(`/generate-fiches?quantume=${encodeURIComponent(quantumeLibelle)}`);
    return response.data;
  }

  static async getStatus(): Promise<QuantumeStatusResponse> {
    const response = await API.get<QuantumeStatusResponse>('/quantumes/status');
    return response.data;
  }

  static async getTasks(): Promise<TaskListResponse> {
    const res = await API.get<TaskListResponse>('/run/tasks');
    return res.data;
  }

  static async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    const res = await API.get<TaskStatusResponse>(`/run/status/${taskId}`);
    return res.data;
  }

  static async revokeTask(taskId: string, terminate = false): Promise<RevokeTaskResponse> {
    const res = await API.post<RevokeTaskResponse>(`/revoke/${taskId}`, { terminate });
    return res.data;
  }
}

export default QuantumeService;
