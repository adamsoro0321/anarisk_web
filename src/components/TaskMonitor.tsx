import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Grid,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TaskService, { type TaskData } from "../services/task.service";
import TaskLogViewer from './TaskLogViewer';

interface TaskMonitorProps {
  taskId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showLogs?: boolean;
  onTaskComplete?: (task: TaskData) => void;
}

const TaskMonitor: React.FC<TaskMonitorProps> = ({
  taskId,
  autoRefresh = true,
  refreshInterval = 3000,
  showLogs = true,
  onTaskComplete,
}) => {
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logsExpanded, setLogsExpanded] = useState(true);

  const fetchTaskDetails = useCallback(async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await TaskService.getTaskDetails(taskId);
      
      if (response.success) {
        const taskData = response.data;
        setTask(taskData);

        // Callback si la tâche est terminée
        if (TaskService.isTaskCompleted(taskData.status) && onTaskComplete) {
          onTaskComplete(taskData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération de la tâche');
    } finally {
      setLoading(false);
    }
  }, [taskId, onTaskComplete]);

  useEffect(() => {
    fetchTaskDetails();

    if (autoRefresh && task && !TaskService.isTaskCompleted(task.status)) {
      const interval = setInterval(fetchTaskDetails, refreshInterval);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, autoRefresh, refreshInterval, task?.status, fetchTaskDetails]);

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '--';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!task) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Chargement de la tâche...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={3}>
      <CardContent>
        {/* Header avec titre et statut */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {task.task_name}
            </Typography>
            {task.quantume && (
              <Typography variant="body2" color="text.secondary">
                Quantum : {task.quantume}
              </Typography>
            )}
          </Box>

          <Box display="flex" gap={1} alignItems="center">
            <Chip
              label={task.status}
              color={TaskService.getStatusColor(task.status)}
              size="small"
            />
            <Tooltip title="Actualiser">
              <IconButton onClick={fetchTaskDetails} disabled={loading} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Barre de progression */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Progression
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {task.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={task.progress}
            sx={{ height: 8, borderRadius: 1 }}
          />
          {task.current_step && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {task.current_step}
            </Typography>
          )}
        </Box>

        {/* Informations détaillées */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* @ts-expect-error - Grid props work fine at runtime despite TypeScript error */}
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Début
            </Typography>
            <Typography variant="body2">
              {task.start_time ? new Date(task.start_time).toLocaleString('fr-FR') : '--'}
            </Typography>
          </Grid>

          {/* @ts-expect-error - Grid props work fine at runtime despite TypeScript error */}
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Fin
            </Typography>
            <Typography variant="body2">
              {task.end_time ? new Date(task.end_time).toLocaleString('fr-FR') : '--'}
            </Typography>
          </Grid>

          {/* @ts-expect-error - Grid props work fine at runtime despite TypeScript error */}
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Durée
            </Typography>
            <Typography variant="body2">
              {formatDuration(task.duration)}
            </Typography>
          </Grid>

          {/* @ts-expect-error - Grid props work fine at runtime despite TypeScript error */}
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              ID Tâche
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
              {task.task_id.substring(0, 8)}...
            </Typography>
          </Grid>
        </Grid>

        {/* Message d'erreur si échec */}
        {task.status === 'FAILURE' && task.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Erreur :
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.75rem' }}>
              {task.error}
            </Typography>
          </Alert>
        )}

        {/* Résultat si succès */}
        {task.status === 'SUCCESS' && task.result && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Résultat :
            </Typography>
            {Object.entries(task.result).map(([key, value]) => (
              <Typography key={key} variant="body2">
                <strong>{key}:</strong> {String(value)}
              </Typography>
            ))}
          </Alert>
        )}

        {/* Section des logs */}
        {showLogs && (
          <>
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2">
                Logs ({task.logs.length})
              </Typography>
              <IconButton
                size="small"
                onClick={() => setLogsExpanded(!logsExpanded)}
              >
                {logsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={logsExpanded}>
              <TaskLogViewer
                taskId={taskId}
                autoRefresh={autoRefresh && !TaskService.isTaskCompleted(task.status)}
                refreshInterval={refreshInterval}
                maxHeight="300px"
              />
            </Collapse>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskMonitor;
