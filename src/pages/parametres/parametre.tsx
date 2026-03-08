import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardActionArea, CardContent, alpha,
  Button, CircularProgress, Alert, Divider, FormControl,
  InputLabel, Select, MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DomainIcon from '@mui/icons-material/Domain';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { dgiColors } from './_dgiColors';
import QuantumeService, { type QuantumeItem } from '../../services/quantume.service';

interface NavCard {
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  path: string;
}

const cards: NavCard[] = [
  {
    label: 'Brigades',
    subtitle: 'Créer, modifier et supprimer les brigades de contrôle fiscal',
    icon: <DomainIcon sx={{ fontSize: 36, color: dgiColors.primary.main }} />,
    path: '/parametres/brigades',
  },
  {
    label: 'Quantumes',
    subtitle: 'Gérer les périodes de programmation des contrôles',
    icon: <CalendarViewWeekIcon sx={{ fontSize: 36, color: dgiColors.primary.main }} />,
    path: '/parametres/quantumes',
  },
];

const Parametres: React.FC = () => {
  const navigate = useNavigate();

  // --- Pré-liste state ---
  const [quantumes, setQuantumes]             = useState<QuantumeItem[]>([]);
  const [quantumesLoading, setQuantumesLoading] = useState(false);
  const [selectedId, setSelectedId]           = useState<number | ''>('');
  const [generating, setGenerating]           = useState(false);
  const [genSuccess, setGenSuccess]           = useState<string | null>(null);
  const [genError, setGenError]               = useState<string | null>(null);
  const [taskId, setTaskId]                   = useState<string | null>(null);

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
      const res = await QuantumeService.generate(quantume.id, quantume.libelle);
      if (res.success) {
        const msg = res.message ?? `Pré-liste lancée pour le quantum « ${quantume.libelle} ».`;
        setGenSuccess(msg);
        if (res.task_id) setTaskId(res.task_id);
        setTimeout(() => setGenSuccess(null), 8000);
      } else {
        setGenError(res.message ?? 'Erreur lors de la génération.');
      }
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : 'Erreur lors de la génération.');
    } finally {
      setGenerating(false);
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
            La pré-liste sera générée en fonction des indicateurs de risque calculés pour le quantum choisi.
          </Typography>
        </Box>
      </Card>

      {/* Cartes de navigation */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        {cards.map((card) => (
          <Card
            key={card.path}
            elevation={0}
            sx={{
              border: '1px solid', borderColor: dgiColors.neutral[200],
              borderRadius: 2, transition: 'box-shadow 0.2s, border-color 0.2s',
              '&:hover': {
                boxShadow: `0 4px 16px ${alpha(dgiColors.primary.main, 0.15)}`,
                borderColor: dgiColors.primary.main,
              },
            }}
          >
            <CardActionArea onClick={() => navigate(card.path)} sx={{ p: 0 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                <Box
                  sx={{
                    p: 1.5, borderRadius: 2,
                    bgcolor: alpha(dgiColors.primary.main, 0.08),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={700} color={dgiColors.primary.main}>
                    {card.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {card.subtitle}
                  </Typography>
                </Box>
                <ArrowForwardIosIcon sx={{ fontSize: 16, color: dgiColors.neutral[700], flexShrink: 0 }} />
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Parametres;

