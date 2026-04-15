import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  LinearProgress,
  Alert,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import GetAppIcon from '@mui/icons-material/GetApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import BugReportIcon from '@mui/icons-material/BugReport';
import TaskService, { type TaskLog } from '../services/task.service';

interface TaskLogViewerProps {
  taskId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // en millisecondes
  maxHeight?: string;
}

const TaskLogViewer: React.FC<TaskLogViewerProps> = ({
  taskId,
  autoRefresh = true,
  refreshInterval = 2000,
  maxHeight = '400px',
}) => {
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<TaskLog[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fonction pour récupérer les logs
  const fetchLogs = useCallback(async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await TaskService.getTaskLogs(taskId);
      
      if (response.success) {
        setLogs(response.logs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des logs');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  // Polling automatique
  useEffect(() => {
    fetchLogs();

    if (autoRefresh) {
      const interval = setInterval(fetchLogs, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [taskId, autoRefresh, refreshInterval, fetchLogs]);

  // Filtrer les logs par niveau
  useEffect(() => {
    if (selectedLevel === 'ALL') {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(logs.filter(log => log.level === selectedLevel));
    }
  }, [logs, selectedLevel]);

  // Auto-scroll vers le bas quand de nouveaux logs arrivent
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, autoScroll]);

  // Détecter si l'utilisateur a scroll manuellement
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  // Télécharger les logs en fichier texte
  const downloadLogs = () => {
    const logText = filteredLogs
      .map(log => `[${log.timestamp}] [${log.level}] ${log.message}`)
      .join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-${taskId.substring(0, 8)}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Icône pour chaque niveau de log
  const getLogIcon = (level: string) => {
    switch (level) {
      case 'SUCCESS':
        return <CheckCircleIcon fontSize="small" />;
      case 'ERROR':
        return <ErrorIcon fontSize="small" />;
      case 'WARNING':
        return <WarningIcon fontSize="small" />;
      case 'DEBUG':
        return <BugReportIcon fontSize="small" />;
      case 'INFO':
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Logs de la tâche</Typography>
        
        <Box display="flex" gap={1} alignItems="center">
          {/* Filtre par niveau */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <MenuItem value="ALL">Tous</MenuItem>
              <MenuItem value="DEBUG">Debug</MenuItem>
              <MenuItem value="INFO">Info</MenuItem>
              <MenuItem value="SUCCESS">Succès</MenuItem>
              <MenuItem value="WARNING">Warning</MenuItem>
              <MenuItem value="ERROR">Erreur</MenuItem>
            </Select>
          </FormControl>

          {/* Bouton refresh manuel */}
          <Tooltip title="Actualiser">
            <IconButton onClick={fetchLogs} disabled={loading} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          {/* Bouton téléchargement */}
          <Tooltip title="Télécharger les logs">
            <IconButton onClick={downloadLogs} disabled={filteredLogs.length === 0} size="small">
              <GetAppIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Progress bar pendant le chargement */}
      {loading && <LinearProgress sx={{ mb: 1 }} />}

      {/* Message d'erreur */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Conteneur des logs */}
      <Box
        ref={containerRef}
        onScroll={handleScroll}
        sx={{
          maxHeight,
          overflowY: 'auto',
          bgcolor: '#1e1e1e',
          color: '#d4d4d4',
          p: 2,
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          '& ::-webkit-scrollbar': {
            width: '8px',
          },
          '& ::-webkit-scrollbar-track': {
            bgcolor: '#2d2d2d',
          },
          '& ::-webkit-scrollbar-thumb': {
            bgcolor: '#555',
            borderRadius: '4px',
            '&:hover': {
              bgcolor: '#666',
            },
          },
        }}
      >
        {filteredLogs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            {logs.length === 0 ? 'Aucun log disponible' : 'Aucun log pour ce niveau'}
          </Typography>
        ) : (
          filteredLogs.map((log, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 1,
                mb: 0.5,
                alignItems: 'flex-start',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              {/* Timestamp */}
              <Typography
                component="span"
                sx={{
                  color: '#858585',
                  fontSize: '0.75rem',
                  minWidth: '180px',
                  flexShrink: 0,
                }}
              >
                {new Date(log.timestamp).toLocaleString('fr-FR')}
              </Typography>

              {/* Niveau */}
              <Chip
                icon={getLogIcon(log.level)}
                label={log.level}
                size="small"
                sx={{
                  height: '20px',
                  fontSize: '0.7rem',
                  minWidth: '80px',
                  bgcolor: TaskService.getLogLevelColor(log.level),
                  color: '#fff',
                  fontWeight: 'bold',
                  '& .MuiChip-icon': {
                    color: '#fff',
                  },
                }}
              />

              {/* Message */}
              <Typography
                component="span"
                sx={{
                  color: TaskService.getLogLevelColor(log.level),
                  wordBreak: 'break-word',
                  flex: 1,
                }}
              >
                {log.message}
              </Typography>
            </Box>
          ))
        )}
        <div ref={logsEndRef} />
      </Box>

      {/* Statistiques */}
      <Box mt={2} display="flex" gap={1} justifyContent="flex-end">
        <Chip label={`Total: ${logs.length}`} size="small" variant="outlined" />
        {selectedLevel !== 'ALL' && (
          <Chip label={`Filtrés: ${filteredLogs.length}`} size="small" variant="outlined" />
        )}
        {!autoScroll && (
          <Chip 
            label="Auto-scroll désactivé" 
            size="small" 
            color="warning" 
            variant="outlined"
            onClick={() => setAutoScroll(true)}
            sx={{ cursor: 'pointer' }}
          />
        )}
      </Box>
    </Paper>
  );
};

export default TaskLogViewer;
