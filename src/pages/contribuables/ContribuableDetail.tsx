/**
 * Page de détail d'un contribuable avec visualisation de tous les indicateurs
 * Utilise Plotly pour les graphiques interactifs
 */
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  alpha,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Autocomplete,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import Plot from "react-plotly.js";
import StatService, {
  type ContribuableData,
  type ContribuableIndicator,
  type SearchResult,
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

// Interface pour les onglets
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const ContribuableDetail = () => {
  const { ifu } = useParams<{ ifu: string }>();
  const navigate = useNavigate();


  // États
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contribuable, setContribuable] = useState<ContribuableData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");

  // Charger les données du contribuable
  const loadContribuable = useCallback(async (ifuToLoad: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await StatService.getContribuableIndicators(ifuToLoad);

      if (response.success) {
        setContribuable(response.contribuable);
      } else {
        setError("Contribuable non trouvé");
      }
    } catch (err: unknown) {
      console.error("Erreur:", err);
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger au montage si IFU présent
  useEffect(() => {
    if (ifu) {
      loadContribuable(ifu);
    }
  }, [ifu, loadContribuable]);

  // Recherche de contribuables
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await StatService.searchContribuables(query, 10);
      if (response.success) {
        setSearchResults(response.results);
      }
    } catch (err) {
      console.error("Erreur recherche:", err);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Sélectionner un contribuable
  const handleSelectContribuable = (result: SearchResult | null) => {
    if (result) {
      navigate(`/contribuables/detail/${result.ifu}`);
    }
  };

  // Filtrer les indicateurs par année
  const getFilteredIndicators = (): ContribuableIndicator[] => {
    if (!contribuable) return [];
    
    if (selectedYear === "all") {
      return contribuable.indicators;
    }

    return contribuable.indicators.map((ind) => {
      const yearData = ind.data.find((d) => d.annee === selectedYear);
      return {
        ...ind,
        risque: yearData?.risque || null,
        score: yearData?.score || null,
        gap: yearData?.gap || null,
      };
    });
  };

  // Données pour le graphique pie des risques
  const getPieData = () => {
    if (!contribuable) return null;

    const { risk_counts } = contribuable;
    const total = risk_counts.rouge + risk_counts.jaune + risk_counts.vert + risk_counts.non_disponible;
    
    if (total === 0) return null;

    return {
      labels: ["Élevé (Rouge)", "Moyen (Jaune)", "Faible (Vert)", "Non disponible"],
      values: [risk_counts.rouge, risk_counts.jaune, risk_counts.vert, risk_counts.non_disponible],
      colors: [dgiColors.secondary.main, dgiColors.accent.main, dgiColors.primary.main, dgiColors.neutral[400]],
    };
  };

  // Données pour le graphique bar des scores
  const getBarData = () => {
    const indicators = getFilteredIndicators();
    const scoredIndicators = indicators
      .filter((i) => i.score !== null && i.score > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 15);

    if (scoredIndicators.length === 0) return null;

    return {
      labels: scoredIndicators.map((i) => i.name),
      values: scoredIndicators.map((i) => i.score || 0),
      colors: scoredIndicators.map((i) => StatService.getRiskColor(i.risque)),
      gaps: scoredIndicators.map((i) => i.gap || 0),
    };
  };

  // Données pour l'évolution temporelle
  const getTimelineData = () => {
    if (!contribuable || contribuable.years_available.length < 2) return null;

    const years = contribuable.years_available.sort();
    
    // Calculer le score total par année
    const scoresByYear = years.map((year) => {
      let totalScore = 0;
      contribuable.indicators.forEach((ind) => {
        const yearData = ind.data.find((d) => d.annee === year);
        if (yearData?.score) {
          totalScore += yearData.score;
        }
      });
      return totalScore;
    });

    // Compter les risques par année
    const risksByYear = years.map((year) => {
      const counts = { rouge: 0, jaune: 0, vert: 0 };
      contribuable.indicators.forEach((ind) => {
        const yearData = ind.data.find((d) => d.annee === year);
        const risque = (yearData?.risque || "").toLowerCase();
        if (risque === "rouge") counts.rouge++;
        else if (risque === "jaune") counts.jaune++;
        else if (risque === "vert") counts.vert++;
      });
      return counts;
    });

    return { years, scores: scoresByYear, risks: risksByYear };
  };

  // Icône de risque
  const getRiskIcon = (risque: string | null) => {
    const level = (risque || "").toLowerCase();
    if (level === "rouge") return <ErrorIcon fontSize="small" />;
    if (level === "jaune") return <WarningIcon fontSize="small" />;
    if (level === "vert") return <CheckCircleIcon fontSize="small" />;
    return <InfoIcon fontSize="small" />;
  };

  // Rendu de la barre de recherche
  const renderSearchBar = () => (
    <Paper
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        border: `1px solid ${dgiColors.neutral[200]}`,
      }}
    >
      <Autocomplete
        freeSolo
        options={searchResults}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : `${option.ifu} - ${option.nom || "Sans nom"}`
        }
        inputValue={searchQuery}
        onInputChange={(_, value) => setSearchQuery(value)}
        onChange={(_, value) => handleSelectContribuable(value as SearchResult | null)}
        loading={searching}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Rechercher par IFU ou nom..."
            variant="outlined"
            size="small"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: dgiColors.neutral[500] }} />
                </InputAdornment>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.ifu}>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {option.ifu}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.nom || "Sans nom"} {option.structure && `• ${option.structure}`}
              </Typography>
            </Box>
          </li>
        )}
      />
    </Paper>
  );

  // Rendu des informations du contribuable
  const renderContribuableInfo = () => {
    if (!contribuable) return null;

    const { info, score_total, risk_counts, indicators_count, years_available } = contribuable;

    return (
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: `1px solid ${dgiColors.neutral[200]}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <BusinessIcon sx={{ color: dgiColors.primary.main }} />
                <Typography variant="h5" fontWeight={700} color={dgiColors.neutral[900]}>
                  {info.NOM_MINEFID || info.RAISON_SOCIALE || "Contribuable"}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontFamily: "monospace", color: dgiColors.primary.main }}>
                IFU: {contribuable.ifu}
              </Typography>
            </Box>
            <Chip
              label={info.ETAT || "N/A"}
              color={info.ETAT === "ACTIF" ? "success" : "default"}
              size="small"
            />
          </Box>

          <Grid container spacing={3}>
            {/* Informations générales */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {info.STRUCTURES && (
                  <Typography variant="body2">
                    <strong>Structure:</strong> {info.STRUCTURES}
                  </Typography>
                )}
                {info.CODE_SECT_ACT && (
                  <Typography variant="body2">
                    <strong>Secteur d'activité:</strong> {info.CODE_SECT_ACT}
                  </Typography>
                )}
                {info.CODE_REG_FISC && (
                  <Typography variant="body2">
                    <strong>Régime fiscal:</strong> {info.CODE_REG_FISC}
                  </Typography>
                )}
                {years_available.length > 0 && (
                  <Typography variant="body2">
                    <strong>Années disponibles:</strong> {years_available.join(", ")}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Statistiques rapides */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      backgroundColor: alpha(dgiColors.primary.main, 0.05),
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h4" fontWeight={700} color={dgiColors.primary.main}>
                      {StatService.formatNumber(score_total, 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Score Total
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      backgroundColor: alpha(dgiColors.accent.main, 0.05),
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h4" fontWeight={700} color={dgiColors.accent.main}>
                      {indicators_count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Indicateurs
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Chip
                      icon={<ErrorIcon />}
                      label={risk_counts.rouge}
                      size="small"
                      sx={{
                        backgroundColor: alpha(dgiColors.secondary.main, 0.1),
                        color: dgiColors.secondary.main,
                      }}
                    />
                    <Typography variant="caption" display="block" color="text.secondary">
                      Rouge
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Chip
                      icon={<WarningIcon />}
                      label={risk_counts.jaune}
                      size="small"
                      sx={{
                        backgroundColor: alpha(dgiColors.accent.main, 0.1),
                        color: dgiColors.accent.main,
                      }}
                    />
                    <Typography variant="caption" display="block" color="text.secondary">
                      Jaune
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={risk_counts.vert}
                      size="small"
                      sx={{
                        backgroundColor: alpha(dgiColors.primary.main, 0.1),
                        color: dgiColors.primary.main,
                      }}
                    />
                    <Typography variant="caption" display="block" color="text.secondary">
                      Vert
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Rendu des graphiques
  const renderCharts = () => {
    const pieData = getPieData();
    const barData = getBarData();
    const timelineData = getTimelineData();

    return (
      <Grid container spacing={3}>
        {/* Distribution des risques */}
        {pieData && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 3, border: `1px solid ${dgiColors.neutral[200]}`, height: "100%" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Distribution des Niveaux de Risque
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Plot
                    data={[
                      {
                        type: "pie",
                        labels: pieData.labels,
                        values: pieData.values,
                        marker: { colors: pieData.colors },
                        textinfo: "label+percent",
                        hoverinfo: "label+value+percent",
                        hole: 0.4,
                      },
                    ]}
                    layout={{
                      autosize: true,
                      margin: { t: 10, b: 10, l: 10, r: 10 },
                      showlegend: false,
                      paper_bgcolor: "transparent",
                      plot_bgcolor: "transparent",
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Top scores */}
        {barData && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 3, border: `1px solid ${dgiColors.neutral[200]}`, height: "100%" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Top Indicateurs par Score
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Plot
                    data={[
                      {
                        type: "bar",
                        x: barData.values,
                        y: barData.labels,
                        orientation: "h",
                        marker: { color: barData.colors },
                        text: barData.values.map((v) => v.toFixed(1)),
                        textposition: "outside",
                        hovertemplate: "<b>%{y}</b><br>Score: %{x}<extra></extra>",
                      },
                    ]}
                    layout={{
                      autosize: true,
                      margin: { t: 10, b: 40, l: 120, r: 40 },
                      xaxis: { title: "Score" },
                      yaxis: { automargin: true },
                      paper_bgcolor: "transparent",
                      plot_bgcolor: "transparent",
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Évolution temporelle */}
        {timelineData && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: 3, border: `1px solid ${dgiColors.neutral[200]}` }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Évolution des Scores par Année
                </Typography>
                <Box sx={{ height: 350 }}>
                  <Plot
                    data={[
                      {
                        type: "scatter",
                        mode: "lines+markers",
                        name: "Score Total",
                        x: timelineData.years,
                        y: timelineData.scores,
                        line: { color: dgiColors.primary.main, width: 3 },
                        marker: { size: 10 },
                      },
                      {
                        type: "bar",
                        name: "Risques Élevés",
                        x: timelineData.years,
                        y: timelineData.risks.map((r) => r.rouge),
                        marker: { color: alpha(dgiColors.secondary.main, 0.7) },
                        yaxis: "y2",
                      },
                      {
                        type: "bar",
                        name: "Risques Moyens",
                        x: timelineData.years,
                        y: timelineData.risks.map((r) => r.jaune),
                        marker: { color: alpha(dgiColors.accent.main, 0.7) },
                        yaxis: "y2",
                      },
                    ]}
                    layout={{
                      autosize: true,
                      margin: { t: 30, b: 50, l: 60, r: 60 },
                      barmode: "stack",
                      xaxis: { title: "Année", tickformat: "d" },
                      yaxis: { title: "Score Total", side: "left" },
                      yaxis2: { title: "Nombre de Risques", side: "right", overlaying: "y" },
                      legend: { orientation: "h", y: 1.1 },
                      paper_bgcolor: "transparent",
                      plot_bgcolor: "transparent",
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };

  // Rendu du tableau des indicateurs
  const renderIndicatorsTable = () => {
    const indicators = getFilteredIndicators();

    return (
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          border: `1px solid ${dgiColors.neutral[200]}`,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: dgiColors.neutral[100] }}>
              <TableCell sx={{ fontWeight: 600 }}>Indicateur</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Niveau de Risque
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Score
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Gap (FCFA)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {indicators.map((indicator) => {
              const risqueColor = StatService.getRiskColor(indicator.risque);

              return (
                <TableRow
                  key={indicator.id}
                  sx={{
                    "&:hover": { backgroundColor: alpha(dgiColors.primary.main, 0.04) },
                    borderLeft: `3px solid ${risqueColor}`,
                  }}
                >
                  <TableCell>
                    <Tooltip title={`ID: ${indicator.id}`}>
                      <Typography variant="body2">{indicator.name}</Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    {indicator.risque && indicator.risque !== "Non disponible" ? (
                      <Chip
                        icon={getRiskIcon(indicator.risque)}
                        label={StatService.getRiskLabel(indicator.risque)}
                        size="small"
                        sx={{
                          backgroundColor: alpha(risqueColor, 0.1),
                          color: risqueColor,
                          fontWeight: 500,
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/D
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {indicator.score !== null ? (
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={indicator.score > 5 ? dgiColors.secondary.main : "inherit"}
                      >
                        {StatService.formatNumber(indicator.score, 1)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {indicator.gap !== null && indicator.gap > 0 ? (
                      <Typography variant="body2" fontWeight={500}>
                        {StatService.formatNumber(indicator.gap, 0)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // État vide (pas de contribuable sélectionné)
  if (!ifu && !contribuable) {
    return (
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, color: dgiColors.neutral[900], mb: 3 }}>
          Analyse d'un Contribuable
        </Typography>

        {renderSearchBar()}

        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            border: `1px solid ${dgiColors.neutral[200]}`,
            textAlign: "center",
          }}
        >
          <AssessmentIcon sx={{ fontSize: 60, color: dgiColors.neutral[400], mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Sélectionnez un contribuable
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Utilisez la barre de recherche ci-dessus pour trouver un contribuable par son IFU ou son nom.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/contribuables/search")} sx={{ color: dgiColors.primary.main }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600, color: dgiColors.neutral[900] }}>
          Analyse du Contribuable
        </Typography>
      </Box>

      {/* Barre de recherche */}
      {renderSearchBar()}

      {/* Chargement */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: dgiColors.primary.main }} />
        </Box>
      )}

      {/* Erreur */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Contenu */}
      {contribuable && !loading && (
        <>
          {/* Informations du contribuable */}
          {renderContribuableInfo()}

          {/* Filtre par année */}
          {contribuable.years_available.length > 1 && (
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <CalendarIcon sx={{ color: dgiColors.neutral[500] }} />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Année</InputLabel>
                <Select
                  value={selectedYear}
                  label="Année"
                  onChange={(e) => setSelectedYear(e.target.value as number | "all")}
                >
                  <MenuItem value="all">Toutes les années</MenuItem>
                  {contribuable.years_available.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Onglets */}
          <Paper sx={{ borderRadius: 3, border: `1px solid ${dgiColors.neutral[200]}` }}>
            <Tabs
              value={tabValue}
              onChange={(_, v) => setTabValue(v)}
              sx={{
                borderBottom: `1px solid ${dgiColors.neutral[200]}`,
                "& .MuiTab-root": { fontWeight: 500 },
                "& .Mui-selected": { color: dgiColors.primary.main },
                "& .MuiTabs-indicator": { backgroundColor: dgiColors.primary.main },
              }}
            >
              <Tab icon={<TrendingUpIcon />} iconPosition="start" label="Graphiques" />
              <Tab icon={<AssessmentIcon />} iconPosition="start" label="Tableau des Indicateurs" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              <TabPanel value={tabValue} index={0}>
                {renderCharts()}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {renderIndicatorsTable()}
              </TabPanel>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default ContribuableDetail;
