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
  Snackbar
} from "@mui/material";
import { 
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  ViewComfy as ViewComfyIcon,
  ViewColumn as ViewColumnIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon
} from "@mui/icons-material";
import { useEffect, useState, useMemo, useCallback } from "react";
// @ts-expect-error - API.js n'a pas de déclaration TypeScript
import { API } from "../../api/API.js";
import QuantumeService, { type QuantumeItem } from "../../services/quantume.service";
import { 
  DataGrid,
  useGridApiContext,
  gridFilteredSortedRowIdsSelector,
  gridVisibleColumnFieldsSelector
} from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import ContribuableDetailModal from "../../components/modals/ContribuableDetailModal.js"; 
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
        {/** dropdown selection du programme */}
        <Paper
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            border: `1px solid ${dgiColors.neutral[200]}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl fullWidth size="small" sx={{ maxWidth: 400 }}>
              <InputLabel id="quantume-select-label">Sélectionner un quantum</InputLabel>
              <Select
                labelId="quantume-select-label"
                id="quantume-select"
                value={selectedQuantume}
                label="Sélectionner un quantum"
                onChange={(e) => setSelectedQuantume(e.target.value)}
                disabled={loadingQuantume}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: dgiColors.primary.main,
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
                  <em>-- Sélectionner --</em>
                </MenuItem>
                {quantume.map((q) => (
                  <MenuItem key={q.id} value={q.id}>
                    {q.libelle} {q.date_creation && `(${new Date(q.date_creation).toLocaleDateString('fr-FR')})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {loadingQuantume && <CircularProgress size={24} sx={{ color: dgiColors.primary.main }} />}
            {selectedQuantume && (
              <Chip
                label={`Quantum sélectionné: ${quantume.find(q => q.id === selectedQuantume)?.libelle || ''}`}
                color="primary"
                onDelete={() => setSelectedQuantume('')}
                sx={{
                  backgroundColor: dgiColors.primary.main,
                  color: '#fff',
                  fontWeight: 600,
                }}
              />
            )}
            {/**download quantum */}
            {selectedQuantume && (
              <Button
                variant="contained"
                color="primary"
                startIcon={downloadingQuantume ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <DownloadIcon />}
                onClick={() => handleDownloadRiskData(selectedQuantume)}
                disabled={downloadingQuantume}
                sx={
                  {
                  backgroundColor: dgiColors.primary.main,
                  color: '#fff',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: dgiColors.primary.dark,
                  },
                  '&.Mui-disabled': {
                    backgroundColor: alpha(dgiColors.primary.main, 0.5),
                    color: '#fff',
                  },
                }}
              >
                {downloadingQuantume ? 'Téléchargement...' : 'Télécharger les données'}
              </Button>
            )}
          </Box>
        </Paper>
      {/* DataGrid */}
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

      {/* Informations de pagination et statistiques */}
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
