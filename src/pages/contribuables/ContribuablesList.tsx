import { 
  Box, 
  Typography, 
  Paper, 
  alpha, 
  CircularProgress, 
  Chip,
  Alert,
  Button,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  TextField,
  Slider
} from "@mui/material";
import { 
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  ViewComfy as ViewComfyIcon,
  ViewColumn as ViewColumnIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Layers as LayersIcon,
  CloudDownload as CloudDownloadIcon,
  ExpandMore as ExpandMoreIcon,
  TableView as TableViewIcon,
  PivotTableChart as PivotTableChartIcon,
  BarChart as BarChartIcon
} from "@mui/icons-material";
import { useEffect, useState, useMemo, useCallback } from "react";
// @ts-expect-error - API.js n'a pas de déclaration TypeScript
import { API } from "../../api/API.js";
import QuantumeService, { type QuantumeItem } from "../../services/quantume.service";
import { 
  DataGrid,
  useGridApiContext
} from '@mui/x-data-grid';
import { frFR } from '@mui/x-data-grid/locales';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import * as FlexmonsterReact from 'react-flexmonster';
import 'flexmonster/flexmonster.css';
import { Bar,  Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler
} from 'chart.js';
import ContribuableDetailModal from "../../components/modals/ContribuableDetailModal.js";

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend,
  Filler
); 
// Palette DGI Burkina Faso
const dgiColors = {
  primary: { main: "#006B3F", light: "#2E8B57", dark: "#004D2C" },
  accent: { main: "#CE8E00", light: "#E6A817" },
  secondary: { main: "#CE1126", light: "#E53945" },
  neutral: { 50: "#FAFAFA", 100: "#F5F5F5", 200: "#EEEEEE", 500: "#9E9E9E", 700: "#616161", 900: "#212121" },
};

// Type pour les données de risque basé sur COLON_RISK_TABLE
interface RiskDataRow {
  id: number | string;
  NUM_IFU: string;
  ANNEE: number;
  CODE_STRUCTURE: string;
  LIBELLE_STRUCTURE: string;
  RAISON_SOCIALE: string;
  PERIODE_FISCALE: string;
  ETAT: string;
  REGIME_FISCALE: string;
  DATE_DEBUT_ACTIVITE: string;
  SECTEUR_ACTIVITE: string;
  TYPE_CONTROLE: string;
  FORME_JURIDIQUE: string;
  // Indicateurs de risque
  RISQUE_IND_1?: number;
  GAP_IND_1?: number;
  SCORE_IND_1?: number;
  RISQUE_IND_2?: number;
  GAP_IND_2?: number;
  SCORE_IND_2?: number;
  [key: string]: unknown;
}

// Composant pour afficher le risque avec 4 niveaux possibles
const RiskIndicatorCell = ({ value }: { value: number | string | boolean | undefined }) => {
  const normalizedValue = String(value || '').toLowerCase().trim();
  
  // Déterminer le type de risque
  let riskType: 'rouge' | 'jaune' | 'vert' | 'non-disponible';
  let label: string;
  let bgColor: string;
  let textColor: string;
  let icon: React.ReactNode;
  
  if (normalizedValue === 'rouge' || normalizedValue === 'red') {
    riskType = 'rouge';
    label = 'Risque élevé';
    bgColor = alpha(dgiColors.secondary.main, 0.5);
    textColor = dgiColors.secondary.main;
    icon = <WarningIcon fontSize="small" />;
  } else if (normalizedValue === 'jaune' || normalizedValue === 'yellow') {
    riskType = 'jaune';
    label = 'Risque moyen';
    bgColor = alpha(dgiColors.accent.main, 0.5);
    textColor = dgiColors.accent.main;
    icon = <WarningIcon fontSize="small" />;
  } else if (normalizedValue === 'vert' || normalizedValue === 'green') {
    riskType = 'vert';
    label = 'Conforme';
    bgColor = alpha(dgiColors.primary.main, 0.5);
    textColor = dgiColors.primary.main;
    icon = <CheckCircleIcon fontSize="small" />;
  } else {
    riskType = 'non-disponible';
    label = 'Non disponible';
    bgColor = alpha(dgiColors.neutral[500], 0.1);
    textColor = dgiColors.neutral[700];
    icon = null;
  }
  
  return (
    <div style={{ backgroundColor: bgColor, borderRadius: '4px', padding: '2px' }}>
      <Chip
        size="small"
        label={label}
        icon={icon}
        sx={{
          backgroundColor: 'transparent',
          color: textColor,
          fontWeight: 600,
          fontSize: '0.7rem',
          '& .MuiChip-icon': { color: textColor }
        }}
      />
    </div>
  );
};

// Composant pour afficher le score
const ScoreCell = ({ value }: { value: number | undefined }) => {
  if (value === undefined || value === null) return <Typography variant="body2" color="textSecondary">-</Typography>;
  
  const getColor = () => {
    if (value >= 70) return dgiColors.secondary.main;
    if (value >= 40) return dgiColors.accent.main;
    return dgiColors.primary.main;
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 50, height: 6, borderRadius: 3, backgroundColor: dgiColors.neutral[200], overflow: 'hidden' }}>
        <Box sx={{ width: `${Math.min(value, 100)}%`, height: '100%', backgroundColor: getColor(), borderRadius: 3 }} />
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600, color: getColor(), fontSize: '0.75rem' }}>
        {value?.toFixed(0)}
      </Typography>
    </Box>
  );
};

// Composant pour afficher le GAP (montant)
const GapCell = ({ value }: { value: number | undefined }) => {
  if (value === undefined || value === null) return <Typography variant="body2" color="textSecondary">-</Typography>;
  
  const formatted = new Intl.NumberFormat('fr-FR', { style: 'decimal', maximumFractionDigits: 0 }).format(value);
  const isNegative = value < 0;
  
  return (
    <Typography 
      variant="body2" 
      sx={{ 
        fontWeight: 500, 
        color: isNegative ? dgiColors.secondary.main : dgiColors.neutral[900],
        fontSize: '0.8rem'
      }}
    >
      {formatted} FCFA
    </Typography>
  );
};

// Bouton de colonnes personnalisé
const CustomColumnsButton = () => {
  const apiRef = useGridApiContext();

  const handleClick = () => {
    apiRef.current.showPreferences('columns');
  };

  return (
    <Button
      size="small"
      startIcon={<ViewColumnIcon />}
      onClick={handleClick}
      sx={{
        color: '#fff !important',
        fontWeight: 600,
        '& .MuiButton-startIcon': {
          color: '#fff !important',
        },
        '& svg': {
          color: '#fff !important',
        },
        '&:hover': {
          backgroundColor: alpha('#fff', 0.1),
        },
      }}
    >
      Colonnes
    </Button>
  );
};

