import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  alpha,
  Grid,
  CircularProgress,
  Chip,
  Alert,
} from "@mui/material";
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import Plot from "react-plotly.js";
import StatService, {
  type RiskColorsDistributionResponse,
} from "../../services/stat.service";

const dgiColors = {
  primary: { main: "#006B3F", light: "#2E8B57", dark: "#004D2C" },
  accent: { main: "#CE8E00" },
  secondary: { main: "#CE1126" },
  orange: "#FF9800",
  neutral: { 50: "#FAFAFA", 100: "#F5F5F5", 200: "#EEEEEE", 500: "#9E9E9E", 700: "#616161", 800: "#424242", 900: "#212121" },
};

// Métadonnées des couleurs de risque
const riskColorMeta = [
  { key: "rouge", label: "Rouge (Élevé)", icon: <ErrorIcon />, color: dgiColors.secondary.main },
  { key: "orange", label: "Orange (Modéré)", icon: <WarningIcon />, color: dgiColors.orange },
  { key: "jaune", label: "Jaune (Moyen)", icon: <WarningIcon />, color: dgiColors.accent.main },
  { key: "vert", label: "Vert (Faible)", icon: <CheckCircleIcon />, color: dgiColors.primary.main },
  { key: "non_disponible", label: "N/D", icon: <RemoveCircleIcon />, color: dgiColors.neutral[500] },
];

const DashboardStats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RiskColorsDistributionResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await StatService.getRiskColorsDistribution();
        if (res.success) {
          setData(res);
        } else {
          setError("Impossible de charger les statistiques");
        }
      } catch (err) {
        console.error("Erreur:", err);
        setError("Erreur lors du chargement des statistiques de risque.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!data) return null;

  // Préparer les données pour le graphique pie (distribution globale)
  const pieLabels = riskColorMeta.map((c) => c.label);
  const pieValues = riskColorMeta.map((c) => data.global_distribution.counts[c.key] || 0);
  const pieColors = riskColorMeta.map((c) => c.color);

  // Préparer les données pour le graphique bar (contribuables uniques)
  const barLabels = riskColorMeta.filter(c => c.key !== "non_disponible").map((c) => c.label.split(" ")[0]);
  const barValues = riskColorMeta.filter(c => c.key !== "non_disponible").map((c) => data.unique_contribuables.counts[c.key] || 0);
  const barColors = riskColorMeta.filter(c => c.key !== "non_disponible").map((c) => c.color);

  return (
    <Box>
      {/* Graphiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Graphique Pie - Distribution globale */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${dgiColors.neutral[200]}`, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: dgiColors.neutral[800], mb: 2 }}>
              Répartition Globale des Évaluations
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
              Total: {StatService.formatNumber(data.global_distribution.total_evaluations, 0)} évaluations
            </Typography>
            <Box sx={{ height: 320 }}>
              <Plot
                data={[
                  {
                    type: "pie",
                    labels: pieLabels,
                    values: pieValues,
                    marker: { colors: pieColors },
                    textinfo: "label+percent",
                    hoverinfo: "label+value+percent",
                    hole: 0.45,
                    textposition: "outside",
                  },
                ]}
                layout={{
                  autosize: true,
                  margin: { t: 20, b: 40, l: 20, r: 20 },
                  showlegend: false,
                  paper_bgcolor: "transparent",
                  plot_bgcolor: "transparent",
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: "100%", height: "100%" }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Graphique Bar - Contribuables uniques */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${dgiColors.neutral[200]}`, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: dgiColors.neutral[800], mb: 2 }}>
              Contribuables par Couleur Dominante
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
              Classement par risque le plus critique
            </Typography>
            <Box sx={{ height: 320 }}>
              <Plot
                data={[
                  {
                    type: "bar",
                    x: barLabels,
                    y: barValues,
                    marker: { color: barColors },
                    text: barValues.map(v => StatService.formatNumber(v, 0)),
                    textposition: "outside",
                    hoverinfo: "x+y",
                  },
                ]}
                layout={{
                  autosize: true,
                  margin: { t: 20, b: 60, l: 60, r: 20 },
                  paper_bgcolor: "transparent",
                  plot_bgcolor: "transparent",
                  xaxis: { title: "" },
                  yaxis: { title: "Nombre de contribuables" },
                  bargap: 0.3,
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: "100%", height: "100%" }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Détails par couleur */}
      <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${dgiColors.neutral[200]}` }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: dgiColors.neutral[800], mb: 3 }}>
          Détail par Niveau de Risque
        </Typography>
        <Grid container spacing={2}>
          {riskColorMeta.map((c) => (
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={c.key}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: "center",
                  backgroundColor: alpha(c.color, 0.08),
                  borderRadius: 2,
                  borderLeft: `4px solid ${c.color}`,
                }}
              >
                <Box sx={{ color: c.color, mb: 1 }}>{c.icon}</Box>
                <Typography variant="h5" fontWeight={700} color={c.color}>
                  {StatService.formatNumber(data.global_distribution.counts[c.key] || 0, 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  {c.label.split(" ")[0]}
                </Typography>
                <Chip
                  label={`${data.global_distribution.percentages[c.key] || 0}%`}
                  size="small"
                  sx={{ mt: 1, backgroundColor: alpha(c.color, 0.15), color: c.color, fontWeight: 600 }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Section contribuables uniques */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: dgiColors.neutral[800], mb: 2 }}>
            Contribuables Uniques par Couleur Dominante
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            {data.unique_contribuables.description}
          </Typography>
          <Grid container spacing={1}>
            {riskColorMeta.map((c) => (
              <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={c.key}>
                <Chip
                  icon={<Box sx={{ color: c.color, display: "flex" }}>{c.icon}</Box>}
                  label={`${c.label.split(" ")[0]}: ${StatService.formatNumber(data.unique_contribuables.counts[c.key] || 0, 0)} (${data.unique_contribuables.percentages[c.key] || 0}%)`}
                  sx={{
                    width: "100%",
                    justifyContent: "flex-start",
                    backgroundColor: alpha(c.color, 0.08),
                    color: dgiColors.neutral[800],
                    fontWeight: 500,
                    "& .MuiChip-icon": { color: c.color },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardStats;
