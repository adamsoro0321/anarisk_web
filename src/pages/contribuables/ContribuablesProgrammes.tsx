import {
  Box,
  Typography,
  Paper,
  Button,
  alpha,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  LinearProgress,

} from "@mui/material";
import {
  Upload as UploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import {  useState,  useRef } from "react";
import * as XLSX from 'xlsx';
// @ts-expect-error - API.js n'a pas de déclaration TypeScript
import { API } from "../../api/API.js";

// Palette DGI Burkina Faso
const dgiColors = {
  primary: { main: "#006B3F", light: "#2E8B57", dark: "#004D2C" },
  accent: { main: "#CE8E00", light: "#E6A817" },
  secondary: { main: "#CE1126", light: "#E53945" },
  neutral: { 50: "#FAFAFA", 100: "#F5F5F5", 200: "#EEEEEE", 500: "#9E9E9E", 700: "#616161", 900: "#212121" },
};



interface UploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message: string;
}

const ContribuablesProgrammes = () => {

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'idle',
    message: '',
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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


  // Valider les colonnes du fichier Excel
  const validateExcelColumns = async (file: File): Promise<{ valid: boolean; missingColumns: string[] }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Lire la première feuille
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convertir en JSON pour obtenir les en-têtes
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
          
          if (jsonData.length === 0) {
            resolve({ valid: false, missingColumns: ['Fichier vide'] });
            return;
          }
          
          // Obtenir les en-têtes (première ligne) et normaliser (insensible à la casse)
          const headers = jsonData[0].map(h => String(h).trim().toLowerCase());
          
          // Colonnes requises (insensibles à la casse)
          const requiredColumns = [
            { original: 'NUM_IFU', normalized: 'num_ifu' },
            { original: 'STructures', normalized: 'structures' },
            { original: 'BRIGADES', normalized: 'brigades' }
          ];
          
          // Vérifier les colonnes manquantes
          const missingColumns = requiredColumns
            .filter(col => !headers.includes(col.normalized))
            .map(col => col.original);
          
          resolve({
            valid: missingColumns.length === 0,
            missingColumns,
          });
        } catch (error) {
          console.error('Erreur lors de la validation:', error);
          resolve({ valid: false, missingColumns: ['Erreur de lecture du fichier'] });
        }
      };
      
      reader.onerror = () => {
        resolve({ valid: false, missingColumns: ['Erreur de lecture du fichier'] });
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  // Gérer la sélection du fichier
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier l'extension
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      setSnackbar({
        open: true,
        message: 'Veuillez sélectionner un fichier Excel (.xlsx ou .xls)',
        severity: 'error',
      });
      return;
    }

    // Valider les colonnes requises
    const validation = await validateExcelColumns(file);
    
    if (!validation.valid) {
      const missingCols = validation.missingColumns.join(', ');
      setSnackbar({
        open: true,
        message: `Colonnes manquantes dans le fichier : ${missingCols}. Les colonnes requises sont : NUM_IFU, STructures, BRIGADES`,
        severity: 'error',
      });
      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
    setSnackbar({
      open: true,
      message: `Fichier sélectionné: ${file.name}`,
      severity: 'info',
    });
  };

  // Téléverser le fichier
  const handleUpload = async () => {
    if (!selectedFile) {
      setSnackbar({
        open: true,
        message: 'Veuillez sélectionner un fichier',
        severity: 'warning',
      });
      return;
    }

    setUploading(true);
    setUploadProgress({ progress: 0, status: 'uploading', message: 'Téléversement en cours...' });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await API.post('/upload-programme-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
          const total = progressEvent.total || 1;
          const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
          setUploadProgress({
            progress: percentCompleted,
            status: 'uploading',
            message: `Téléversement: ${percentCompleted}%`,
          });
        },
      });

      if (response.data.success) {
        setUploadProgress({
          progress: 100,
          status: 'success',
          message: 'Fichier téléversé avec succès',
        });
        setSnackbar({
          open: true,
          message: response.data.message || 'Programme créé avec succès',
          severity: 'success',
        });
        
        // Réinitialiser et recharger
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(response.data.message || 'Erreur lors du téléversement');
      }
    } catch (err: unknown) {
      console.error('Erreur lors du téléversement:', err);
      setUploadProgress({
        progress: 0,
        status: 'error',
        message: 'Échec du téléversement',
      });
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Erreur lors du téléversement du fichier',
        severity: 'error',
      });
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress({ progress: 0, status: 'idle', message: '' });
      }, 3000);
    }
  };





  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ maxWidth: '100%', width: '100%', p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: dgiColors.primary.main,
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <DescriptionIcon sx={{ fontSize: 40 }} />
          Gestion des Programmes
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Téléversez un fichier Excel pour créer un nouveau programme de contrôle
        </Typography>
      </Box>

      {/* Section de téléversement */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          border: `2px dashed ${dgiColors.primary.main}`,
          backgroundColor: alpha(dgiColors.primary.main, 0.02),
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            
            <Button
              variant="outlined"
              startIcon={<DescriptionIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              sx={{
                borderColor: dgiColors.primary.main,
                color: dgiColors.primary.main,
                '&:hover': {
                  borderColor: dgiColors.primary.dark,
                  backgroundColor: alpha(dgiColors.primary.main, 0.05),
                },
              }}
            >
              Sélectionner un fichier Excel
            </Button>

            {selectedFile && (
              <Chip
                icon={<DescriptionIcon />}
                label={selectedFile.name}
                onDelete={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                sx={{
                  backgroundColor: alpha(dgiColors.primary.main, 0.1),
                  color: dgiColors.primary.main,
                  fontWeight: 600,
                }}
              />
            )}

            <Button
              variant="contained"
              startIcon={uploading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <UploadIcon />}
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              sx={{
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
              {uploading ? 'Téléversement...' : 'Téléverser'}
            </Button>

          
          </Box>

          {/* Barre de progression */}
          {uploadProgress.status !== 'idle' && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {uploadProgress.status === 'uploading' && <CircularProgress size={16} />}
                {uploadProgress.status === 'success' && <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />}
                {uploadProgress.status === 'error' && <ErrorIcon sx={{ color: 'error.main', fontSize: 20 }} />}
                <Typography variant="body2" color="textSecondary">
                  {uploadProgress.message}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={uploadProgress.progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: dgiColors.neutral[200],
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: uploadProgress.status === 'error' 
                      ? dgiColors.secondary.main 
                      : dgiColors.primary.main,
                  },
                }}
              />
            </Box>
          )}

          {/* Instructions */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1 }}>
            <InfoIcon sx={{ color: dgiColors.accent.main, fontSize: 20, mt: 0.5 }} />
            <Typography variant="body2" color="textSecondary">
              Le fichier Excel doit contenir les colonnes nécessaires pour créer un programme de contrôle.
              Format accepté : .xlsx ou .xls
            </Typography>
          </Box>
        </Box>
      </Paper>

  
      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContribuablesProgrammes;
