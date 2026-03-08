import { API } from "./api";

export interface BrigadeItem {
  id: number;
  libelle: string;
  date_creation: string | null;
}

export interface BrigadeListResponse {
  success: boolean;
  count: number;
  data: BrigadeItem[];
}

export interface BrigadeSingleResponse {
  success: boolean;
  data: BrigadeItem;
  message?: string;
}

export class BrigadeService {
  static async getAll(): Promise<BrigadeListResponse> {
    const response = await API.get<BrigadeListResponse>('/brigades');
    return response.data;
  }

  static async getById(id: number): Promise<BrigadeSingleResponse> {
    const response = await API.get<BrigadeSingleResponse>(`/brigades/${id}`);
    return response.data;
  }

  static async create(libelle: string): Promise<BrigadeSingleResponse> {
    const response = await API.post<BrigadeSingleResponse>('/brigades', { libelle });
    return response.data;
  }

  static async update(id: number, libelle: string): Promise<BrigadeSingleResponse> {
    const response = await API.put<BrigadeSingleResponse>(`/brigades/${id}`, { libelle });
    return response.data;
  }

  static async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await API.delete<{ success: boolean; message: string }>(`/brigades/${id}`);
    return response.data;
  }
}

export default BrigadeService;
