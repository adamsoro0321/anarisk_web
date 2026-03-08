/**
 * Service de gestion des contribuables
 * Gère toutes les requêtes API liées aux données spécifiques des contribuables
 */
import { API } from "./api";
import { type DGDData } from "../components/dgdComponent";

// ========== TYPES DONNÉES DOUANIÈRES ==========

/**
 * Résumé des données douanières
 */
export interface DouaneSummary {
  total_import_caf: number;
  total_export_caf: number;
  total_import_tva: number;
  nombre_annees: number;
}

/**
 * Réponse API pour les données douanières
 */
export interface DouaneResponse {
  success: boolean;
  ifu: string;
  count: number;
  data: DGDData[];
  message?: string;
}

// ========== TYPES DONNÉES INSD ==========

/**
 * Données INSD d'un contribuable pour une année
 * (Structure simplifiée - à adapter selon les besoins)
 */
export interface INSDData {
  Num_IFU_Contribuable: string;
  Numid: number | null;
  ANNEE: number;
  XB_CA_31_12_N_Net: number | null; // Chiffre d'affaires
  XG_RESULT_AO_31_12_N_Net: number | null; // Résultat d'exploitation
  XC_VALEUR_AJOUTEE_31_12_N_Net: number | null; // Valeur ajoutée
  XD_EXCED_BRUT_EXPL_31_12_N_Net: number | null; // Excédent brut d'exploitation
  RK_ChargDePersonnel_31_12_N_Net: number | null; // Charges de personnel
  AZ_TtlActifImmob_Exer31_12_N_Brut: number | null; // Total actif immobilisé
  BI_Clients_Exer31_12_N_Net: number | null; // Clients
  CP_TtlCptauxPropRessAssim_Exer31_12_N_Net: number | null; // Capitaux propres
  [key: string]: number | string | null | undefined; // Autres champs dynamiques
}

/**
 * Résumé des données INSD
 */
export interface INSDSummary {
  chiffre_affaire_total?: number;
  resultat_exploitation_total?: number;
  nombre_annees?: number;
}

/**
 * Réponse API pour les données INSD
 */
export interface INSDResponse {
  success: boolean;
  ifu: string;
  count: number;
  data: INSDData[];
  summary: INSDSummary;
  message?: string;
}

// ========== TYPES INDICATEURS ==========

/**
 * Un indicateur de risque pour une année donnée
 */
export interface IndicateurItem {
  indicateur: string;   // Nom original de la colonne, ex: "RISQUE_IND_1"
  risque: string | null; // "vert" | "jaune" | "orange" | "rouge" | "Non disponible"
  score: number | null;
  gap: number | null;
  ratio?: number | null;
  age_mois?: number | null;
}

/**
 * Données indicateurs pour une année
 */
export interface AnneeIndicateurs {
  annee: number | null;
  indicateurs: IndicateurItem[];
  nb_indicateurs: number;
}

/**
 * Comptage des niveaux de risque
 */
export interface RiskCounts {
  rouge: number;
  orange: number;
  jaune: number;
  vert: number;
  non_disponible: number;
}

/**
 * Informations de base du contribuable
 */
export interface ContribuableInfo {
  NUM_IFU?: string;
  NOM_MINEFID?: string;
  RAISON_SOCIALE?: string;
  ETAT?: string;
  CODE_SECT_ACT?: string;
  CODE_REG_FISC?: string;
  STRUCTURES?: string;
  REGIME_FISCALE?: string;
  SECTEUR_ACTIVITE?: string;
  FORME_JURIDIQUE?: string;
  DATE_DEBUT_ACTIVITE?: string;
  DATE_DERNIERE_VG?: string;
  DATE_DERNIERE_VP?: string;
  DATE_DERNIERE_AVIS?: string;
  [key: string]: string | undefined;
}

/**
 * Réponse API pour les indicateurs d'un contribuable
 */
export interface IndicateursResponse {
  success: boolean;
  ifu: string;
  contribuable: ContribuableInfo;
  score_total: number;
  risk_counts: RiskCounts;
  years_available: number[];
  annees: Record<string, AnneeIndicateurs>;
  nb_annees: number;
  nb_indicateurs_total: number;
  message?: string;
}

// ========== TYPES PROGRAMMES ==========

/**
 * Un programme de contrôle associé à un contribuable
 */
export interface ProgrammeItem {
  id: number;
  ifu: string;
  actif: boolean;
  brigade: string | null;
  quantume: string | null;
  date_creation: string | null;
}

/**
 * Réponse API pour les programmes d'un contribuable
 */
export interface ProgrammeResponse {
  success: boolean;
  ifu: string;
  count: number;
  data: ProgrammeItem[];
  quantumes_trouves: string[];
  message?: string;
}

export interface CreateProgrammeResponse {
  success: boolean;
  message: string;
  programme_id?: number;
}

// ========== SERVICE ==========

