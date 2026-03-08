/**
 * Service de gestion des statistiques
 * Gère toutes les requêtes API liées aux statistiques et analyses des risques
 */
import { API } from "./api";

// ========== TYPES ==========

/**
 * Statistiques sur un score spécifique
 */
export interface ScoreStatistics {
  min: number | null;
  max: number | null;
  mean: number | null;
  median: number | null;
  std: number | null;
}

/**
 * Distribution des risques par niveau
 */
export interface RiskDistribution {
  [key: string]: number;
}

/**
 * Statistiques globales
 */
export interface GlobalStats {
  total_contribuables: number;
  columns: string[];
  score_statistics?: {
    [key: string]: ScoreStatistics;
  };
  risk_distribution?: {
    [key: string]: RiskDistribution;
  };
}

/**
 * Réponse API pour les statistiques
 */
export interface StatsResponse {
  success: boolean;
  stats: GlobalStats;
}

/**
 * Information sur une colonne
 */
export interface ColumnInfo {
  name: string;
  dtype: string;
  non_null_count: number;
  null_count: number;
  unique_count: number;
}

/**
 * Résumé des données
 */
export interface DataSummary {
  total_records: number;
  total_columns: number;
  memory_usage_mb: number;
  columns_info: ColumnInfo[];
}

/**
 * Réponse API pour le résumé
 */
export interface SummaryResponse {
  success: boolean;
  summary: DataSummary;
}

/**
 * Contribuable avec données de risque
 */
export interface RiskContribuable {
  [key: string]: any; // Structure flexible selon les colonnes disponibles
}

/**
 * Réponse API pour les top risques
 */
export interface TopRisksResponse {
  success: boolean;
  score_column_used: string;
  count: number;
  data: RiskContribuable[];
}

/**
 * Paramètres pour la requête des top risques
 */
export interface TopRisksParams {
  limit?: number; // Nombre de résultats (défaut: 10, max: 100)
  score_column?: string; // Colonne de score à utiliser (optionnel)
}

/**
 * Données d'un indicateur par année
 */
export interface IndicatorYearData {
  annee: number | null;
  risque: string | null;
  score: number | null;
  gap: number | null;
}

/**
 * Indicateur de risque d'un contribuable
 */
export interface ContribuableIndicator {
  id: string;
  name: string;
  risque: string | null;
  score: number | null;
  gap: number | null;
  data: IndicatorYearData[];
}

/**
 * Informations de base d'un contribuable
 */
export interface ContribuableInfo {
  NUM_IFU?: string;
  NOM_MINEFID?: string;
  RAISON_SOCIALE?: string;
  ETAT?: string;
  CODE_SECT_ACT?: string;
  CODE_REG_FISC?: string;
  STRUCTURES?: string;
  DATE_DERNIERE_VG?: string;
  DATE_DERNIERE_VP?: string;
  DATE_DERNIERE_AVIS?: string;
  [key: string]: string | undefined;
}

/**
 * Comptage des risques par niveau
 */
export interface RiskCounts {
  rouge: number;
  jaune: number;
  vert: number;
  non_disponible: number;
}

/**
 * Données complètes d'un contribuable
 */
export interface ContribuableData {
  ifu: string;
  info: ContribuableInfo;
  score_total: number;
  risk_counts: RiskCounts;
  years_available: number[];
  indicators_count: number;
  indicators: ContribuableIndicator[];
  records_count: number;
}

/**
 * Réponse API pour un contribuable
 */
export interface ContribuableResponse {
  success: boolean;
  contribuable: ContribuableData;
}

/**
 * Résultat de recherche d'un contribuable
 */
export interface SearchResult {
  ifu: string;
  nom: string | null;
  structure?: string;
  etat?: string;
}

/**
 * Réponse API pour la recherche
 */
export interface SearchResponse {
  success: boolean;
  query: string;
  count: number;
  results: SearchResult[];
}

// ========== TYPES INDICATEUR ==========

/**
 * Distribution des risques pour un indicateur
 */
export interface IndicatorDistribution {
  counts: {
    rouge: number;
    jaune: number;
    vert: number;
    non_disponible?: number;
    autre?: number;
  };
  percentages: {
    rouge: number;
    jaune: number;
    vert: number;
  };
  total_contribuables: number;
  total_evaluated: number;
}

/**
 * Statistiques de score
 */
export interface ScoreStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  std: number;
}

/**
 * Statistiques de gap
 */
export interface GapStats {
  min: number;
  max: number;
  mean: number;
  sum: number;
  count: number;
}

/**
 * Top risque pour un indicateur
 */
export interface IndicatorTopRisk {
  ifu: string;
  nom: string | null;
  risque: string | null;
  score: number | null;
  gap?: number | null;
}

