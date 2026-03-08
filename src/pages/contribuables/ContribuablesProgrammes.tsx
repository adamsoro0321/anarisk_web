import {
  Box,
  Typography,
  Paper,
  Button,
  alpha,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Snackbar,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  PlaylistAdd as GenerateIcon,
} from "@mui/icons-material";
import { useEffect, useState, useCallback, useRef } from "react";
// @ts-expect-error - API.js n'a pas de déclaration TypeScript
import { API } from "../../api/API.js";

// Palette DGI Burkina Faso
const dgiColors = {
  primary: { main: "#006B3F", light: "#2E8B57", dark: "#004D2C" },
  accent: { main: "#CE8E00", light: "#E6A817" },
  secondary: { main: "#CE1126", light: "#E53945" },
  neutral: { 50: "#FAFAFA", 100: "#F5F5F5", 200: "#EEEEEE", 500: "#9E9E9E", 700: "#616161", 900: "#212121" },
};

interface ProgrammeFile {
  name: string;
  path: string;
  size: number;
  size_formatted: string;
  modified_date: string;
  extension: string;
}

interface UploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message: string;
}

const ContribuablesProgrammes = () => {
  const [programmes, setProgrammes] = useState<ProgrammeFile[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Charger la liste des fichiers Excel programmes
  const fetchProgrammes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get('/programmes-files');
      if (response.data.success) {
        setProgrammes(response.data.data);
      }
    } catch (err: unknown) {
      console.error('Erreur lors de la récupération des programmes:', err);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la récupération des programmes',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgrammes();
  }, [fetchProgrammes]);

  // Gérer la sélection du fichier
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        fetchProgrammes();
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

  const handleDownloadProgramme = async (filename: string) => {
    try {
      const response = await API.get(`/programmes-files/download/${filename}`, {
        responseType: 'blob',
      });
      
      // Créer un URL temporaire pour le blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: 'Fichier téléchargé avec succès',
        severity: 'success',
      });
    } catch (err: unknown) {
      console.error('Erreur lors du téléchargement:', err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Erreur lors du téléchargement du fichier',
        severity: 'error',
      });
    }
  };

  const handleGenerateFiches = async (filename: string) => {
    try {
      setSnackbar({
        open: true,
        message: 'Génération des fiches en cours...',
        severity: 'info',
      });

      const response = await API.post('/generate-fiches', {
        quantum_name: filename,
      });
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.message || 'Fiches générées avec succès',
          severity: 'success',
        });
      } else {
        throw new Error(response.data.message || 'Erreur lors de la génération des fiches');
      }
    } catch (err: unknown) {
      console.error('Erreur lors de la génération des fiches:', err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Erreur lors de la génération des fiches',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
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

            <Button
              variant="text"
              startIcon={<RefreshIcon />}
              onClick={fetchProgrammes}
              disabled={loading || uploading}
              sx={{
                color: dgiColors.primary.main,
                '&:hover': {
                  backgroundColor: alpha(dgiColors.primary.main, 0.05),
                },
              }}
            >
              Actualiser
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

      {/* Liste des programmes */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: dgiColors.neutral[900] }}>
            Programmes disponibles ({programmes.length})
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress sx={{ color: dgiColors.primary.main }} />
          </Box>
        ) : programmes.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              border: `1px solid ${dgiColors.neutral[200]}`,
            }}
          >
            <DescriptionIcon sx={{ fontSize: 60, color: dgiColors.neutral[500], mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Aucun programme disponible
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Téléversez votre premier fichier Excel pour commencer
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            {programmes.map((programme) => (
              <Card
                key={programme.name}
                sx={{
                    height: '100%',
                    borderRadius: 2,
                    border: `1px solid ${dgiColors.neutral[200]}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: `0 4px 20px ${alpha(dgiColors.primary.main, 0.15)}`,
                      transform: 'translateY(-4px)',
                      borderColor: dgiColors.primary.main,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                      <DescriptionIcon sx={{ color: dgiColors.primary.main, fontSize: 24 }} />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: dgiColors.neutral[900],
                          fontSize: '0.9rem',
                          wordBreak: 'break-word',
                        }}
                      >
                        {programme.name}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <List dense disablePadding>
                      <ListItem disablePadding>
                        <ListItemText
                          primary="Date de modification"
                          secondary={formatDate(programme.modified_date)}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: 'textSecondary',
                            fontSize: '0.75rem',
                          }}
                          secondaryTypographyProps={{
                            variant: 'body2',
                            color: 'textPrimary',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                          }}
                        />
                      </ListItem>
                    </List>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1.5 }}>
                      <Tooltip title="Télécharger le fichier">
                        <IconButton
                          size="medium"
                          sx={{
                            backgroundColor: dgiColors.primary.main,
                            color: 'white',
                            '&:hover': {
                              backgroundColor: dgiColors.primary.dark,
                            },
                          }}
                          onClick={() => handleDownloadProgramme(programme.name)}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Générer les fiches">
                        <IconButton
                          size="medium"
                          sx={{
                            backgroundColor: dgiColors.accent.main,
                            color: 'white',
                            '&:hover': {
                              backgroundColor: dgiColors.accent.light,
                            },
                          }}
                          onClick={() => handleGenerateFiches(programme.name)}
                        >
                          <GenerateIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
            ))}
          </Box>
        )}
      </Box>

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
