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
import QuantumeService, { type QuantumeItem } from "../../services/quantume.service";
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
  
  // États pour les quantums
  const [quantumes, setQuantumes] = useState<QuantumeItem[]>([]);
  const [selectedQuantume, setSelectedQuantume] = useState<number | string | null>(null);
  
  // États pour les indicateurs
  const [indicators, setIndicators] = useState<IndicatorListItem[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");
  const [indicatorData, setIndicatorData] = useState<IndicatorDistributionResponse | null>(null);
  const [loadingIndicator, setLoadingIndicator] = useState(false);

  // Chargement des quantums au montage
  useEffect(() => {
    const fetchQuantumes = async () => {
      try {
        const response = await QuantumeService.getAll();
        if (response.success) {
          setQuantumes(response.data);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des quantums:", err);
      }
    };
    
    fetchQuantumes();
  }, []);

  // Chargement des données au montage et au changement de quantum
  useEffect(() => {
    // Ne charger que si un quantum a été explicitement sélectionné
    if (selectedQuantume === null) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer le libellé du quantum sélectionné
        const quantumeLibelle = selectedQuantume 
          ? quantumes.find(q => q.id === selectedQuantume)?.libelle 
          : undefined;

        // Charger les statistiques et la liste des indicateurs en parallèle
        const [statsResponse, indicatorsResponse] = await Promise.all([
          StatService.getStats(quantumeLibelle),
          StatService.listIndicators(quantumeLibelle),
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
        
        // Message d'erreur plus spécifique
        const errorMessage = selectedQuantume 
          ? `Données non disponibles pour le quantum sélectionné. Essayez un autre quantum ou revenez à "Tous les quantums".`
          : "Impossible de charger les données. Vérifiez la connexion au serveur.";
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedQuantume, quantumes]);

  // Charger les données de l'indicateur sélectionné
  useEffect(() => {
    if (!selectedIndicator || selectedQuantume === null) return;

    const fetchIndicatorData = async () => {
      try {
        setLoadingIndicator(true);
        
        // Récupérer le libellé du quantum sélectionné
        const quantumeLibelle = selectedQuantume 
          ? quantumes.find(q => q.id === selectedQuantume)?.libelle 
          : undefined;
        
        const response = await StatService.getIndicatorDistribution(
          selectedIndicator,
          quantumeLibelle ? { libelle_quantume: quantumeLibelle } : undefined
        );
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
  }, [selectedIndicator, selectedQuantume, quantumes]);

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

  //const statsCards = getStatsCards();

  return (
    <Box>
      {/* Titre de la page */}

      {/* Cartes Statistiques */}

      {/* Affichage de l'erreur sans bloquer l'interface */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Section Distribution par Indicateur */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: `1px solid ${dgiColors.neutral[200]}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* En-tête avec sélecteurs */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: dgiColors.neutral[800] }}>
              Distribution des Risques par Indicateur
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {/* Sélecteur Quantum */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Quantum</InputLabel>
                <Select
                  value={selectedQuantume ?? ''}
                  label="Quantum"
                  onChange={(e) => setSelectedQuantume(e.target.value === '' ? '' : e.target.value)}
                  displayEmpty
                  disabled={loading}
                >
                  <MenuItem value="">
                    <em>Tous les quantums</em>
                  </MenuItem>
                  {quantumes.map((q) => (
                    <MenuItem key={q.id} value={q.id}>
                      {q.libelle}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Sélecteur Indicateur */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Indicateur</InputLabel>
                <Select
                  value={selectedIndicator}
                  label="Indicateur"
                  onChange={(e) => setSelectedIndicator(e.target.value)}
                  disabled={loading || indicators.length === 0}
                >
                  {indicators.map((ind) => (
                    <MenuItem key={ind.id} value={ind.id}>
                      {ind.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Contenu */}
          {selectedQuantume === null ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <AssessmentIcon sx={{ fontSize: 64, color: dgiColors.neutral[300], mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Sélectionnez un quantum pour afficher les statistiques
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choisissez un quantum spécifique ou "Tous les quantums" dans le menu ci-dessus
              </Typography>
            </Box>
          ) : loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
              <CircularProgress sx={{ color: dgiColors.primary.main, mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Chargement des statistiques...
              </Typography>
            </Box>
          ) : loadingIndicator ? (
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
                            dgiColors.secondary.light,  // Rouge plus clair
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
                          backgroundColor: alpha(dgiColors.secondary.light, 0.1),
                          borderRadius: 2,
                          borderLeft: `4px solid ${dgiColors.secondary.light}`,
                        }}
                      >
                        <ErrorIcon sx={{ color: dgiColors.secondary.light, mb: 1 }} />
                        <Typography variant="h5" fontWeight={700} color={dgiColors.secondary.light}>
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
              {error ? (
                <>
                  <WarningIcon sx={{ fontSize: 48, color: dgiColors.neutral[400], mb: 2 }} />
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    Aucune donnée disponible pour ce quantum
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Sélectionnez un autre quantum ou revenez à "Tous les quantums"
                  </Typography>
                </>
              ) : (
                <Typography color="text.secondary">
                  Sélectionnez un indicateur pour voir sa distribution
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