/**
 * Réponse API pour la distribution d'un indicateur
 */
export interface IndicatorDistributionResponse {
  success: boolean;
  indicator: {
    id: string;
    risque_column: string;
    score_column: string | null;
    gap_column: string | null;
  };
  filters: {
    annee: string | null;
    structure: string | null;
  };
  distribution: IndicatorDistribution;
  score_stats: ScoreStats | null;
  gap_stats: GapStats | null;
  top_risks: IndicatorTopRisk[];
}

/**
 * Indicateur dans la liste
 */
export interface IndicatorListItem {
  id: string;
  name: string;
  has_score: boolean;
  has_gap: boolean;
  distribution: {
    rouge: number;
    jaune: number;
    vert: number;
  };
  total_evaluated: number;
}

/**
 * Réponse API pour la liste des indicateurs
 */
export interface IndicatorsListResponse {
  success: boolean;
  count: number;
  indicators: IndicatorListItem[];
}

/**
 * Paramètres pour la distribution d'un indicateur
 */
export interface IndicatorDistributionParams {
  annee?: number | string;
  structure?: string;
}

/**
 * Réponse de l'API pour la distribution globale des couleurs de risque
 */
export interface RiskColorsDistributionResponse {
  success: boolean;
  total_contribuables: number;
  total_indicators: number;
  global_distribution: {
    counts: Record<string, number>;
    percentages: Record<string, number>;
    total_evaluations: number;
  };
  unique_contribuables: {
    counts: Record<string, number>;
    percentages: Record<string, number>;
    description: string;
  };
  by_indicator: Record<string, {
    column: string;
    counts: Record<string, number>;
    total: number;
  }>;
}

// ========== SERVICE ==========

/**
 * Service de statistiques
 * Fournit des méthodes pour récupérer les statistiques et analyses
 */
export class StatService {
  /**
   * Récupère les statistiques globales des données de risque
   * 
   * @returns Promesse contenant les statistiques
   * @throws {Error} Si la requête échoue
   * 
   * @example
   * ```typescript
   * const stats = await StatService.getStats();
   * console.log(`Total contribuables: ${stats.stats.total_contribuables}`);
   * ```
   */
  static async getStats(): Promise<StatsResponse> {
    try {
      const response = await API.get<StatsResponse>("/stats");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw error;
    }
  }

  /**
   * Récupère un résumé détaillé des données de risque
   * Inclut des informations sur chaque colonne (type, valeurs nulles, etc.)
   * 
   * @returns Promesse contenant le résumé des données
   * @throws {Error} Si la requête échoue
   * 
   * @example
   * ```typescript
   * const summary = await StatService.getSummary();
   * console.log(`Total colonnes: ${summary.summary.total_columns}`);
   * ```
   */
  static async getSummary(): Promise<SummaryResponse> {
    try {
      const response = await API.get<SummaryResponse>("/stats/summary");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du résumé:", error);
      throw error;
    }
  }

