import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Card, alpha,
  Button, CircularProgress, Alert, Divider, FormControl,
  InputLabel, Select, MenuItem, Chip, LinearProgress, IconButton, Tooltip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { dgiColors } from './_dgiColors';
import QuantumeService, { type QuantumeItem, type TaskItem, type TaskStatusResponse } from '../../services/quantume.service';





const Parametres: React.FC = () => {

  // --- Pré-liste state ---
  const [quantumes, setQuantumes]             = useState<QuantumeItem[]>([]);
  const [quantumesLoading, setQuantumesLoading] = useState(false);
  const [selectedId, setSelectedId]           = useState<number | ''>('');
  const [generating, setGenerating]           = useState(false);
  const [genSuccess, setGenSuccess]           = useState<string | null>(null);
  const [genError, setGenError]               = useState<string | null>(null);
  const [taskId, setTaskId]                   = useState<string | null>(null);

  // --- Tâches en cours ---
  const [activeTasks, setActiveTasks]             = useState<TaskItem[]>([]);
  const [tasksLoading, setTasksLoading]           = useState(false);
  const [currentTaskStatus, setCurrentTaskStatus] = useState<TaskStatusResponse | null>(null);
  const statusIntervalRef                         = useRef<ReturnType<typeof setInterval> | null>(null);
  const [revokingId, setRevokingId]               = useState<string | null>(null);

  useEffect(() => {
    setQuantumesLoading(true);
    QuantumeService.getAll()
      .then((res) => { if (res.success) setQuantumes(res.data); })
      .catch(() => { /* silently ignore */ })
      .finally(() => setQuantumesLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (selectedId === '') return;
    const quantume = quantumes.find((q) => q.id === selectedId);
    if (!quantume) return;
    setGenerating(true); setGenSuccess(null); setGenError(null); setTaskId(null);
    try {
      const res = await QuantumeService.generate(quantume.libelle);
      if (res.success) {
        const msg = res.message ?? `Pré-liste lancée pour le quantum « ${quantume.libelle} ».`;
        setGenSuccess(msg);
        if (res.task_id) setTaskId(res.task_id);
        setTimeout(() => setGenSuccess(null), 8000);
      } else {
        setGenError(res.message ?? 'Erreur lors de la génération.');
      }
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string; task_id?: string } } };
      const data = err?.response?.data;
      const msg = data?.message || (e instanceof Error ? e.message : 'Erreur lors de la génération.');
      setGenError(msg);
      if (err?.response?.status === 409 && data?.task_id) {
        setTaskId(data.task_id);
      }
    } finally {
      setGenerating(false);
    }
  };

  const fetchTasks = useCallback(async () => {
    try {
      const res = await QuantumeService.getTasks();
      if (res.success) setActiveTasks(res.data);
    } catch { /* ignore */ }
  }, []);

  const refreshTasks = async () => {
    setTasksLoading(true);
    await fetchTasks();
    setTasksLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  useEffect(() => {
    if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    if (!taskId) { setCurrentTaskStatus(null); return; }

    const poll = async () => {
      try {
        const res = await QuantumeService.getTaskStatus(taskId);
        setCurrentTaskStatus(res);
        if (res.state === 'SUCCESS' || res.state === 'FAILURE') {
          if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
          fetchTasks();
        }
      } catch { /* ignore */ }
    };

    poll();
    statusIntervalRef.current = setInterval(poll, 10000);
    return () => { if (statusIntervalRef.current) clearInterval(statusIntervalRef.current); };
  }, [taskId, fetchTasks]);

  const handleRevoke = async (taskId: string) => {
    setRevokingId(taskId);
    try {
      await QuantumeService.revokeTask(taskId, true);
      await fetchTasks();
      if (currentTaskStatus?.task_id === taskId) setCurrentTaskStatus(null);
      if (taskId === taskId) setTaskId(null);
    } catch { /* ignore */ } finally {
      setRevokingId(null);
    }
  };

  const stateChipColor = (state: string): 'default' | 'primary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (state.toUpperCase()) {
      case 'SUCCESS': return 'success';
      case 'FAILURE': return 'error';
      case 'PROGRESS':
      case 'STARTED':
      case 'ACTIVE':  return 'warning';
      case 'PENDING': return 'default';
      default:        return 'info';
    }
  };

  return (
    <Box>
      {/* ===== Carte : Générer une pré-liste ===== */}
      <Card
        elevation={0}
        sx={{
          mb: 3, border: '1px solid', borderColor: dgiColors.neutral[200],
          borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'visible',
        }}
      >
        {/* En-tête coloré */}
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 2.5, py: 2,
            bgcolor: dgiColors.primary.main,
            borderRadius: '8px 8px 0 0',
          }}
        >
          <Box
            sx={{
              p: 1, borderRadius: 1.5,
              bgcolor: alpha('#fff', 0.15),
              display: 'flex', alignItems: 'center',
            }}
          >
            <FormatListBulletedIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#fff" lineHeight={1.2}>
              Générer une pré-liste
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.75) }}>
              Extraction des contribuables à risque selon le quantum sélectionné
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Corps */}
        <Box sx={{ p: 2.5 }}>
          {genSuccess && (
            <Alert severity="success" sx={{ mb: 2, py: 0.5 }} onClose={() => setGenSuccess(null)}>
              {genSuccess}
              {taskId && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
                  ID de tâche : {taskId}
                </Typography>
              )}
            </Alert>
          )}
          {genError && (
            <Alert severity="error" sx={{ mb: 2, py: 0.5 }} onClose={() => setGenError(null)}>
              {genError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Quantum</InputLabel>
              <Select
                value={selectedId}
                label="Quantum"
                onChange={(e) => setSelectedId(e.target.value as number)}
                disabled={quantumesLoading}
              >
                {quantumesLoading && (
                  <MenuItem disabled value="">Chargement…</MenuItem>
                )}
                {!quantumesLoading && quantumes.length === 0 && (
                  <MenuItem disabled value="">Aucun quantum disponible</MenuItem>
                )}
                {quantumes.map((q) => (
                  <MenuItem key={q.id} value={q.id}>{q.libelle}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              size="medium"
              startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
              onClick={handleGenerate}
              disabled={generating || selectedId === ''}
              sx={{
                bgcolor: dgiColors.accent.main,
                '&:hover': { bgcolor: dgiColors.accent.light },
                '&:disabled': { bgcolor: alpha(dgiColors.accent.main, 0.4) },
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
                px: 3,
                boxShadow: `0 2px 8px ${alpha(dgiColors.accent.main, 0.35)}`,
              }}
            >
              {generating ? 'Génération en cours…' : 'Exécuter'}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
           Cette action enclenchera une operation en arriere plan!
             <span className='text-danger' > l'opération peut durer de 5 à 10 heures</span>

          </Typography>
        </Box>
      </Card>


      {/* ===== Carte : Tâches en cours ===== */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid', borderColor: dgiColors.neutral[200],
          borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'visible',
        }}
      >
        {/* En-tête */}
        <Box
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 2.5, py: 2,
            bgcolor: dgiColors.primary.main,
            borderRadius: '8px 8px 0 0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha('#fff', 0.15), display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="#fff" lineHeight={1.2}>
                Tâches en cours
              </Typography>
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.75) }}>
                Surveillance des analyses en arrière-plan
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Actualiser">
            <IconButton size="small" sx={{ color: '#fff' }} onClick={refreshTasks} disabled={tasksLoading}>
              {tasksLoading
                ? <CircularProgress size={16} color="inherit" />
                : <RefreshIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>

        <Divider />

        {/* Corps */}
        <Box sx={{ p: 2.5 }}>
          {/* Suivi détaillé de la tâche courante */}
          {currentTaskStatus && (
            <Box
              sx={{
                mb: activeTasks.length > 0 ? 2 : 0,
                p: 1.5, borderRadius: 1.5,
                bgcolor: dgiColors.neutral[50],
                border: '1px solid', borderColor: dgiColors.neutral[200],
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip size="small" label={currentTaskStatus.state} color={stateChipColor(currentTaskStatus.state)} />
                  <Typography variant="body2" fontWeight={600}>Analyse des risques</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    {currentTaskStatus.task_id.slice(0, 8)}…
                  </Typography>
                  {!['SUCCESS', 'FAILURE', 'REVOKED'].includes(currentTaskStatus.state) && (
                    <Tooltip title="Annuler la tâche">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={revokingId === currentTaskStatus.task_id}
                          onClick={() => handleRevoke(currentTaskStatus.task_id)}
                        >
                          {revokingId === currentTaskStatus.task_id
                            ? <CircularProgress size={16} color="error" />
                            : <StopCircleIcon fontSize="small" />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              {currentTaskStatus.state === 'PENDING' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={12} />
                  <Typography variant="caption" color="text.secondary">En attente de démarrage…</Typography>
                </Box>
              )}

              {(currentTaskStatus.state === 'STARTED' || currentTaskStatus.state === 'ACTIVE') && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={12} />
                  <Typography variant="caption" color="text.secondary">
                    {currentTaskStatus.status || "En cours d'exécution…"}
                  </Typography>
                </Box>
              )}

              {currentTaskStatus.state === 'PROGRESS' && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">{currentTaskStatus.status}</Typography>
                    <Typography variant="caption" fontWeight={700}>{currentTaskStatus.percent ?? 0}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={currentTaskStatus.percent ?? 0} sx={{ borderRadius: 1 }} />
                </Box>
              )}

              {currentTaskStatus.state === 'SUCCESS' && (
                <Typography variant="caption" sx={{ color: 'success.main' }}>
                  ✓&nbsp;{String(currentTaskStatus.result?.nb_contribuables ?? '—')} contribuables —&nbsp;
                  {String(currentTaskStatus.result?.nb_indicateurs ?? '—')} indicateurs calculés
                </Typography>
              )}

              {currentTaskStatus.state === 'FAILURE' && (
                <Typography variant="caption" color="error.main">
                  {currentTaskStatus.error || 'La tâche a échoué.'}
                </Typography>
              )}
            </Box>
          )}

          {/* Liste des tâches actives des workers */}
          {activeTasks.map((t) => (
            <Box
              key={t.task_id}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                py: 1,
                borderBottom: '1px solid', borderColor: dgiColors.neutral[200],
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip size="small" label={t.state} color="warning" />
                <Typography variant="body2">{t.name.replace('app.', '')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  {t.task_id.slice(0, 8)}…
                </Typography>
                <Tooltip title="Annuler la tâche">
                  <span>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={revokingId === t.task_id}
                      onClick={() => handleRevoke(t.task_id)}
                    >
                      {revokingId === t.task_id
                        ? <CircularProgress size={16} color="error" />
                        : <StopCircleIcon fontSize="small" />}
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          ))}

          {/* État vide */}
          {!currentTaskStatus && activeTasks.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Aucune tâche en cours d'exécution
              </Typography>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
            Actualisation automatique toutes les 5 secondes
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default Parametres;