// Bouton de filtres personnalisé
const CustomFiltersButton = () => {
  const apiRef = useGridApiContext();

  const handleClick = () => {
    apiRef.current.showPreferences('filters');
  };

  return (
    <Button
      size="small"
      startIcon={<FilterListIcon />}
      onClick={handleClick}
      sx={{
        color: '#fff !important',
        fontWeight: 600,
        '& .MuiButton-startIcon': {
          color: '#fff !important',
        },
        '& svg': {
          color: '#fff !important',
        },
        '&:hover': {
          backgroundColor: alpha('#fff', 0.1),
        },
      }}
    >
      Filtres
    </Button>
  );
};

// Bouton d'export CSV personnalisé
const CustomExportButton = () => {
  const apiRef = useGridApiContext();

  const handleExport = () => {
    apiRef.current.exportDataAsCsv({
      fileName: `contribuables-risques-${new Date().toISOString().split('T')[0]}`,
      utf8WithBom: true
    });
  };

  return (
    <Button
      size="small"
      startIcon={<FileDownloadIcon />}
      onClick={handleExport}
      sx={{
        color: '#fff !important',
        fontWeight: 600,
        '& .MuiButton-startIcon': {
          color: '#fff !important',
        },
        '& svg': {
          color: '#fff !important',
        },
        '&:hover': {
          backgroundColor: alpha('#fff', 0.1),
        },
      }}
    >
      Export
    </Button>
  );
};

// Bouton de densité personnalisé
const CustomDensityButton = () => {
  const apiRef = useGridApiContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDensityChange = (density: 'compact' | 'standard' | 'comfortable') => {
    apiRef.current.setDensity(density);
    handleClose();
  };

  return (
    <>
      <Button
        size="small"
        startIcon={<ViewComfyIcon />}
        onClick={handleClick}
        sx={{
          color: '#fff !important',
          fontWeight: 600,
          '& .MuiButton-startIcon': {
            color: '#fff !important',
          },
          '& svg': {
            color: '#fff !important',
          },
          '&:hover': {
            backgroundColor: alpha('#fff', 0.1),
          },
        }}
      >
        Densité
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleDensityChange('compact')}>Compact</MenuItem>
        <MenuItem onClick={() => handleDensityChange('standard')}>Standard</MenuItem>
        <MenuItem onClick={() => handleDensityChange('comfortable')}>Confortable</MenuItem>
      </Menu>
    </>
  );
};

// Bouton d'impression personnalisé
const CustomPrintButton = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      size="small"
      startIcon={<PrintIcon />}
      onClick={handlePrint}
      sx={{
        color: '#fff !important',
        fontWeight: 600,
        '& .MuiButton-startIcon': {
          color: '#fff !important',
        },
        '& svg': {
          color: '#fff !important',
        },
        '&:hover': {
          backgroundColor: alpha('#fff', 0.1),
        },
      }}
    >
      Imprimer
    </Button>
  );
};

// Toolbar personnalisé avec style DGI
const CustomToolbar = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: alpha(dgiColors.primary.main, 0.9),
        borderBottom: `2px solid ${dgiColors.primary.main}`,
        color: '#fff',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 4,
            height: 24,
            backgroundColor: dgiColors.primary.main,
            borderRadius: 1,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#fff',
            fontSize: '1rem',
          }}
        >
          Analyse des Risques - Contribuables
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <CustomColumnsButton />
        <CustomFiltersButton />
        <CustomDensityButton />
        <CustomPrintButton />
        <CustomExportButton />
      </Box>
    </Box>
  );
};

const ContribuablesList = () => {
  const [riskData, setRiskData] = useState<RiskDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quantume, setQuantume] = useState<QuantumeItem[]>([]);
  const [selectedQuantume, setSelectedQuantume] = useState<number | string>('');
  const [loadingQuantume, setLoadingQuantume] = useState(false);
  const [downloadingQuantume, setDownloadingQuantume] = useState(false);
  
  // États pour les tabs
  const [currentTab, setCurrentTab] = useState(0);
  
  // États pour les filtres avancés
  const [selectedIndicators, setSelectedIndicators] = useState<number[]>([]);
  const [scoreRange, setScoreRange] = useState<number[]>([0, 100]);
  const [selectedRegimes, setSelectedRegimes] = useState<string[]>([]);
  const [selectedStructures, setSelectedStructures] = useState<string[]>([]);

  
  // États pour les notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // État pour la pagination serveur
  const [paginationModel, setPaginationModel] = useState({
    page: 0, // MUI DataGrid utilise un index 0-based
    pageSize: 25,
  });
  const [rowCount, setRowCount] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState<{
    current_page: number;
    per_page: number;
    total_records: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  } | null>(null);

  // États pour le modal de détails du contribuable
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIFU, setSelectedIFU] = useState<string>('');

  // Fonctions pour gérer le modal
  const handleOpenModal = (numIFU: string) => {
    setSelectedIFU(numIFU);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedIFU('');
  };

  // Fonction pour récupérer les données de risque avec pagination
