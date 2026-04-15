import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Card, alpha,
  Button, CircularProgress, Alert, Divider, FormControl,
  InputLabel, Select, MenuItem, Chip, LinearProgress, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TableChartIcon from '@mui/icons-material/TableChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArticleIcon from '@mui/icons-material/Article';
import AddIcon from '@mui/icons-material/Add';
import { dgiColors } from './_dgiColors';
import QuantumeService, { type QuantumeItem, type TaskItem, type TaskStatusResponse, type QuantumeStatusItem } from '../../services/quantume.service';
import TaskMonitor from '../../components/TaskMonitor';
import { FormDialog } from './_paramHelpers';





const Parametres: React.FC = () => {

  // --- Pré-liste state ---
  const [quantumes, setQuantumes]             = useState<QuantumeItem[]>([]);
  const [quantumesLoading, setQuantumesLoading] = useState(false);
  const [selectedId, setSelectedId]           = useState<number | ''>('');
  const [generating, setGenerating]           = useState(false);
  const [genSuccess, setGenSuccess]           = useState<string | null>(null);
  const [genError, setGenError]               = useState<string | null>(null);
  const [taskId, setTaskId]                   = useState<string | null>(null);
  const [generatingFiches, setGeneratingFiches] = useState(false);
  const [fichesSuccess, setFichesSuccess]       = useState<string | null>(null);
  const [fichesError, setFichesError]           = useState<string | null>(null);

  // --- Statut des quantumes ---
  const [quantumesStatus, setQuantumesStatus]       = useState<QuantumeStatusItem[]>([]);
  const [statusLoading, setStatusLoading]           = useState(false);

  // --- Tâches en cours ---
  const [activeTasks, setActiveTasks]             = useState<TaskItem[]>([]);
  const [tasksLoading, setTasksLoading]           = useState(false);
  const [currentTaskStatus, setCurrentTaskStatus] = useState<TaskStatusResponse | null>(null);
  const statusIntervalRef                         = useRef<ReturnType<typeof setInterval> | null>(null);
  const [revokingId, setRevokingId]               = useState<string | null>(null);

  // --- Création de quantum ---
  const [createDialog, setCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateQuantume = () => {
    setCreateDialog(true);
    setCreateError(null);
  };

  const handleSubmitQuantume = async (libelle: string) => {
    setCreateLoading(true);
    setCreateError(null);
    try {
      await QuantumeService.create(libelle);
      setGenSuccess('Quantum créé avec succès.');
      setTimeout(() => setGenSuccess(null), 3000);
      setCreateDialog(false);
      // Rafraîchir la liste des quantumes
      fetchQuantumes();
      fetchStatus();
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : 'Erreur lors de la création');
    } finally {
      setCreateLoading(false);
    }
  };

  const fetchStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await QuantumeService.getStatus();
      if (res.success) setQuantumesStatus(res.data);
    } catch { /* ignore */ } finally {
      setStatusLoading(false);
    }
  }, []);

  const fetchQuantumes = useCallback(async () => {
    setQuantumesLoading(true);
    try {
      const res = await QuantumeService.getAll();
      if (res.success) setQuantumes(res.data);
    } catch { /* silently ignore */ } finally {
      setQuantumesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuantumes();
    fetchStatus();
  }, [fetchStatus, fetchQuantumes]);

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

  const handleGenerateFiches = async () => {
    if (selectedId === '') return;
    const quantume = quantumes.find((q) => q.id === selectedId);
    if (!quantume) return;
    setGeneratingFiches(true); setFichesSuccess(null); setFichesError(null);
    try {
      const res = await QuantumeService.generateFiches(quantume.libelle);
      if (res.success) {
        setFichesSuccess(res.message ?? `Génération des fiches lancée pour « ${quantume.libelle} ».`);
        setTimeout(() => setFichesSuccess(null), 8000);
      } else {
        setFichesError(res.message ?? 'Erreur lors de la génération des fiches.');
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || (e instanceof Error ? e.message : 'Erreur lors de la génération des fiches.');

      setFichesError(message);
    } finally {
      setGeneratingFiches(false);
    }
  };

  const fetchTasks = useCallback(async () => {
    try {
      const res = await QuantumeService.getTasks();
      if (res.success) {
        setActiveTasks(res.data);
        // Auto-detect : si aucune tâche n'est suivie, suivre la première active
        setTaskId(prev => {
          if (!prev && res.data.length > 0) {
            const first = res.data.find(t => t.state === 'ACTIVE') ?? res.data[0];
            return first?.task_id ?? null;
          }
          return prev;
        });
      }
    } catch { /* ignore */ }
  }, []);



  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [fetchTasks]);


  return (
    <Box>
      {/* ===== Carte : Suivi des quantumes ===== */}
      <Card
        elevation={0}
        sx={{
          mb: 3, border: '1px solid', borderColor: dgiColors.neutral[200],
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
              <TableChartIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="#fff" lineHeight={1.2}>
                Suivi des quantumes
              </Typography>
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.75) }}>
                Disponibilité des pré-listes, programmes et fiches par quantum
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleCreateQuantume}
            sx={{
              bgcolor: '#fff',
              color: dgiColors.primary.main,
              fontWeight: 700,
              textTransform: 'none',
              px: 2,
              '&:hover': {
                bgcolor: alpha('#fff', 0.9),
              },
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            Quantum
          </Button>
        </Box>

        <Divider />

        {/* Tableau */}
        <TableContainer sx={{ px: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: dgiColors.neutral[50] }}>
                <TableCell sx={{ fontWeight: 700, color: dgiColors.primary.main }}>Quantum</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: dgiColors.primary.main }}>Pré-liste</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: dgiColors.primary.main }}>Programme</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: dgiColors.primary.main }}>Fiches</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statusLoading && quantumesStatus.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={20} />
                  </TableCell>
                </TableRow>
              )}
              {!statusLoading && quantumesStatus.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 2, color: 'text.secondary' }}>
                    Aucun quantum disponible
                  </TableCell>
                </TableRow>
              )}
              {quantumesStatus.map((q) => (
                <TableRow
                  key={q.id}
                  sx={{ '&:last-child td': { borderBottom: 0 }, '&:hover': { bgcolor: alpha(dgiColors.primary.main, 0.03) } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{q.libelle}</Typography>
                    {q.date_creation && (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(q.date_creation).toLocaleDateString('fr-FR')}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Pré-liste */}
                  <TableCell align="center">
                    <Tooltip title={q.preliste.exists && q.preliste.info
                      ? `${q.preliste.info.name}${q.preliste.info.size_formatted ? ' · ' + q.preliste.info.size_formatted : ''}`
                      : 'Non disponible'}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        {q.preliste.exists
                          ? <><CheckCircleIcon sx={{ color: 'success.main', fontSize: 18 }} />
                              <Typography variant="caption" sx={{ color: 'success.main' }}>
                                {q.preliste.info?.type === 'dossier' ? 'Dossier' : 'CSV'}
                              </Typography></>
                          : <CancelIcon sx={{ color: dgiColors.neutral[300], fontSize: 18 }} />}
                      </Box>
                    </Tooltip>
                  </TableCell>

                  {/* Programme */}
                  <TableCell align="center">
                    <Tooltip title={q.programme.exists && q.programme.info
                      ? `${q.programme.info.name} · ${q.programme.info.size_formatted}`
                      : 'Non disponible'}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        {q.programme.exists
                          ? <><CheckCircleIcon sx={{ color: 'success.main', fontSize: 18 }} />
                              <Typography variant="caption" sx={{ color: 'success.main' }}>Excel</Typography></>
                          : <CancelIcon sx={{ color: dgiColors.neutral[300], fontSize: 18 }} />}
                      </Box>
                    </Tooltip>
                  </TableCell>

                  {/* Fiches */}
                  <TableCell align="center">
                    <Tooltip title={q.fiches.exists && q.fiches.info
                      ? `${q.fiches.info.nb_fiches} fiche(s)`
                      : 'Non disponible'}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        {q.fiches.exists
                          ? <><CheckCircleIcon sx={{ color: 'success.main', fontSize: 18 }} />
                              <Typography variant="caption" sx={{ color: 'success.main' }}>
                                {q.fiches.info?.nb_fiches ?? 0} fiche(s)
                              </Typography></>
                          : <CancelIcon sx={{ color: dgiColors.neutral[300], fontSize: 18 }} />}
                      </Box>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

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

        {/* Corps : deux colonnes */}
        <Box sx={{ p: 2.5, display: 'flex', gap: 2, flexWrap: 'wrap' }}>

          {/* ── Colonne gauche : Pré-liste ── */}
          <Box sx={{ flex: 1, minWidth: 260 }}>
            <Typography variant="caption" fontWeight={700} color={dgiColors.primary.main} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
              Pré-liste
            </Typography>
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
              Cette action enclenchera une opération en arrière-plan !
              <span className='text-danger'> L'opération peut durer de 5 à 10 heures</span>
            </Typography>
          </Box>

          {/* Séparateur vertical */}
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

          {/* ── Colonne droite : Fiches ── */}
          <Box sx={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <Typography variant="caption" fontWeight={700} color={dgiColors.primary.main} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
              Fiches individuelles
            </Typography>
            {fichesSuccess && (
              <Alert severity="success" sx={{ mb: 2, py: 0.5 }} onClose={() => setFichesSuccess(null)}>
                {fichesSuccess}
              </Alert>
            )}
            {fichesError && (
              <Alert severity="error" sx={{ mb: 2, py: 0.5 }} onClose={() => setFichesError(null)}>
                {fichesError}
              </Alert>
            )}
            <Button
              variant="outlined"
              size="medium"
              startIcon={generatingFiches ? <CircularProgress size={16} color="inherit" /> : <ArticleIcon />}
              onClick={handleGenerateFiches}
              disabled={generatingFiches || selectedId === ''}
              sx={{
                borderColor: dgiColors.primary.main,
                color: dgiColors.primary.main,
                fontWeight: 700,
                textTransform: 'none',
                px: 3,
                '&:hover': { bgcolor: alpha(dgiColors.primary.main, 0.06) },
                '&:disabled': { opacity: 0.4 },
                alignSelf: 'flex-start',
              }}
            >
              {generatingFiches ? 'Génération en cours…' : 'Générer les fiches'}
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
              Génère les fiches individuelles pour chaque contribuable retenu dans le programme.
            </Typography>
          </Box>

        </Box>
      </Card>



      {/* ===== Section : Monitoring détaillé de la tâche ===== */}
      {taskId && (
        <Box sx={{ mt: 3 }}>
          <TaskMonitor
            taskId={taskId}
            autoRefresh={true}
            refreshInterval={3000}
            showLogs={true}
            onTaskComplete={(task) => {
              // Callback quand la tâche se termine
              if (task.status === 'SUCCESS') {
                setGenSuccess(`Tâche "${task.task_name}" terminée avec succès !`);
                setTimeout(() => setGenSuccess(null), 8000);
              } else if (task.status === 'FAILURE') {
                setGenError(`Tâche "${task.task_name}" a échoué : ${task.error || 'Erreur inconnue'}`);
              }
              // Rafraîchir les statuts
              fetchStatus();
            }}
          />
        </Box>
      )}

      {/* Dialog de création de quantum */}
      <FormDialog
        open={createDialog}
        title="Ajouter un quantum"
        initialValue=""
        onClose={() => {
          setCreateDialog(false);
          setCreateError(null);
        }}
        onSubmit={handleSubmitQuantume}
        loading={createLoading}
        error={createError}
      />
    </Box>
  );
};

export default Parametres;

