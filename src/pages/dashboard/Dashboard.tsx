import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  alpha,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Dashboard as DashboardIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import Plot from "react-plotly.js";
import StatService, {
  type GlobalStats,
  type IndicatorListItem,
  type IndicatorDistributionResponse,
} from "../../services/stat.service";
import useAuthStore from "../../store/authStore";

// Palette DGI Burkina Faso
const dgiColors = {
  primary: { main: "#006B3F", light: "#2E8B57", dark: "#004D2C" },
  accent: { main: "#CE8E00", light: "#E6A817", dark: "#996600" },
  secondary: { main: "#CE1126", light: "#E53945", dark: "#9C0D1C" },
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },
};

const Dashboard = () => {
  // États pour les données
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const user = useAuthStore((state) => state.user); // Forcer la réévaluation du composant lors du changement d'utilisateur
  
  // États pour les indicateurs
  const [indicators, setIndicators] = useState<IndicatorListItem[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");
  const [indicatorData, setIndicatorData] = useState<IndicatorDistributionResponse | null>(null);
  const [loadingIndicator, setLoadingIndicator] = useState(false);

  // Chargement des données au montage
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Charger les statistiques et la liste des indicateurs en parallèle
        const [statsResponse, indicatorsResponse] = await Promise.all([
          StatService.getStats(),
          StatService.listIndicators(),
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.stats);
        }

        if (indicatorsResponse.success && indicatorsResponse.indicators.length > 0) {
          setIndicators(indicatorsResponse.indicators);
          // Sélectionner le premier indicateur par défaut
          setSelectedIndicator(indicatorsResponse.indicators[0].id);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données. Vérifiez la connexion au serveur.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Charger les données de l'indicateur sélectionné
  useEffect(() => {
    if (!selectedIndicator) return;

    const fetchIndicatorData = async () => {
      try {
        setLoadingIndicator(true);
        const response = await StatService.getIndicatorDistribution(selectedIndicator);
        if (response.success) {
          setIndicatorData(response);
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'indicateur:", err);
      } finally {
        setLoadingIndicator(false);
      }
    };

    fetchIndicatorData();
  }, [selectedIndicator]);

  // Cartes statistiques
  const getStatsCards = () => {
    if (!stats) {
      return [
        { title: "Contribuables", value: "-", icon: <PeopleIcon />, color: dgiColors.primary.main },
        { title: "Indicateurs", value: "-", icon: <AssessmentIcon />, color: dgiColors.accent.main },
        { title: "Colonnes", value: "-", icon: <DashboardIcon />, color: dgiColors.primary.light },
      ];
    }

    return [
      {
        title: "Contribuables",
        value: StatService.formatNumber(stats.total_contribuables, 0),
        icon: <PeopleIcon />,
        color: dgiColors.primary.main,
      },
      {
        title: "Indicateurs",
        value: indicators.length.toString(),
        icon: <AssessmentIcon />,
        color: dgiColors.accent.main,
      },
      {
        title: "Colonnes Analysées",
        value: stats.columns.length.toString(),
        icon: <DashboardIcon />,
        color: dgiColors.primary.light,
      },
    ];
  };

  // Affichage du chargement
  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: dgiColors.primary.main, mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Chargement des statistiques...
        </Typography>
      </Box>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  //const statsCards = getStatsCards();

  return (
    <Box>
      {/* Titre de la page */}

      {/* Cartes Statistiques */}


      {/* Section Distribution par Indicateur */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: `1px solid ${dgiColors.neutral[200]}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* En-tête avec sélecteur */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: dgiColors.neutral[800] }}>
              Distribution des Risques par Indicateur
            </Typography>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Indicateur</InputLabel>
              <Select
                value={selectedIndicator}
                label="Indicateur"
                onChange={(e) => setSelectedIndicator(e.target.value)}
              >
                {indicators.map((ind) => (
                  <MenuItem key={ind.id} value={ind.id}>
                    {ind.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Contenu */}
          {loadingIndicator ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={40} sx={{ color: dgiColors.primary.main }} />
            </Box>
          ) : indicatorData ? (
            <Grid container spacing={3}>
              {/* Graphique Pie */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ height: 350 }}>
                  <Plot
                    data={[
                      {
                        type: "pie",
                        labels: ["Rouge (Élevé)", "Jaune (Moyen)", "Vert (Faible)", "Non disponible"],
                        values: [
                          indicatorData.distribution.counts.rouge || 0,
                          indicatorData.distribution.counts.jaune || 0,
                          indicatorData.distribution.counts.vert || 0,
                          indicatorData.distribution.counts.non_disponible || 0,
                        ],
                        marker: {
                          colors: [
                            dgiColors.secondary.main,
                            dgiColors.accent.main,
                            dgiColors.primary.main,
                            dgiColors.neutral[400],
                          ],
                        },
                        textinfo: "label+percent",
                        hoverinfo: "label+value+percent",
                        hole: 0.45,
                        textposition: "outside",
                      },
                    ]}
                    layout={{
                      autosize: true,
                      margin: { t: 30, b: 30, l: 30, r: 30 },
                      showlegend: false,
                      paper_bgcolor: "transparent",
                      plot_bgcolor: "transparent",
                      annotations: [
                        {
                          text: `${indicatorData.distribution.total_evaluated}`,
                          showarrow: false,
                          font: { size: 24, color: dgiColors.neutral[800] },
                        },
                      ],
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Box>
              </Grid>

              {/* Statistiques détaillées */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%", justifyContent: "center" }}>
                  {/* Cartes de comptage */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 4 }}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: "center",
                          backgroundColor: alpha(dgiColors.secondary.main, 0.1),
                          borderRadius: 2,
                          borderLeft: `4px solid ${dgiColors.secondary.main}`,
                        }}
                      >
                        <ErrorIcon sx={{ color: dgiColors.secondary.main, mb: 1 }} />
                        <Typography variant="h5" fontWeight={700} color={dgiColors.secondary.main}>
                          {indicatorData.distribution.counts.rouge || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Rouge ({indicatorData.distribution.percentages.rouge || 0}%)
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: "center",
                          backgroundColor: alpha(dgiColors.accent.main, 0.1),
                          borderRadius: 2,
                          borderLeft: `4px solid ${dgiColors.accent.main}`,
                        }}
                      >
                        <WarningIcon sx={{ color: dgiColors.accent.main, mb: 1 }} />
                        <Typography variant="h5" fontWeight={700} color={dgiColors.accent.main}>
                          {indicatorData.distribution.counts.jaune || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Jaune ({indicatorData.distribution.percentages.jaune || 0}%)
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: "center",
                          backgroundColor: alpha(dgiColors.primary.main, 0.1),
                          borderRadius: 2,
                          borderLeft: `4px solid ${dgiColors.primary.main}`,
                        }}
                      >
                        <CheckCircleIcon sx={{ color: dgiColors.primary.main, mb: 1 }} />
                        <Typography variant="h5" fontWeight={700} color={dgiColors.primary.main}>
                          {indicatorData.distribution.counts.vert || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Vert ({indicatorData.distribution.percentages.vert || 0}%)
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Statistiques de score si disponibles */}
                  {indicatorData.score_stats && (
                    <Paper sx={{ p: 2, borderRadius: 2, border: `1px solid ${dgiColors.neutral[200]}` }}>
                      <Typography variant="subtitle2" fontWeight={600} color={dgiColors.neutral[700]} gutterBottom>
                        Statistiques de Score
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Moyenne</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {StatService.formatNumber(indicatorData.score_stats.mean)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Max</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {StatService.formatNumber(indicatorData.score_stats.max)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  )}

                  {/* Gap total si disponible */}
                  {indicatorData.gap_stats && (
                    <Paper sx={{ p: 2, borderRadius: 2, border: `1px solid ${dgiColors.neutral[200]}` }}>
                      <Typography variant="subtitle2" fontWeight={600} color={dgiColors.neutral[700]} gutterBottom>
                        Gap Fiscal Total
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color={dgiColors.secondary.main}>
                        {StatService.formatNumber(indicatorData.gap_stats.sum, 0)} FCFA
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        sur {indicatorData.gap_stats.count} contribuables
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Grid>

              {/* Tableau des top risques pour cet indicateur */}
              {indicatorData.top_risks && indicatorData.top_risks.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" fontWeight={600} color={dgiColors.neutral[800]} sx={{ mb: 2, mt: 2 }}>
                    Top 10 Contribuables à Risque pour cet Indicateur
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${dgiColors.neutral[200]}`, borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: dgiColors.neutral[100] }}>
                          <TableCell sx={{ fontWeight: 600 }}>IFU</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">Risque</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Score</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Gap (FCFA)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {indicatorData.top_risks.map((risk, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              "&:hover": { backgroundColor: alpha(dgiColors.primary.main, 0.04) },
                              borderLeft: `3px solid ${StatService.getRiskColor(risk.risque)}`,
                            }}
                          >
                            <TableCell sx={{ fontFamily: "monospace" }}>{risk.ifu}</TableCell>
                            <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {risk.nom || "-"}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={StatService.getRiskLabel(risk.risque)}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(StatService.getRiskColor(risk.risque), 0.1),
                                  color: StatService.getRiskColor(risk.risque),
                                  fontWeight: 500,
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600}>
                                {risk.score !== null ? StatService.formatNumber(risk.score, 1) : "-"}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {risk.gap ? StatService.formatNumber(risk.gap, 0) : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
            </Grid>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">
                Sélectionnez un indicateur pour voir sa distribution
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
