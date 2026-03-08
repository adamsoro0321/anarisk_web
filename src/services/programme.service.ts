/**
 * Service de gestion des programmes
 * Gère toutes les requêtes API liées aux programmes, structures, sous-structures et brigades
 */
import { API } from "./api";

// ========== TYPES ==========

export interface Programme {
  name: string;
  path: string;
  date: string;
  structures_count: number;
}

export interface Structure {
  code: string;
  path: string;
  sous_structures_count: number;
  total_files: number;
  total_contribuables: number;
}

export interface SousStructure {
  name: string;
  path: string;
  brigades_count: number;
  total_files: number;
  total_contribuables: number;
}

export interface Brigade {
  name: string;
  path: string;
  total_files: number;
  xlsx_count: number;
  png_count: number;
  contribuables_count: number;
}

export interface FileInfo {
  name: string;
  path: string;
  relative_path: string;
  extension: string;
  size: number;
  size_formatted: string;
  modified_date: string;
  file_type: "xlsx" | "chart" | "forecast" | "image" | "other";
  ifu: string | null;
}

export interface ContribuableFiles {
  ifu: string;
  xlsx: FileInfo | null;
  chart_png: FileInfo | null;
  forecast_png: FileInfo | null;
  files: FileInfo[];
}

export interface ProgrammeStats {
  programme: string;
  total_structures: number;
  total_sous_structures: number;
  total_brigades: number;
  total_files: number;
  total_xlsx: number;
  total_png: number;
  total_contribuables: number;
  structures_stats: StructureStatsItem[];
}

export interface StructureStatsItem {
  code: string;
  sous_structures_count: number;
  brigades_count: number;
  files_count: number;
  contribuables_count: number;
}

export interface StructureStats {
  structure: string;
  programme: string;
  total_sous_structures: number;
  total_brigades: number;
  total_files: number;
  total_contribuables: number;
  sous_structures_stats: SousStructureStatsItem[];
}

export interface SousStructureStatsItem {
  name: string;
  brigades_count: number;
  files_count: number;
  contribuables_count: number;
  brigades: BrigadeStatsItem[];
}

export interface BrigadeStatsItem {
  name: string;
  files_count: number;
  contribuables_count: number;
}

export interface GlobalStats {
  total_programmes: number;
  total_structures: number;
  total_files: number;
  total_contribuables: number;
  programmes: {
    name: string;
    date: string;
    stats: ProgrammeStats;
  }[];
}

// ========== TYPES DE RÉPONSE API ==========

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
  error_code?: string;
}

interface ListProgrammesResponse extends ApiResponse<Programme[]> {
  count: number;
}

interface ListStructuresResponse extends ApiResponse<Structure[]> {
  programme: string;
  count: number;
}

interface ListSousStructuresResponse extends ApiResponse<SousStructure[]> {
  programme: string;
  structure: string;
  count: number;
}

interface ListBrigadesResponse extends ApiResponse<Brigade[]> {
  programme: string;
  structure: string;
  sous_structure: string;
  count: number;
}

interface ListFilesResponse extends ApiResponse<FileInfo[]> {
  programme: string;
  structure: string;
  sous_structure: string;
  brigade: string;
  count: number;
}

interface ListContribuablesResponse extends ApiResponse<ContribuableFiles[]> {
  programme: string;
  structure: string;
  sous_structure: string;
  brigade: string;
  count: number;
}

interface SearchResponse extends ApiResponse<FileInfo[]> {
  ifu?: string;
  pattern?: string;
  programme_filter: string | null;
  extension_filter?: string | null;
  count: number;
}

interface ContribuableFilesResponse extends ApiResponse<ContribuableFiles> {
  programme: string;
  structure_filter: string | null;
}

// ========== SERVICE ==========

class ProgrammeService {
  private baseUrl = "/programmes";

  // ========== NIVEAU 0: PROGRAMMES ==========

  /**
   * Liste tous les programmes disponibles
   */
  async listProgrammes(): Promise<Programme[]> {
    const response = await API.get<ListProgrammesResponse>(this.baseUrl);
    if (!response.data.success) {
      throw new Error(response.data.message || "Erreur lors de la récupération des programmes");
    }
    return response.data.data;
  }

  // ========== NIVEAU 1: STRUCTURES ==========

  /**
   * Liste toutes les structures d'un programme
   * @param programmeName Nom du programme (ex: 'programme_2025_12_25')
   */
  async listStructures(programmeName: string): Promise<Structure[]> {
    const response = await API.get<ListStructuresResponse>(
      `${this.baseUrl}/${encodeURIComponent(programmeName)}/structures`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Erreur lors de la récupération des structures");
    }
    return response.data.data;
  }