export class ContribuableService {
  /**
   * Récupère les données douanières d'un contribuable
   * 
   * @param ifu - Numéro IFU du contribuable
   * @returns Promesse contenant les données douanières
   * @throws {Error} Si la requête échoue
   * 
   * @example
   * ```typescript
   * const douanes = await ContribuableService.getDouaneData('00026786L');
   * console.log(`Total import: ${douanes.summary.total_import_caf}`);
   * ```
   */
  static async getDouaneData(ifu: string): Promise<DouaneResponse> {
    try {
      const response = await API.get<DouaneResponse>(`/contribuables/${ifu}/douanes`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des données douanières pour ${ifu}:`, error);
      throw error;
    }
  }

  /**
   * Récupère les données INSD (Institut National de la Statistique) d'un contribuable
   * 
   * @param ifu - Numéro IFU du contribuable
   * @returns Promesse contenant les données INSD
   * @throws {Error} Si la requête échoue
   * 
   * @example
   * ```typescript
   * const insd = await ContribuableService.getINSDData('00026786L');
   * console.log(`Chiffre d'affaires total: ${insd.summary.chiffre_affaire_total}`);
   * ```
   */
  static async getINSDData(ifu: string): Promise<INSDResponse> {
    try {
      const response = await API.get<INSDResponse>(`/contribuables/${ifu}/insd`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des données INSD pour ${ifu}:`, error);
      throw error;
    }
  }

  /**
   * Formate un montant en FCFA
   * 
   * @param amount - Montant à formater
   * @returns Montant formaté avec séparateur de milliers
   * 
   * @example
   * ```typescript
   * const formatted = ContribuableService.formatAmount(1234567.89);
   * console.log(formatted); // "1 234 567,89 FCFA"
   * ```
   */
  static formatAmount(amount: number | null | undefined): string {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount).replace('XOF', 'FCFA');
  }

  /**
   * Calcule le ratio import/export
   * 
   * @param importAmount - Montant des importations
   * @param exportAmount - Montant des exportations
   * @returns Ratio en pourcentage ou null si calcul impossible
   */
  static calculateImportExportRatio(
    importAmount: number | null,
    exportAmount: number | null
  ): number | null {
    if (!importAmount || !exportAmount || exportAmount === 0) {
      return null;
    }
    return (importAmount / exportAmount) * 100;
  }

  /**
   * Récupère toutes les données disponibles pour un contribuable
   * (douanes + INSD)
   * 
   * @param ifu - Numéro IFU du contribuable
   * @returns Promesse contenant toutes les données
   * 
   * @example
   * ```typescript
   * const allData = await ContribuableService.getAllData('00026786L');
   * console.log('Données douanières:', allData.douanes);
   * console.log('Données INSD:', allData.insd);
   * ```
   */
  static async getAllData(ifu: string): Promise<{
    douanes: DouaneResponse | null;
    insd: INSDResponse | null;
  }> {
    try {
      const [douanes, insd] = await Promise.allSettled([
        this.getDouaneData(ifu),
        this.getINSDData(ifu),
      ]);

      return {
        douanes: douanes.status === 'fulfilled' ? douanes.value : null,
        insd: insd.status === 'fulfilled' ? insd.value : null,
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération des données complètes pour ${ifu}:`, error);
      throw error;
    }
  }

  /**
   * Récupère les programmes de contrôle d'un contribuable
   *
   * @param ifu - Numéro IFU du contribuable
   * @param quantum - Filtre optionnel par quantum (libellé)
   * @returns Promesse contenant les programmes du contribuable
   * @throws {Error} Si la requête échoue
   *
   * @example
   * ```typescript
   * const programmes = await ContribuableService.getContribuableProgramme('00026786L');
   * // Avec filtre quantum :
   * const filtered = await ContribuableService.getContribuableProgramme('00026786L', 'Q1');
   * ```
   */
  static async getContribuableProgramme(
    ifu: string,
    quantum?: string
  ): Promise<ProgrammeResponse> {
    try {
      const url = quantum
        ? `/contribuables/${ifu}/programmes?quantum=${encodeURIComponent(quantum)}`
        : `/contribuables/${ifu}/programmes`;
      const response = await API.get<ProgrammeResponse>(url);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des programmes pour ${ifu}:`, error);
      throw error;
    }
  }

  static async createProgramme(
    ifu: string,
    brigade: string,
    quantume: string
  ): Promise<CreateProgrammeResponse> {
    try {
      const response = await API.post<CreateProgrammeResponse>('/contribuables/programmes', {
        ifu,
        brigade,
        quantume,
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la création du programme pour ${ifu}:`, error);
      throw error;
    }
  }

  static async getContribuableIndicators(
    ifu: string,
    annee?: number
  ): Promise<IndicateursResponse> {
    try {
      const url = annee
        ? `/contribuables/${ifu}/indicateurs?annee=${annee}`
        : `/contribuables/${ifu}/indicateurs`;
      const response = await API.get<IndicateursResponse>(url);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des indicateurs pour ${ifu}:`, error);
      throw error;
    }
  }
}

export default ContribuableService;