const fetchRiskData = useCallback(async (page: number, pageSize: number) => {
  setLoading(true);
  setError(null);
  try {
    // Récupérer le libellé du quantum sélectionné
    const quantumeLibelle = selectedQuantume 
      ? quantume.find(q => q.id === selectedQuantume)?.libelle 
      : '';
    
    // Construire l'URL avec le paramètre libelle_quantume si un quantum est sélectionné
    let url = `/risk-data?page=${page + 1}&per_page=${pageSize}`;
    if (quantumeLibelle) {
      url += `&libelle_quantume=${encodeURIComponent(quantumeLibelle)}`;
    }
    
    const response = await API.get(url);
      if (response?.status === 200 && response?.data) {
      // Parser la réponse
      const data: RiskDataRow[] = response.data?.data.map((item: any, index: number) => ({
        id: (page * pageSize) + index + 1, // ID unique basé sur la pagination
        ...item
      }));
      setRiskData(data);
      
      // Stocker les informations de pagination
      if (response.data?.pagination) {
        setPaginationInfo(response.data.pagination);
        setRowCount(response.data.pagination.total_records);
      }
      
      setError(null);
      console.log("data", data);
      console.log("pagination", response.data?.pagination);

} else {
      setError(`Erreur HTTP: ${response?.status || 'Pas de réponse'}`);
      setRiskData([]);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion au serveur';
    console.error('Erreur lors de la récupération des données de risque:', err);
    setError(errorMessage);
    setRiskData([]);
  } finally {
    setLoading(false);
  }
}, [selectedQuantume, quantume]);

// Fonction pour récupérer la liste des quantumes
const fetchQuantume = useCallback(async () => {
  setLoadingQuantume(true);
  try {
    const response = await QuantumeService.getAll();
    if (response.success && response.data) {
      setQuantume(response.data);
    }
  } catch (err) {
    console.error('Erreur lors de la récupération des quantumes:', err);
  } finally {
    setLoadingQuantume(false);
  }
}, []);

// Fonction pour télécharger les données du quantum sélectionné
const handleDownloadRiskData = useCallback(async (quantumeId: number | string) => {
  if (!quantumeId) return;
  
  setDownloadingQuantume(true);
  try {
    // Récupérer le libellé du quantum
    const quantumeItem = quantume.find(q => q.id === quantumeId);
    if (!quantumeItem) {
      setSnackbar({
        open: true,
        message: 'Quantum non trouvé',
        severity: 'error',
      });
      return;
    }
    
    const libelleQuantume = quantumeItem.libelle;
    const url = `/risk-data/download/${encodeURIComponent(libelleQuantume)}`;
    
    // Appel à l'API avec responseType blob pour télécharger le fichier
    const response = await API.get(url, {
      responseType: 'blob'
    });
    
    // Créer un lien de téléchargement
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${libelleQuantume}_risk_data.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    setSnackbar({
      open: true,
      message: `Données du quantum "${libelleQuantume}" téléchargées avec succès`,
      severity: 'success',
    });
  } catch (err: any) {
    console.error('Erreur lors du téléchargement des données de risque:', err);
    const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du téléchargement des données';
    setSnackbar({
      open: true,
      message: errorMessage,
      severity: 'error',
    });
  } finally {
    setDownloadingQuantume(false);
  }
}, [quantume]); 

  // Charger les quantumes au montage du composant
  useEffect(() => {
    fetchQuantume();
  }, [fetchQuantume]);

  // Charger les données quand la pagination change OU quand le quantum sélectionné change
  useEffect(() => {
    fetchRiskData(paginationModel.page, paginationModel.pageSize);
  }, [fetchRiskData, paginationModel.page, paginationModel.pageSize]);
  
  // Réinitialiser la pagination quand on change de quantum
  useEffect(() => {
    if (selectedQuantume) {
      setPaginationModel(prev => ({ page: 0, pageSize: prev.pageSize }));
    }
  }, [selectedQuantume]);

  // Gérer le changement de pagination
  const handlePaginationModelChange = (newModel: { page: number; pageSize: number }) => {
    setPaginationModel(newModel);
  };
  
  // Gérer le changement de tab
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };
  
  // Liste des indicateurs disponibles pour les filtres
  const availableIndicators = [1, 2, 3, 4, 5, 8, 12, 13, 14, 16, 20, 27, 38, 39, 46, 47, 49, 57, 58];
  
  // Extraire les régimes et structures uniques pour les filtres
  const uniqueRegimes = useMemo(() => {
    return Array.from(new Set(riskData.map(r => r.CODE_REG_FISC).filter(Boolean)));
  }, [riskData]);
  
  const uniqueStructures = useMemo(() => {
    return Array.from(new Set(riskData.map(r => r.STRUCTURES).filter(Boolean)));
  }, [riskData]);
  
  // Configuration Flexmonster pour l'analyse pivot
  const flexmonsterData = useMemo(() => {
    return riskData.map(row => ({
      'N° IFU': row.NUM_IFU,
      'Raison Sociale': row.NOM_MINEFID,
      'Année': row.ANNEE_FISCAL,
      'Structure': row.STRUCTURES,
      'Régime': row.CODE_REG_FISC,
      'Secteur': row.CODE_SECT_ACT,
      'État': row.ETAT,
      // Indicateurs de risque principaux
      'Risque Ind.1': row.RISQUE_IND_1,
      'Score Ind.1': row.SCORE_IND_1,
      'GAP Ind.1': row.GAP_IND_1,
      'Risque Ind.2': row.RISQUE_IND_2,
      'Score Ind.2': row.SCORE_IND_2,
      'GAP Ind.2': row.GAP_IND_2,
      'Risque Ind.3': row.RISQUE_IND_3,
      'Score Ind.3': row.SCORE_IND_3,
      'Risque Ind.4': row.RISQUE_IND_4,
      'Score Ind.4': row.SCORE_IND_4,
      'Risque Ind.5': row.RISQUE_IND_5,
      'Score Ind.5': row.SCORE_IND_5,
      'Risque Ind.8': row.RISQUE_IND_8,
      'Score Ind.8': row.SCORE_IND_8,
      'Risque Ind.12': row.RISQUE_IND_12,
      'Score Ind.12': row.SCORE_IND_12,
      'Risque Ind.13': row.RISQUE_IND_13,
      'Score Ind.13': row.SCORE_IND_13,
      'Risque Ind.14': row.RISQUE_IND_14,
      'Score Ind.14': row.SCORE_IND_14,
      'Risque Ind.16': row.RISQUE_IND_16,
      'Score Ind.16': row.SCORE_IND_16,
      'Risque Ind.20': row.RISQUE_IND_20,
      'Score Ind.20': row.SCORE_IND_20,
      'Risque Ind.27': row.RISQUE_IND_27,
      'Score Ind.27': row.SCORE_IND_27,
    }));
  }, [riskData]);

  const flexmonsterReport = useMemo(() => ({
    dataSource: {
      data: flexmonsterData
    },
    slice: {
      rows: [
        { uniqueName: 'Régime' },
        { uniqueName: 'Structure' }
      ],
      columns: [
        { uniqueName: 'Année' },
        { uniqueName: 'Measures' }
      ],
      measures: [
        { uniqueName: 'Score Ind.1', aggregation: 'average', format: 'currency' },
        { uniqueName: 'Score Ind.2', aggregation: 'average', format: 'currency' },
        { uniqueName: 'GAP Ind.1', aggregation: 'sum', format: 'currency' },
        { uniqueName: 'GAP Ind.2', aggregation: 'sum', format: 'currency' }
      ]
    },
    options: {
      grid: {
        type: 'classic',
        showTotals: true,
        showGrandTotals: 'on'
      },
      configuratorActive: true,
      configuratorButton: true,
      showAggregations: true,
      showCalculatedValuesButton: true,
      drillThrough: true
    },
    formats: [
      {
        name: 'currency',
        decimalPlaces: 2,
        decimalSeparator: ',',
        thousandsSeparator: ' ',
        currencySymbol: 'FCFA',
        currencySymbolAlign: 'right'
      }
    ]
  }), [flexmonsterData]);
  
  // Calculer les statistiques pour le dashboard
  const dashboardStats = useMemo(() => {
    const totalContribuables = riskData.length;
    const withRisk1 = riskData.filter(r => r.RISQUE_IND_1 === 1).length;
    const withRisk2 = riskData.filter(r => r.RISQUE_IND_2 === 1).length;
    const avgScore1 = riskData.reduce((sum, r) => sum + (r.SCORE_IND_1 || 0), 0) / totalContribuables || 0;
    const avgScore2 = riskData.reduce((sum, r) => sum + (r.SCORE_IND_2 || 0), 0) / totalContribuables || 0;
    const totalGap1 = riskData.reduce((sum, r) => sum + (r.GAP_IND_1 || 0), 0);
    const totalGap2 = riskData.reduce((sum, r) => sum + (r.GAP_IND_2 || 0), 0);
    
    // Répartition par régime
    const regimeDistribution = riskData.reduce((acc: any, r) => {
      const regime = r.CODE_REG_FISC || 'Non défini';
      acc[regime] = (acc[regime] || 0) + 1;
      return acc;
    }, {});
    
    // Répartition par structure
    const structureDistribution = riskData.reduce((acc: any, r) => {
      const structure = r.STRUCTURES || 'Non défini';
      acc[structure] = (acc[structure] || 0) + 1;
      return acc;
    }, {});
    
    // Top contributeurs à risque
    const topRiskyContribuables = [...riskData]
      .filter(r => r.RISQUE_IND_1 === 1 || r.RISQUE_IND_2 === 1)
      .sort((a, b) => {
        const scoreA = (a.SCORE_IND_1 || 0) + (a.SCORE_IND_2 || 0);
        const scoreB = (b.SCORE_IND_1 || 0) + (b.SCORE_IND_2 || 0);
        return scoreB - scoreA;
      })
      .slice(0, 10);
    
    return {
      totalContribuables,
      withRisk1,
      withRisk2,
      avgScore1,
      avgScore2,
      totalGap1,
      totalGap2,
      regimeDistribution,
      structureDistribution,
      topRiskyContribuables,
      riskPercentage1: (withRisk1 / totalContribuables) * 100,
      riskPercentage2: (withRisk2 / totalContribuables) * 100
    };
  }, [riskData]);
  
  // Couleurs pour les PieCharts
  const CHART_COLORS = [
    dgiColors.primary.main,
    dgiColors.secondary.light,  // Rouge plus clair
    dgiColors.accent.main,
    '#2563EB',
    '#7C3AED',
    '#EC4899',
    '#F59E0B',
    '#10B981'
  ];

  // Données pour les graphiques Chart.js
  const chartsData = useMemo(() => {
    // 1. Scores moyens par indicateur (Bar)
    const indicatorScoresData = {
      labels: ['Ind.1', 'Ind.2', 'Ind.3', 'Ind.4', 'Ind.5'],
      datasets: [{
        label: 'Score Moyen',
        data: [
          dashboardStats.avgScore1,
          dashboardStats.avgScore2,
          riskData.reduce((sum, r) => sum + (r.SCORE_IND_3 || 0), 0) / riskData.length || 0,
          riskData.reduce((sum, r) => sum + (r.SCORE_IND_4 || 0), 0) / riskData.length || 0,
          riskData.reduce((sum, r) => sum + (r.SCORE_IND_5 || 0), 0) / riskData.length || 0
        ],
        backgroundColor: [
          alpha(dgiColors.secondary.light, 0.7),  // Rouge plus clair
          alpha(dgiColors.accent.main, 0.7),
          alpha(dgiColors.primary.light, 0.7),
          alpha('#2563EB', 0.7),
          alpha('#7C3AED', 0.7)
        ],
        borderColor: [
          dgiColors.secondary.light,  // Rouge plus clair
          dgiColors.accent.main,
          dgiColors.primary.light,
          '#2563EB',
          '#7C3AED'
        ],
        borderWidth: 2
      }]
    };

    // 2. Répartition par régime (Pie)
    const regimeEntries = Object.entries(dashboardStats.regimeDistribution)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 6);
    
    const regimeData = {
      labels: regimeEntries.map(([regime]) => regime),
      datasets: [{
        label: 'Contribuables',
        data: regimeEntries.map(([, count]) => count as number),
        backgroundColor: CHART_COLORS.map(color => alpha(color, 0.7)),
        borderColor: CHART_COLORS,
        borderWidth: 2
      }]
    };

    // 3. GAP par indicateur (Bar)
    const gapData = {
      labels: ['Ind.1', 'Ind.2', 'Ind.3', 'Ind.4', 'Ind.5', 'Ind.8'],
      datasets: [{
        label: 'GAP (Millions FCFA)',
        data: [
          dashboardStats.totalGap1 / 1000000,
          dashboardStats.totalGap2 / 1000000,
          riskData.reduce((sum, r) => sum + (r.GAP_IND_3 || 0), 0) / 1000000,
          riskData.reduce((sum, r) => sum + (r.GAP_IND_4 || 0), 0) / 1000000,
          riskData.reduce((sum, r) => sum + (r.GAP_IND_5 || 0), 0) / 1000000,
          riskData.reduce((sum, r) => sum + (r.GAP_IND_8 || 0), 0) / 1000000
        ],
        backgroundColor: alpha(dgiColors.secondary.light, 0.5),  // Rouge plus clair
        borderColor: dgiColors.secondary.light,  // Rouge plus clair
        borderWidth: 2,
        fill: true
      }]
    };

    // 4. Distribution des scores (Line)
    const scoreDistData = {
      labels: ['0-20', '20-40', '40-60', '60-80', '80-100', '100+'],
      datasets: [{
        label: 'Nombre de contribuables',
        data: [
          riskData.filter(r => {
            const score = (r.SCORE_IND_1 || 0) + (r.SCORE_IND_2 || 0);
            return score >= 0 && score < 20;
          }).length,
          riskData.filter(r => {
            const score = (r.SCORE_IND_1 || 0) + (r.SCORE_IND_2 || 0);
            return score >= 20 && score < 40;
          }).length,
          riskData.filter(r => {
            const score = (r.SCORE_IND_1 || 0) + (r.SCORE_IND_2 || 0);
            return score >= 40 && score < 60;
          }).length,
          riskData.filter(r => {
            const score = (r.SCORE_IND_1 || 0) + (r.SCORE_IND_2 || 0);
            return score >= 60 && score < 80;
          }).length,
          riskData.filter(r => {
            const score = (r.SCORE_IND_1 || 0) + (r.SCORE_IND_2 || 0);
            return score >= 80 && score <= 100;
          }).length,
          riskData.filter(r => {
            const score = (r.SCORE_IND_1 || 0) + (r.SCORE_IND_2 || 0);
            return score > 100;
          }).length
        ],
        borderColor: dgiColors.accent.main,
        backgroundColor: alpha(dgiColors.accent.main, 0.1),
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: dgiColors.accent.main,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    };

    // 5. Contribuables à risque par structure (Bar empilé)
    const structureEntries = Object.entries(dashboardStats.structureDistribution)
      .map(([structure, total]) => {
        const withRisk = riskData.filter(r => 
          r.STRUCTURES === structure && (r.RISQUE_IND_1 === 1 || r.RISQUE_IND_2 === 1)
        ).length;
        return {
          structure,
          total: total as number,
          withRisk,
          withoutRisk: (total as number) - withRisk
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    const structureData = {
      labels: structureEntries.map(e => e.structure),
      datasets: [
        {
          label: 'Avec Risque',
          data: structureEntries.map(e => e.withRisk),
          backgroundColor: alpha(dgiColors.secondary.light, 0.7),  // Rouge plus clair
          borderColor: dgiColors.secondary.light,  // Rouge plus clair
          borderWidth: 2
        },
        {
          label: 'Sans Risque',
          data: structureEntries.map(e => e.withoutRisk),
          backgroundColor: alpha(dgiColors.primary.main, 0.7),
          borderColor: dgiColors.primary.main,
          borderWidth: 2
        }
      ]
    };

    // Stats pour insights
    const maxScoreRange = scoreDistData.labels[
      scoreDistData.datasets[0].data.indexOf(Math.max(...scoreDistData.datasets[0].data))
    ];
    
    const maxGapIndex = gapData.datasets[0].data.indexOf(Math.max(...gapData.datasets[0].data));
    const maxGapIndicator = gapData.labels[maxGapIndex];
    const maxGapValue = gapData.datasets[0].data[maxGapIndex];

    return {
      indicatorScoresData,
      regimeData,
      gapData,
      scoreDistData,
      structureData,
      insights: {
        maxScoreRange,
        maxGapIndicator,
        maxGapValue,
        topStructure: structureEntries[0]?.structure || 'N/A',
        topStructureRisk: structureEntries[0]?.withRisk || 0
      }
    };
  }, [dashboardStats, riskData, CHART_COLORS]);
  
  // Fermer le snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };



  // Colonnes Risk Global - Toutes les colonnes
  const allColumns: GridColDef[] = useMemo(() => [
    // Informations contribuable
    { field: 'NUM_IFU', headerName: 'N° IFU', width: 120, renderCell: (params: GridRenderCellParams) => (
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: 600, 
          color: dgiColors.primary.main, 
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline',
            opacity: 0.8
          }
        }}  
        onClick={() => handleOpenModal(params.value as string)}
      >
        {params.value}
      </Typography>
    )},
    { field: 'NOM_MINEFID', headerName: 'Raison Sociale', width: 180 },
    { field: 'ANNEE_FISCAL', headerName: 'Année', width: 70 },
    { field: 'STRUCTURES', headerName: 'Structure', width: 80 },
    //{ field: 'LIBELLE_STRUCTURE', headerName: 'LIBELLE STRUCTURE', width: 150 },
    { field: 'CODE_REG_FISC', headerName: 'Régime', width: 30,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" sx={{ backgroundColor: alpha(dgiColors.primary.main, 0.1), color: dgiColors.primary.main, fontWeight: 500, fontSize: '0.7rem' }} />
      )
    },
    //{ field: 'FORME_JURIDIQUE', headerName: 'Forme Jur.', width: 80 },
    { field: 'CODE_SECT_ACT', headerName: 'Secteur', width: 130 },
    { field: 'ETAT', headerName: 'État',
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" sx={{
          backgroundColor: params.value === 'ACTIF' ? alpha(dgiColors.primary.main, 0.1) : alpha(dgiColors.secondary.main, 0.1),
          color: params.value === 'ACTIF' ? dgiColors.primary.main : dgiColors.secondary.main,
          fontSize: '0.7rem'
        }} />
      )
    },
  /*  { field: 'TYPE_CONTROLE', headerName: 'Type Contrôle', width: 110 },
    { field: 'DATE_DEBUT_ACTIVITE', headerName: 'Début Act.', width: 100 },
    { field: 'PERIODE_FISCALE', headerName: 'Période', width: 80 },*/
    // Indicateurs TVA - Indicateur 1
    { field: 'RISQUE_IND_1', headerName: 'R.Ind1', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_1', headerName: 'GAP.1', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_1', headerName: 'S.1', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 2
    { field: 'RISQUE_IND_2', headerName: 'R.Ind2', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_2', headerName: 'GAP.2', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_2', headerName: 'S.2', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 3
    { field: 'RISQUE_IND_3', headerName: 'R.Ind3', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_3', headerName: 'GAP.3', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_3', headerName: 'S.3', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 4
    { field: 'RISQUE_IND_4', headerName: 'R.Ind4', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_4', headerName: 'GAP.4', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_4', headerName: 'S.4', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 5
    { field: 'RISQUE_IND_5', headerName: 'R.Ind5', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_5', headerName: 'GAP.5', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_5', headerName: 'S.5', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 8
    { field: 'RISQUE_IND_8', headerName: 'R.Ind8', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_8', headerName: 'GAP.8', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_8', headerName: 'S.8', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 12
    { field: 'RISQUE_IND_12', headerName: 'R.Ind12', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_12', headerName: 'GAP.12', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_12', headerName: 'S.12', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 13
    { field: 'RISQUE_IND_13', headerName: 'R.Ind13', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_13', headerName: 'GAP.13', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_13', headerName: 'S.13', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 14
    { field: 'RISQUE_IND_14', headerName: 'R.Ind14', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_14', headerName: 'GAP.14', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_14', headerName: 'S.14', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 15_A
    { field: 'RISQUE_IND_15_A', headerName: 'R.15A', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_15_A', headerName: 'GAP.15A', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_15_A', headerName: 'S.15A', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 15_B
    { field: 'RISQUE_IND_15_B', headerName: 'R.15B', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_15_B', headerName: 'GAP.15B', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_15_B', headerName: 'S.15B', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 16
    { field: 'RISQUE_IND_16', headerName: 'R.Ind16', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_16', headerName: 'GAP.16', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_16', headerName: 'S.16', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 20
    { field: 'RISQUE_IND_20', headerName: 'R.Ind20', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_20', headerName: 'GAP.20', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_20', headerName: 'S.20', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 27
    { field: 'RISQUE_IND_27', headerName: 'R.Ind27', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_27', headerName: 'GAP.27', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_27', headerName: 'S.27', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 38
    { field: 'RISQUE_IND_38', headerName: 'R.Ind38', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_38', headerName: 'GAP.38', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_38', headerName: 'S.38', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 39
   { field: 'RISQUE_IND_39', headerName: 'R.Ind39', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_39', headerName: 'GAP.39', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_39', headerName: 'S.39', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 46
    { field: 'RISQUE_IND_46', headerName: 'R.Ind46', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_46', headerName: 'GAP.46', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_46', headerName: 'S.46', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 47
    { field: 'RISQUE_IND_47', headerName: 'R.Ind47', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_47', headerName: 'GAP.47', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_47', headerName: 'S.47', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 49
    { field: 'RISQUE_IND_49', headerName: 'R.Ind49', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_49', headerName: 'GAP.49', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_49', headerName: 'S.49', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 57
    { field: 'RISQUE_IND_57', headerName: 'R.Ind57', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_57', headerName: 'GAP.57', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_57', headerName: 'S.57', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
    // Indicateur 58
    { field: 'RISQUE_IND_58', headerName: 'R.Ind58', width: 200, renderCell: (params: GridRenderCellParams) => <RiskIndicatorCell value={params.value} /> },
    { field: 'GAP_IND_58', headerName: 'GAP.58', width: 110, renderCell: (params: GridRenderCellParams) => <GapCell value={params.value} /> },
    { field: 'SCORE_IND_58', headerName: 'S.58', width: 70, renderCell: (params: GridRenderCellParams) => <ScoreCell value={params.value} /> },
  ], []);


  return (
    <Box sx={{ maxWidth: '100%', 
      width: '100%', 
      overflow: 'hidden' }}>

      {/* Quantum Selector modernisé */}
      <Card sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3,
        border: `2px solid ${dgiColors.primary.main}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: `linear-gradient(to right, ${alpha(dgiColors.primary.main, 0.02)}, ${alpha(dgiColors.primary.light, 0.02)})`
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: dgiColors.primary.main }}>
                Sélectionner un quantum
              </Typography>
              <FormControl fullWidth size="medium">
                <Select
                  id="quantume-select"
                  value={selectedQuantume}
                  onChange={(e) => setSelectedQuantume(e.target.value)}
                  disabled={loadingQuantume}
                  displayEmpty
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: dgiColors.primary.main,
                      borderWidth: 2
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: dgiColors.primary.dark,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: dgiColors.primary.main,
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>-- Tous les contribuables --</em>
                  </MenuItem>
                  {quantume.map((q) => (
                    <MenuItem key={q.id} value={q.id}>
                      {q.libelle} {q.date_creation && `(${new Date(q.date_creation).toLocaleDateString('fr-FR')})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {loadingQuantume && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={24} sx={{ color: dgiColors.primary.main }} />
                  <Typography variant="body2" color="textSecondary">Chargement...</Typography>
                </Box>
              )}
              {selectedQuantume && (
                <>
                  <Chip
                    icon={<LayersIcon />}
                    label={`${quantume.find(q => q.id === selectedQuantume)?.libelle || ''}`}
                    color="primary"
                    onDelete={() => setSelectedQuantume('')}
                    sx={{
                      backgroundColor: dgiColors.primary.main,
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      py: 2.5
                    }}
                  />
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={downloadingQuantume ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <CloudDownloadIcon />}
                    onClick={() => handleDownloadRiskData(selectedQuantume)}
                    disabled={downloadingQuantume}
                    sx={{
                      backgroundColor: dgiColors.primary.main,
                      color: '#fff',
                      fontWeight: 600,
                      px: 3,
                      boxShadow: '0 4px 12px rgba(0, 107, 63, 0.3)',
                      '&:hover': {
                        backgroundColor: dgiColors.primary.dark,
                        boxShadow: '0 6px 16px rgba(0, 107, 63, 0.4)',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: alpha(dgiColors.primary.main, 0.5),
                        color: '#fff',
                      },
                    }}
                  >
                    {downloadingQuantume ? 'Téléchargement...' : 'Télécharger les données'}
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Filtres avancés */}
      <Accordion 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          '&:before': { display: 'none' },
          border: `1px solid ${dgiColors.neutral[200]}`
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: alpha(dgiColors.primary.main, 0.02),
            borderRadius: 2,
            '&:hover': {
              backgroundColor: alpha(dgiColors.primary.main, 0.05),
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon sx={{ color: dgiColors.primary.main }} />
            <Typography variant="h6" fontWeight={600} color={dgiColors.primary.main}>
              Filtres avancés
            </Typography>
            {(selectedIndicators.length > 0 || selectedRegimes.length > 0 || selectedStructures.length > 0) && (
              <Chip 
                label={`${selectedIndicators.length + selectedRegimes.length + selectedStructures.length} actif(s)`}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                multiple
                options={availableIndicators}
                value={selectedIndicators}
                onChange={(_event, newValue) => setSelectedIndicators(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Indicateurs de risque" 
                    placeholder="Sélectionner..."
                    variant="outlined"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip 
                        key={key}
                        label={`IND_${option}`} 
                        {...tagProps} 
                        color="primary"
                        size="small"
                      />
                    );
                  })
                }
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props as any;
                  return (
                    <li key={key} {...optionProps}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon sx={{ fontSize: 16, color: dgiColors.secondary.main }} />
                        <Typography>Indicateur {option}</Typography>
                      </Box>
                    </li>
                  );
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Autocomplete
                multiple
                options={uniqueRegimes}
                value={selectedRegimes}
                onChange={(_event, newValue) => setSelectedRegimes(newValue as string[])}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Régime fiscal" 
                    placeholder="Sélectionner..."
                    variant="outlined"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip 
                        key={key}
                        label={option as string} 
                        {...tagProps} 
                        color="secondary"
                        size="small"
                      />
                    );
                  })
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Autocomplete
                multiple
                options={uniqueStructures}
                value={selectedStructures}
                onChange={(_event, newValue) => setSelectedStructures(newValue as string[])}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Structures" 
                    placeholder="Sélectionner..."
                    variant="outlined"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip 
                        key={key}
                        label={option as string} 
                        {...tagProps} 
                        size="small"
                      />
                    );
                  })
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ px: 2 }}>
                <Typography variant="body2" gutterBottom fontWeight={600} color="textSecondary">
                  Plage de score: {scoreRange[0]} - {scoreRange[1]}
                </Typography>
                <Slider
                  value={scoreRange}
                  onChange={(_event, newValue) => setScoreRange(newValue as number[])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 25, label: '25' },
                    { value: 50, label: '50' },
                    { value: 75, label: '75' },
                    { value: 100, label: '100' }
                  ]}
                  sx={{
                    color: dgiColors.accent.main,
                    '& .MuiSlider-thumb': {
                      boxShadow: '0 2px 8px rgba(206, 142, 0, 0.4)',
                    },
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', alignItems: 'flex-end', height: '100%' }}>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    setSelectedIndicators([]);
                    setSelectedRegimes([]);
                    setSelectedStructures([]);
                    setScoreRange([0, 100]);
                  }}
                  sx={{
                    borderColor: dgiColors.neutral[200],
                    color: dgiColors.neutral[700],
                    '&:hover': {
                      borderColor: dgiColors.primary.main,
                      backgroundColor: alpha(dgiColors.primary.main, 0.04),
                    },
                  }}
                >
                  Réinitialiser
                </Button>
                <Button 
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  sx={{
                    backgroundColor: dgiColors.primary.main,
                    '&:hover': {
                      backgroundColor: dgiColors.primary.dark,
                    },
                  }}
                >
                  Appliquer
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Tabs pour organisation du contenu */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: `2px solid ${dgiColors.neutral[200]}`,
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.95rem',
              textTransform: 'none',
              minHeight: 64,
            },
            '& .Mui-selected': {
              color: dgiColors.primary.main,
            },
            '& .MuiTabs-indicator': {
              height: 3,
              backgroundColor: dgiColors.primary.main,
            },
          }}
        >
          <Tab 
            icon={<TableViewIcon />} 
            iconPosition="start"
            label="Liste des contribuables" 
          />
          <Tab 
            icon={<PivotTableChartIcon />} 
            iconPosition="start"
            label="Analyse Pivot" 
          />
          <Tab 
            icon={<BarChartIcon />} 
            iconPosition="start"
            label="Graphiques" 
          />
        </Tabs>
      </Paper>

      {/* Tab Panel 0: Liste DataGrid */}
      {currentTab === 0 && (
      <Paper
        sx={{
          borderRadius: 3,
          border: `1px solid ${dgiColors.neutral[200]}`,
          overflow: 'hidden',
          width: '100%',
          '& .MuiDataGrid-root': { border: 'none' },
          '& .MuiDataGrid-columnHeaders': { backgroundColor: dgiColors.neutral[50], borderBottom: `2px solid ${dgiColors.primary.main}` },
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600, color: dgiColors.neutral[900], fontSize: '0.8rem' },
          '& .MuiDataGrid-row:hover': { backgroundColor: alpha(dgiColors.primary.main, 0.04) },
          '& .MuiDataGrid-cell:focus': { outline: 'none' },
        }}
      >
        <DataGrid
          showToolbar
          localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
          rows={riskData}
          columns={allColumns}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          autoHeight={false}
          
          // Pagination serveur
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[10, 25, 50, 100]}
         
          slots={{
            toolbar: CustomToolbar,
            loadingOverlay: () => (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress sx={{ color: dgiColors.primary.main }} />
              </Box>
            ),
            noRowsOverlay: () => (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 1 }}>
                <Typography variant="body1" color="textSecondary">Aucune donnée disponible</Typography>
                <Typography variant="body2" color="textSecondary">Vérifiez la connexion au serveur</Typography>
              </Box>
            ),
          }}
          slotProps={{
            toolbar: { 
              showQuickFilter: false, 
              printOptions: { disableToolbarButton: true },
              csvOptions: { 
                fileName: `contribuables-risques-${new Date().toISOString().split('T')[0]}`,
                utf8WithBom: true 
              }
            },
            columnsButton: {
              sx: {
                color: '#fff',
                '& .MuiButton-startIcon svg': { color: '#fff' },
              }
            },
            filterButton: {
              sx: {
                color: '#fff',
                '& .MuiButton-startIcon svg': { color: '#fff' },
              }
            },
            densitySelector: {
              sx: {
                color: '#fff',
                '& .MuiButton-startIcon svg': { color: '#fff' },
              }
            },
            exportButton: {
              sx: {
                color: '#fff',
                '& .MuiButton-startIcon svg': { color: '#fff' },
              }
            },
          }}
          sx={{ 
            height: 600,
            width: '100%',
            '& .MuiDataGrid-virtualScroller': {
              overflowX: 'auto'
            }
          }}
           initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
     columns: {
      columnVisibilityModel: {
        // Masquer toutes les colonnes d'indicateurs de risque par défaut
       // RISQUE_IND_1: false,
        GAP_IND_1: false,
        SCORE_IND_1: false,
        //RISQUE_IND_2: false,
        GAP_IND_2: false,
        SCORE_IND_2: false,
        RISQUE_IND_3: false,
        GAP_IND_3: false,
        SCORE_IND_3: false,
        RISQUE_IND_4: false,
        GAP_IND_4: false,
        SCORE_IND_4: false,
        RISQUE_IND_5: false,
        GAP_IND_5: false,
        SCORE_IND_5: false,
        RISQUE_IND_8: false,
        GAP_IND_8: false,
        SCORE_IND_8: false,
        RISQUE_IND_12: false,
        GAP_IND_12: false,
        SCORE_IND_12: false,
        RISQUE_IND_13: false,
        GAP_IND_13: false,
        SCORE_IND_13: false,
        RISQUE_IND_14: false,
        GAP_IND_14: false,
        SCORE_IND_14: false,
        RISQUE_IND_15_A: false,
        GAP_IND_15_A: false,
        SCORE_IND_15_A: false,
        RISQUE_IND_15_B: false,
        GAP_IND_15_B: false,
        SCORE_IND_15_B: false,
        RISQUE_IND_16: false,
        GAP_IND_16: false,
        SCORE_IND_16: false,
        RISQUE_IND_20: false,
        GAP_IND_20: false,
        SCORE_IND_20: false,
        RISQUE_IND_27: false,
        GAP_IND_27: false,
        SCORE_IND_27: false,
        RISQUE_IND_38: false,
        GAP_IND_38: false,
        SCORE_IND_38: false,
        RISQUE_IND_39: false,
        GAP_IND_39: false,
        SCORE_IND_39: false,
        RISQUE_IND_46: false,
        GAP_IND_46: false,
        SCORE_IND_46: false,
        RISQUE_IND_47: false,
        GAP_IND_47: false,
        SCORE_IND_47: false,
        RISQUE_IND_49: false,
        GAP_IND_49: false,
        SCORE_IND_49: false,
        RISQUE_IND_57: false,
        GAP_IND_57: false,
        SCORE_IND_57: false,
        RISQUE_IND_58: false,
        GAP_IND_58: false,
        SCORE_IND_58: false,
      },
    },
  }}
   
        />
      </Paper>
      )}

      {/* Tab Panel 1: Analyse Pivot */}
      {currentTab === 1 && (
        <Paper sx={{ p: 3, borderRadius: 3, minHeight: 600 }}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <PivotTableChartIcon sx={{ fontSize: 32, color: dgiColors.primary.main }} />
            <Typography variant="h5" fontWeight="bold" color="primary">
              Analyse Pivot Interactive
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Explorez vos données avec des tableaux croisés dynamiques. Glissez-déposez les dimensions, 
            créez des agrégations personnalisées et visualisez les tendances.
          </Typography>
          <Box sx={{ 
            height: 600, 
            border: `1px solid ${dgiColors.neutral[200]}`,
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <FlexmonsterReact.Pivot
              toolbar={true}
              report={flexmonsterReport}
              width="100%"
              height="100%"
            />
          </Box>
        </Paper>
      )}

      {/* Tab Panel 2: Graphiques */}
      {currentTab === 2 && (
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <BarChartIcon sx={{ fontSize: 32, color: dgiColors.accent.main }} />
            <Typography variant="h5" fontWeight="bold">
              Visualisations Graphiques - Analyse des Risques
            </Typography>
          </Box>

          {/* Première ligne de graphiques */}
          <Grid container spacing={3} sx={{ mb: 3 }}>


            {/* Répartition par régime fiscal - Doughnut */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${dgiColors.neutral[200]}` }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Répartition par Régime Fiscal
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Doughnut 
                    data={chartsData.regimeData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          position: 'right',
                          labels: { padding: 15, font: { size: 11 } }
                        },
                        tooltip: {
                          backgroundColor: '#fff',
                          titleColor: dgiColors.neutral[900],
                          bodyColor: dgiColors.neutral[700],
                          borderColor: dgiColors.neutral[200],
                          borderWidth: 1,
                          callbacks: {
                            label: (context) => {
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const value = context.parsed;
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${context.label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </Box>
              </Paper>
            </Grid>

             <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${dgiColors.neutral[200]}` }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  GAP Total par Indicateur (en Millions FCFA)
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar 
                    data={chartsData.gapData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          display: true,
                          labels: { font: { size: 11 } }
                        },
                        tooltip: {
                          backgroundColor: '#fff',
                          titleColor: dgiColors.neutral[900],
                          bodyColor: dgiColors.neutral[700],
                          borderColor: dgiColors.neutral[200],
                          borderWidth: 1,
                          callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}M FCFA`
                          }
                        }
                      },
                      scales: {
                        y: { beginAtZero: true, grid: { color: dgiColors.neutral[100] } },
                        x: { grid: { display: false } }
                      }
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>



          {/* Troisième ligne - Graphique large */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${dgiColors.neutral[200]}` }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Contribuables à Risque par Structure
                </Typography>
                <Box sx={{ height: 350 }}>
                  <Bar 
                    data={chartsData.structureData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          display: true,
                          position: 'top',
                          labels: { font: { size: 12 } }
                        },
                        tooltip: {
                          backgroundColor: '#fff',
                          titleColor: dgiColors.neutral[900],
                          bodyColor: dgiColors.neutral[700],
                          borderColor: dgiColors.neutral[200],
                          borderWidth: 1,
                          callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.parsed.y}`
                          }
                        }
                      },
                      scales: {
                        y: { 
                          stacked: true, 
                          beginAtZero: true, 
                          grid: { color: dgiColors.neutral[100] } 
                        },
                        x: { 
                          stacked: true,
                          grid: { display: false } 
                        }
                      }
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Insights */}
          <Paper sx={{ 
            p: 3, 
            mt: 3, 
            borderRadius: 2, 
            background: `linear-gradient(135deg, ${alpha(dgiColors.accent.main, 0.05)}, ${alpha(dgiColors.accent.light, 0.05)})`,
            border: `1px solid ${dgiColors.accent.main}`
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon sx={{ color: dgiColors.accent.main }} />
              Insights Clés
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Alert severity="info" sx={{ borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="600">Concentration des Scores</Typography>
                  <Typography variant="caption">
                    La majorité des contribuables se situent dans la tranche de score {chartsData.insights.maxScoreRange}
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={4}>
                <Alert severity="warning" sx={{ borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="600">GAP Principal</Typography>
                  <Typography variant="caption">
                    L'indicateur avec le GAP le plus élevé est {chartsData.insights.maxGapIndicator} ({chartsData.insights.maxGapValue.toFixed(1)}M FCFA)
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={4}>
                <Alert severity="error" sx={{ borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="600">Structure Prioritaire</Typography>
                  <Typography variant="caption">
                    {chartsData.insights.topStructure} compte {chartsData.insights.topStructureRisk} contribuables à risque
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Informations de pagination et statistiques - Affichées seulement pour le tab Liste */}
      {currentTab === 0 && (
      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`Total: ${paginationInfo?.total_records || 0} contribuables`} 
            sx={{ backgroundColor: dgiColors.neutral[100], fontWeight: 600 }} 
          />
          <Chip 
            label={`Page ${paginationInfo?.current_page || 1} / ${paginationInfo?.total_pages || 1}`} 
            sx={{ backgroundColor: alpha(dgiColors.primary.main, 0.1), color: dgiColors.primary.main }} 
          />
          <Chip 
            label={`${paginationInfo?.per_page || 0} par page`} 
            sx={{ backgroundColor: dgiColors.neutral[100] }} 
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`Avec risque Ind.1: ${riskData.filter(r => r.RISQUE_IND_1 === 1).length}`} 
            sx={{ backgroundColor: alpha(dgiColors.secondary.main, 0.1), color: dgiColors.secondary.main }} 
          />
          <Chip 
            label={`Avec risque Ind.2: ${riskData.filter(r => r.RISQUE_IND_2 === 1).length}`} 
            sx={{ backgroundColor: alpha(dgiColors.accent.main, 0.1), color: dgiColors.accent.main }} 
          />
        </Box>
      </Box>
      )}

      {/* Modal de détails du contribuable */}
      <ContribuableDetailModal 
        open={modalOpen}
        onClose={handleCloseModal}
        numIFU={selectedIFU}
      />
      
      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContribuablesList;