  // ========== NIVEAU 2: SOUS-STRUCTURES ==========

  /**
   * Liste toutes les sous-structures d'une structure
   * @param programmeName Nom du programme
   * @param structureCode Code de la structure (ex: 'DGE', 'DME_CI')
   */
  async listSousStructures(
    programmeName: string,
    structureCode: string
  ): Promise<SousStructure[]> {
    const response = await API.get<ListSousStructuresResponse>(
      `${this.baseUrl}/${encodeURIComponent(programmeName)}/structures/${encodeURIComponent(structureCode)}/sous-structures`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Erreur lors de la récupération des sous-structures");
    }
    return response.data.data;
  }

  // ========== NIVEAU 3: BRIGADES ==========

  /**
   * Liste toutes les brigades d'une sous-structure
   * @param programmeName Nom du programme
   * @param structureCode Code de la structure
   * @param sousStructureName Nom de la sous-structure
   */
  async listBrigades(
    programmeName: string,
    structureCode: string,
    sousStructureName: string
  ): Promise<Brigade[]> {
    const response = await API.get<ListBrigadesResponse>(
      `${this.baseUrl}/${encodeURIComponent(programmeName)}/structures/${encodeURIComponent(structureCode)}/sous-structures/${encodeURIComponent(sousStructureName)}/brigades`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Erreur lors de la récupération des brigades");
    }
    return response.data.data;
  }

  // ========== NIVEAU 4: FICHIERS ==========

  /**
   * Liste tous les fichiers d'une brigade
   * @param programmeName Nom du programme
   * @param structureCode Code de la structure
   * @param sousStructureName Nom de la sous-structure
   * @param brigadeName Nom de la brigade
   */
  async listFilesInBrigade(
    programmeName: string,
    structureCode: string,
    sousStructureName: string,
    brigadeName: string
  ): Promise<FileInfo[]> {
    const response = await API.get<ListFilesResponse>(
      `${this.baseUrl}/${encodeURIComponent(programmeName)}/structures/${encodeURIComponent(structureCode)}/sous-structures/${encodeURIComponent(sousStructureName)}/brigades/${encodeURIComponent(brigadeName)}/files`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Erreur lors de la récupération des fichiers");
    }
    return response.data.data;
  }

  /**
   * Liste tous les contribuables d'une brigade (groupés par IFU)
   * @param programmeName Nom du programme
   * @param structureCode Code de la structure
   * @param sousStructureName Nom de la sous-structure
   * @param brigadeName Nom de la brigade
   */
  async listContribuablesInBrigade(
    programmeName: string,
    structureCode: string,
    sousStructureName: string,
    brigadeName: string
  ): Promise<ContribuableFiles[]> {
    const response = await API.get<ListContribuablesResponse>(
      `${this.baseUrl}/${encodeURIComponent(programmeName)}/structures/${encodeURIComponent(structureCode)}/sous-structures/${encodeURIComponent(sousStructureName)}/brigades/${encodeURIComponent(brigadeName)}/contribuables`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Erreur lors de la récupération des contribuables");
    }
    return response.data.data;
  }

  // ========== RECHERCHE ==========

  /**
   * Recherche tous les fichiers d'un contribuable par son IFU
   * @param ifu IFU du contribuable
   * @param programmeName Optionnel - limiter la recherche à un programme
   */
  async searchByIfu(ifu: string, programmeName?: string): Promise<FileInfo[]> {
    const params = programmeName ? { programme: programmeName } : {};
    const response = await API.get<SearchResponse>(
      `${this.baseUrl}/search/ifu/${encodeURIComponent(ifu)}`,
      { params }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Erreur lors de la recherche");
    }
    return response.data.data;
  }

  /**
   * Recherche des fichiers par pattern
   * @param pattern Pattern à rechercher
   * @param options Options de recherche
   */
  async searchFiles(
    pattern: string,
    options?: {
      programme?: string;
      extension?: string;
    }
  ): Promise<FileInfo[]> {
    const params: Record<string, string> = { pattern };
    if (options?.programme) params.programme = options.programme;
    if (options?.extension) params.extension = options.extension;

    const response = await API.get<SearchResponse>(
      `${this.baseUrl}/search/files`,
      { params }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Erreur lors de la recherche");
    }
    return response.data.data;
  }

  // ========== FICHIERS CONTRIBUABLE ==========

