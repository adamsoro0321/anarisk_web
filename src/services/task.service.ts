import { API } from "./api";

// ================== Interfaces ==================

export interface TaskLog {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
}

export interface TaskData {
  task_id: string;
  task_name: string;
  quantume: string | null;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILURE' | 'CANCELLED';
  logs: TaskLog[];
  progress: number;
  current_step: string;
  start_time: string | null;
  end_time: string | null;
  duration: number | null;
  result: Record<string, unknown> | null;
  error: string | null;
  metadata: Record<string, unknown>;
}

export interface TaskListResponse {
  success: boolean;
  count: number;
  data: TaskData[];
}

export interface TaskDetailsResponse {
  success: boolean;
  data: TaskData;
}

export interface TaskLogsResponse {
  success: boolean;
  task_id: string;
  count: number;
  logs: TaskLog[];
}

export interface TaskStatusResponse {
  success: boolean;
  task_id: string;
  status: string;
  progress: number;
  current_step: string;
  error: string | null;
}

export interface TaskStatsResponse {
  success: boolean;
  data: {
    total: number;
    pending: number;
    running: number;
    success: number;
    failure: number;
    cancelled: number;
  };
}

export interface DeleteTaskResponse {
  success: boolean;
  message: string;
  task_id: string;
}

export interface CleanupTasksResponse {
  success: boolean;
  message: string;
  count: number;
}

// ================== Service ==================

export class TaskService {
  /**
   * Récupère la liste de toutes les tâches
   */
  static async getAllTasks(includeCompleted = true, limit?: number): Promise<TaskListResponse> {
    const params = new URLSearchParams();
    params.append('include_completed', includeCompleted.toString());
    if (limit) params.append('limit', limit.toString());
    
    const response = await API.get<TaskListResponse>(`/tasks?${params.toString()}`);
    return response.data;
  }

  /**
   * Récupère uniquement les tâches actives (PENDING ou RUNNING)
   */
  static async getActiveTasks(): Promise<TaskListResponse> {
    const response = await API.get<TaskListResponse>('/tasks/active');
    return response.data;
  }

  /**
   * Récupère les statistiques sur les tâches
   */
  static async getStats(): Promise<TaskStatsResponse> {
    const response = await API.get<TaskStatsResponse>('/tasks/stats');
    return response.data;
  }

  /**
   * Récupère les détails complets d'une tâche
   */
  static async getTaskDetails(taskId: string): Promise<TaskDetailsResponse> {
    const response = await API.get<TaskDetailsResponse>(`/tasks/${taskId}`);
    return response.data;
  }

  /**
   * Récupère les logs d'une tâche
   */
  static async getTaskLogs(
    taskId: string,
    options?: {
      limit?: number;
      level?: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
      since?: string;
    }
  ): Promise<TaskLogsResponse> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.level) params.append('level', options.level);
    if (options?.since) params.append('since', options.since);
    
    const queryString = params.toString();
    const url = queryString ? `/tasks/${taskId}/logs?${queryString}` : `/tasks/${taskId}/logs`;
    
    const response = await API.get<TaskLogsResponse>(url);
    return response.data;
  }

  /**
   * Récupère uniquement le statut d'une tâche (léger, pour polling)
   */
  static async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    const response = await API.get<TaskStatusResponse>(`/tasks/${taskId}/status`);
    return response.data;
  }

  /**
   * Supprime une tâche (uniquement si terminée)
   */
  static async deleteTask(taskId: string): Promise<DeleteTaskResponse> {
    const response = await API.delete<DeleteTaskResponse>(`/tasks/${taskId}`);
    return response.data;
  }

  /**
   * Nettoie les tâches terminées anciennes
   */
  static async cleanupOldTasks(): Promise<CleanupTasksResponse> {
    const response = await API.post<CleanupTasksResponse>('/tasks/cleanup');
    return response.data;
  }

  /**
   * Helper: Vérifie si une tâche est terminée
   */
  static isTaskCompleted(status: string): boolean {
    return ['SUCCESS', 'FAILURE', 'CANCELLED'].includes(status.toUpperCase());
  }

  /**
   * Helper: Vérifie si une tâche est active
   */
  static isTaskActive(status: string): boolean {
    return ['PENDING', 'RUNNING'].includes(status.toUpperCase());
  }

  /**
   * Helper: Obtient la couleur du statut pour l'UI
   */
  static getStatusColor(status: string): 'default' | 'primary' | 'error' | 'info' | 'success' | 'warning' {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'info';
      case 'RUNNING':
        return 'primary';
      case 'SUCCESS':
        return 'success';
      case 'FAILURE':
        return 'error';
      case 'CANCELLED':
        return 'warning';
      default:
        return 'default';
    }
  }

  /**
   * Helper: Obtient la couleur du niveau de log
   */
  static getLogLevelColor(level: string): string {
    switch (level.toUpperCase()) {
      case 'DEBUG':
        return '#9E9E9E';
      case 'INFO':
        return '#2196F3';
      case 'SUCCESS':
        return '#4CAF50';
      case 'WARNING':
        return '#FF9800';
      case 'ERROR':
        return '#F44336';
      default:
        return '#000000';
    }
  }
}

export default TaskService;
