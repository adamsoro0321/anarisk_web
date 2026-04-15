import React from 'react';
import { Box, Chip, LinearProgress, Tooltip, Typography } from '@mui/material';
import TaskService from '../services/task.service';

interface TaskStatusBadgeProps {
  taskId: string;
  taskName: string;
  status: string;
  progress?: number;
  currentStep?: string;
  compact?: boolean;
}

/**
 * Composant compact pour afficher le statut d'une tâche
 * Utile dans les listes ou tableaux
 */
const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({
  taskId,
  taskName,
  status,
  progress = 0,
  currentStep,
  compact = false,
}) => {
  const isActive = TaskService.isTaskActive(status);
  const statusColor = TaskService.getStatusColor(status);

  if (compact) {
    return (
      <Tooltip
        title={
          <Box>
            <Typography variant="caption" display="block">
              <strong>{taskName}</strong>
            </Typography>
            <Typography variant="caption" display="block">
              Statut: {status}
            </Typography>
            {isActive && currentStep && (
              <Typography variant="caption" display="block">
                {currentStep}
              </Typography>
            )}
            <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
              ID: {taskId.substring(0, 8)}...
            </Typography>
          </Box>
        }
      >
        <Chip
          label={`${status} ${isActive ? `(${progress}%)` : ''}`}
          color={statusColor}
          size="small"
          sx={{ cursor: 'help' }}
        />
      </Tooltip>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Chip label={status} color={statusColor} size="small" />
        {isActive && (
          <Typography variant="caption" fontWeight="bold">
            {progress}%
          </Typography>
        )}
      </Box>

      {isActive && (
        <>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 6, borderRadius: 1, mb: 0.5 }}
          />
          {currentStep && (
            <Typography variant="caption" color="text.secondary" display="block">
              {currentStep}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default TaskStatusBadge;