  /**
   * Obtient tous les fichiers associés à un contribuable
   * @param programmeName Nom du programme
   * @param ifu IFU du contribuable
   * @param structureCode Optionnel - code de la structure pour filtrer
   */
  async getContribuableFiles(
    programmeName: string,
    ifu: string,
    structureCode?: string
  ): Promise<ContribuableFiles> {
    const params = structureCode ? { structure: structureCode } : {};
    const response = await API.get<ContribuableFilesResponse>(
      `${this.baseUrl}/${encodeURIComponent(programmeName)}/contribuable/${encodeURIComponent(ifu)}/files`,
      { params }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Erreur lors de la récupération des fichiers");
    }
    return response.data.data;
  }

  // ========== STATISTIQUES ==========

  /**
   * Obtient les statistiques globales de tous les programmes
   */
  async getGlobalStats(): Promise<GlobalStats> {
    const response = await API.get<ApiResponse<GlobalStats>>(
      `${this.baseUrl}/stats`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Erreur lors de la récupération des statistiques");
    }
    return response.data.data;
  }

  /**
   * Obtient les statistiques d'un programme
   * @param programmeName Nom du programme
   */
  async getProgrammeStats(programmeName: string): Promise<ProgrammeStats> {
    const response = await API.get<ApiResponse<ProgrammeStats>>(
      `${this.baseUrl}/${encodeURIComponent(programmeName)}/stats`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Erreur lors de la récupération des statistiques");
    }
    return response.data.data;
  }

  /**
   * Obtient les statistiques d'une structure
   * @param programmeName Nom du programme
   * @param structureCode Code de la structure
   */
  async getStructureStats(
    programmeName: string,
    structureCode: string
  ): Promise<StructureStats> {
    const response = await API.get<ApiResponse<StructureStats>>(
      `${this.baseUrl}/${encodeURIComponent(programmeName)}/structures/${encodeURIComponent(structureCode)}/stats`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Erreur lors de la récupération des statistiques");
    }
    return response.data.data;
  }

  // ========== TÉLÉCHARGEMENT ==========

  /**
   * Obtient l'URL de téléchargement d'un fichier
   * @param programmeName Nom du programme
   * @param structureCode Code de la structure
   * @param sousStructureName Nom de la sous-structure
   * @param brigadeName Nom de la brigade
   * @param filename Nom du fichier
   */
  getFileDownloadUrl(
    programmeName: string,
    structureCode: string,
    sousStructureName: string,
    brigadeName: string,
    filename: string
  ): string {
    return `${API.defaults.baseURL}${this.baseUrl}/${encodeURIComponent(programmeName)}/structures/${encodeURIComponent(structureCode)}/sous-structures/${encodeURIComponent(sousStructureName)}/brigades/${encodeURIComponent(brigadeName)}/files/${encodeURIComponent(filename)}`;
  }

  /**
   * Télécharge un fichier
   * @param programmeName Nom du programme
   * @param structureCode Code de la structure
   * @param sousStructureName Nom de la sous-structure
   * @param brigadeName Nom de la brigade
   * @param filename Nom du fichier
   */
  async downloadFile(
    programmeName: string,
    structureCode: string,
    sousStructureName: string,
    brigadeName: string,
    filename: string
  ): Promise<Blob> {
    const response = await API.get(
      `${this.baseUrl}/${encodeURIComponent(programmeName)}/structures/${encodeURIComponent(structureCode)}/sous-structures/${encodeURIComponent(sousStructureName)}/brigades/${encodeURIComponent(brigadeName)}/files/${encodeURIComponent(filename)}`,
      { responseType: "blob" }
    );
    return response.data;
  }

  // ========== UTILITAIRES ==========

  /**
   * Construit le chemin complet pour la navigation
   */
  buildPath(params: {
    programme?: string;
    structure?: string;
    sousStructure?: string;
    brigade?: string;
  }): string {
    const parts: string[] = [];
    if (params.programme) parts.push(params.programme);
    if (params.structure) parts.push(params.structure);
    if (params.sousStructure) parts.push(params.sousStructure);
    if (params.brigade) parts.push(params.brigade);
    return parts.join("/");
  }

  /**
   * Parse un chemin en ses composants
   */
  parsePath(path: string): {
    programme?: string;
    structure?: string;
    sousStructure?: string;
    brigade?: string;
  } {
    const parts = path.split("/").filter(Boolean);
    return {
      programme: parts[0],
      structure: parts[1],
      sousStructure: parts[2],
      brigade: parts[3],
    };
  }
}

// Instance singleton du service
export const programmeService = new ProgrammeService();

// Export par défaut
export default programmeService;