  /**
   * Récupère les contribuables avec les scores de risque les plus élevés
   * 
   * @param params - Paramètres de la requête
   * @param params.limit - Nombre de résultats à retourner (défaut: 10, max: 100)
   * @param params.score_column - Colonne de score spécifique à utiliser (optionnel)
   * @returns Promesse contenant la liste des contribuables à risque
   * @throws {Error} Si la requête échoue
   * 
   * @example
   * ```typescript
   * // Récupérer les 20 contribuables les plus à risque
   * const topRisks = await StatService.getTopRisks({ limit: 20 });
   * 
   * // Utiliser une colonne de score spécifique
   * const topRisks = await StatService.getTopRisks({ 
   *   limit: 50, 
   *   score_column: 'SCORE_TOTAL_RISQUE' 
   * });
   * ```
   */
  static async getTopRisks(params?: TopRisksParams): Promise<TopRisksResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.limit !== undefined) {
        queryParams.append("limit", params.limit.toString());
      }
      
      if (params?.score_column) {
        queryParams.append("score_column", params.score_column);
      }

      const url = queryParams.toString() 
        ? `/stats/top-risks?${queryParams.toString()}` 
        : "/stats/top-risks";

      const response = await API.get<TopRisksResponse>(url);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des top risques:", error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques pour un score spécifique
   * 
   * @param scoreColumn - Nom de la colonne de score
   * @returns Statistiques du score ou null si non disponible
   * 
   * @example
   * ```typescript
   * const stats = await StatService.getStats();
   * const scoreStats = StatService.getScoreStats(stats, 'SCORE_TOTAL_RISQUE');
   * console.log(`Moyenne: ${scoreStats?.mean}`);
   * ```
   */
  static getScoreStats(
    statsResponse: StatsResponse,
    scoreColumn: string
  ): ScoreStatistics | null {
    return statsResponse.stats.score_statistics?.[scoreColumn] || null;
  }

  /**
   * Récupère la distribution pour un niveau de risque spécifique
   * 
   * @param statsResponse - Réponse contenant les statistiques
   * @param riskColumn - Nom de la colonne de niveau de risque
   * @returns Distribution des risques ou null si non disponible
   * 
   * @example
   * ```typescript
   * const stats = await StatService.getStats();
   * const distribution = StatService.getRiskDistribution(stats, 'NIVEAU_RISQUE');
   * console.log(distribution); // { "ÉLEVÉ": 150, "MOYEN": 300, "FAIBLE": 500 }
   * ```
   */
  static getRiskDistribution(
    statsResponse: StatsResponse,
    riskColumn: string
  ): RiskDistribution | null {
    return statsResponse.stats.risk_distribution?.[riskColumn] || null;
  }

  /**
   * Récupère les colonnes de score disponibles
   * 
   * @param statsResponse - Réponse contenant les statistiques
   * @returns Liste des noms de colonnes de score
   * 
   * @example
   * ```typescript
   * const stats = await StatService.getStats();
   * const scoreColumns = StatService.getAvailableScoreColumns(stats);
   * console.log(scoreColumns); // ['SCORE_TOTAL_RISQUE', 'SCORE_TVA', ...]
   * ```
   */
  static getAvailableScoreColumns(statsResponse: StatsResponse): string[] {
    return Object.keys(statsResponse.stats.score_statistics || {});
  }

  /**
   * Récupère les colonnes de niveau de risque disponibles
   * 
   * @param statsResponse - Réponse contenant les statistiques
   * @returns Liste des noms de colonnes de niveau de risque
   * 
   * @example
   * ```typescript
   * const stats = await StatService.getStats();
   * const riskColumns = StatService.getAvailableRiskColumns(stats);
   * console.log(riskColumns); // ['NIVEAU_RISQUE', 'RISK_LEVEL', ...]
   * ```
   */
  static getAvailableRiskColumns(statsResponse: StatsResponse): string[] {
    return Object.keys(statsResponse.stats.risk_distribution || {});
  }

  /**
   * Formatte une valeur numérique avec séparateurs de milliers
   * 
   * @param value - Valeur à formatter
   * @param decimals - Nombre de décimales (défaut: 2)
   * @returns Valeur formatée
   * 
   * @example
   * ```typescript
   * StatService.formatNumber(1234567.89); // "1 234 567,89"
   * StatService.formatNumber(1234.5, 0); // "1 235"
   * ```
   */
  static formatNumber(value: number | null, decimals: number = 2): string {
    if (value === null) return "N/A";
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  /**
   * Calcule le pourcentage d'une valeur par rapport à un total
   * 
   * @param value - Valeur
   * @param total - Total
   * @returns Pourcentage formaté
   * 
   * @example
   * ```typescript
   * StatService.calculatePercentage(25, 100); // "25,00%"
   * StatService.calculatePercentage(1, 3); // "33,33%"
   * ```
   */
  static calculatePercentage(value: number, total: number): string {
    if (total === 0) return "0,00%";
    const percentage = (value / total) * 100;
    return `${this.formatNumber(percentage)}%`;
  }

  /**
   * Récupère tous les indicateurs d'un contribuable spécifique
   * 
   * @param ifu - Numéro IFU du contribuable
   * @param annee - Année fiscale (optionnel)
   * @returns Promesse contenant les données du contribuable
   * @throws {Error} Si la requête échoue
   * 
   * @example
   * ```typescript
   * const contribuable = await StatService.getContribuableIndicators('00026786L');
   * console.log(`Score total: ${contribuable.contribuable.score_total}`);
   * ```
   */
  static async getContribuableIndicators(
    ifu: string,
    annee?: number
  ): Promise<ContribuableResponse> {
    try {
      const url = annee 
        ? `/stats/contribuable/${ifu}?annee=${annee}` 
        : `/stats/contribuable/${ifu}`;
      
      const response = await API.get<ContribuableResponse>(url);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du contribuable:", error);
      throw error;
    }
  }

  /**
   * Recherche des contribuables par IFU ou nom
   * 
   * @param query - Terme de recherche (min 2 caractères)
   * @param limit - Nombre max de résultats (défaut: 20)
   * @returns Promesse contenant les résultats de recherche
   * @throws {Error} Si la requête échoue
   * 
   * @example
   * ```typescript
   * const results = await StatService.searchContribuables('ELITE');
   * results.results.forEach(r => console.log(r.ifu, r.nom));
   * ```
   */
  static async searchContribuables(
    query: string,
    limit: number = 20
  ): Promise<SearchResponse> {
    try {
      const response = await API.get<SearchResponse>(
        `/stats/search?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      throw error;
    }
  }

  /**
   * Retourne la couleur associée à un niveau de risque
   * 
   * @param risque - Niveau de risque (rouge, jaune, vert)
   * @returns Code couleur hexadécimal
   */
  static getRiskColor(risque: string | null): string {
    const level = (risque || "").toLowerCase();
    switch (level) {
      case "rouge":
        return "#CE1126";
      case "jaune":
        return "#CE8E00";
      case "vert":
        return "#006B3F";
      default:
        return "#9E9E9E";
    }
  }

  /**
   * Retourne le label français pour un niveau de risque
   * 
   * @param risque - Niveau de risque
   * @returns Label formaté
   */
  static getRiskLabel(risque: string | null): string {
    const level = (risque || "").toLowerCase();
    switch (level) {
      case "rouge":
        return "Élevé";
      case "jaune":
        return "Moyen";
      case "vert":
        return "Faible";
      case "non disponible":
        return "N/D";
      default:
        return risque || "N/D";
    }
  }

  /**
   * Récupère la distribution des risques pour un indicateur spécifique
   * 
   * @param indicatorId - ID de l'indicateur (ex: "1", "IND_1", "2", etc.)
   * @param params - Paramètres optionnels (année, structure)
   * @returns Distribution des risques avec statistiques
   * 
   * @example
   * ```typescript
   * // Distribution pour l'indicateur 1
   * const dist = await StatService.getIndicatorDistribution('1');
   * console.log(`Rouge: ${dist.distribution.counts.rouge}`);
   * console.log(`Pourcentage rouge: ${dist.distribution.percentages.rouge}%`);
   * 
   * // Avec filtres
   * const dist2025 = await StatService.getIndicatorDistribution('1', { annee: 2025 });
   * ```
   */
  static async getIndicatorDistribution(
    indicatorId: string,
    params?: IndicatorDistributionParams
  ): Promise<IndicatorDistributionResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.annee !== undefined) {
        queryParams.append("annee", params.annee.toString());
      }

      if (params?.structure) {
        queryParams.append("structure", params.structure);
      }

      const url = queryParams.toString()
        ? `/stats/indicator/${indicatorId}?${queryParams.toString()}`
        : `/stats/indicator/${indicatorId}`;

      const response = await API.get<IndicatorDistributionResponse>(url);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'indicateur:", error);
      throw error;
    }
  }

  /**
   * Récupère la liste de tous les indicateurs disponibles
   * 
   * @returns Liste des indicateurs avec leurs distributions de base
   * 
   * @example
   * ```typescript
   * const indicators = await StatService.listIndicators();
   * indicators.indicators.forEach(ind => {
   *   console.log(`${ind.name}: ${ind.distribution.rouge} rouges`);
   * });
   * ```
   */
  static async listIndicators(): Promise<IndicatorsListResponse> {
    try {
      const response = await API.get<IndicatorsListResponse>("/stats/indicators");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des indicateurs:", error);
      throw error;
    }
  }

  /**
   * Calcule le pourcentage de risque pour une distribution
   * 
   * @param distribution - Distribution des risques
   * @param level - Niveau de risque ('rouge' | 'jaune' | 'vert')
   * @returns Pourcentage formaté
   */
  static getDistributionPercentage(
    distribution: IndicatorDistribution,
    level: "rouge" | "jaune" | "vert"
  ): string {
    const percentage = distribution.percentages[level] || 0;
    return `${percentage.toFixed(1)}%`;
  }

  /**
   * Retourne la couleur de fond pour un niveau de risque (version claire)
   * 
   * @param risque - Niveau de risque
   * @returns Code couleur hexadécimal avec opacité
   */
  static getRiskBackgroundColor(risque: string | null): string {
    const level = (risque || "").toLowerCase();
    switch (level) {
      case "rouge":
        return "rgba(206, 17, 38, 0.1)";
      case "jaune":
        return "rgba(206, 142, 0, 0.1)";
      case "vert":
        return "rgba(0, 107, 63, 0.1)";
      default:
        return "rgba(158, 158, 158, 0.1)";
    }
  }

  /**
   * Récupère la distribution globale des couleurs de risque (tous indicateurs)
   * @returns Distribution globale et unique par couleur
   */
  static async getRiskColorsDistribution(): Promise<RiskColorsDistributionResponse> {
    try {
      const response = await API.get<RiskColorsDistributionResponse>("/stats/risk-colors");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la distribution des couleurs:", error);
      throw error;
    }
  }
}

// ========== EXPORTS ==========

export default StatService;
