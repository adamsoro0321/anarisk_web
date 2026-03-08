import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import ContribuableService, {
  type IndicateursResponse,
  type AnneeIndicateurs,
} from "../services/Contribuable.service";

// ========== Couleurs DGI ==========
const riskColors: Record<string, string> = {
  rouge: "#CE1126",
  orange: "#E65100",
  jaune: "#CE8E00",
  vert: "#006B3F",
};

const getRiskColor = (risque: string | null): string => {
  if (!risque) return "#9E9E9E";
  return riskColors[risque.toLowerCase()] || "#9E9E9E";
};

const getRiskIcon = (risque: string | null) => {
  const level = (risque || "").toLowerCase();
  if (level === "rouge") return <ErrorIcon fontSize="small" />;
  if (level === "jaune" || level === "orange") return <WarningIcon fontSize="small" />;
  if (level === "vert") return <CheckCircleIcon fontSize="small" />;
  return <InfoIcon fontSize="small" />;
};

// ========== Props ==========
export interface InfoDataItem {
  label: string;
  value: string;
}

interface IndicateurRiskViewProps {
  numIFU: string;
  infoData?: InfoDataItem[];
}

/**
 * Structure pour afficher un indicateur par année
 */
interface IndicatorRow {
  indicateur: string;
  byYear: Record<
    string,
    { risque: string | null; score: number | null; gap: number | null }
  >;
}

// ========== Composant ==========
const IndicateurRiskView: React.FC<IndicateurRiskViewProps> = ({
  numIFU,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  infoData,
}) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IndicateursResponse | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("all");

  // Charger les indicateurs du contribuable
  const loadIndicateurs = useCallback(async (ifu: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ContribuableService.getContribuableIndicators(ifu);
      console.log("response",response)
      if (response.success) {
        setData(response);
      } else {
        setError("Aucun indicateur trouvé pour ce contribuable");
      }
    } catch (err: unknown) {
      console.error("Erreur chargement indicateurs:", err);
      const msg =
        err instanceof Error ? err.message : "Erreur lors du chargement";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (numIFU) {
      loadIndicateurs(numIFU);
    }
  }, [numIFU, loadIndicateurs]);

  // Construire les lignes du tableau (indicateurs × années)
  const buildIndicatorRows = (): IndicatorRow[] => {
    if (!data?.annees) return [];

    const rowMap = new Map<string, IndicatorRow>();

    for (const [anneeKey, anneeData] of Object.entries(data.annees)) {
      for (const ind of (anneeData as AnneeIndicateurs).indicateurs) {
        if (!rowMap.has(ind.indicateur)) {
          rowMap.set(ind.indicateur, {
            indicateur: ind.indicateur,
            byYear: {},
          });
        }
        rowMap.get(ind.indicateur)!.byYear[anneeKey] = {
          risque: ind.risque,
          score: ind.score,
          gap: ind.gap,
        };
      }
    }

    return Array.from(rowMap.values());
  };

  const formatAmount = (amount: number | null): string => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatScore = (score: number | null): string => {
    if (score === null || score === undefined) return "-";
    return score.toFixed(1);
  };

  // Années à afficher
  const years: string[] = data?.years_available?.map(String) || [];
  const displayYears =
    selectedYear === "all" ? years : years.filter((y) => y === selectedYear);
  const rows = buildIndicatorRows();

  // ========== Rendu ==========

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress sx={{ color: "#006B3F" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info">
        Aucune donnée d'indicateur disponible.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Résumé */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >

        {/* Filtre par année */}
        {years.length > 1 && (
          <FormControl size="small" sx={{ minWidth: 140, ml: "auto" }}>
            <InputLabel>Année</InputLabel>
            <Select
              value={selectedYear}
              label="Année"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <MenuItem value="all">Toutes</MenuItem>
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Tableau des indicateurs par année */}
      <Box>
        <Typography variant="h6" color="success.main" gutterBottom sx={{ mb: 2 }}>
          Indicateurs de Risque ({data.nb_indicateurs_total})
        </Typography>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{ maxHeight: 600, overflow: "auto" }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    minWidth: 220,
                    position: "sticky",
                    left: 0,
                    backgroundColor: "#f5f5f5",
                    zIndex: 3,
                  }}
                >
                  Indicateur
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 80 }}>
                  Détail
                </TableCell>
                {displayYears.map((year) => (
                  <TableCell
                    key={year}
                    sx={{ fontWeight: "bold", minWidth: 130 }}
                    align="center"
                  >
                    {year || "N/A"}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <React.Fragment key={row.indicateur}>
                  {/* Ligne Risque */}
                  <TableRow
                    sx={{
                      "&:hover": { backgroundColor: alpha("#006B3F", 0.04) },
                    }}
                  >
                    <TableCell
                      rowSpan={3}
                      sx={{
                        fontWeight: 500,
                        borderRight: "1px solid #e0e0e0",
                        position: "sticky",
                        left: 0,
                        backgroundColor: "#fff",
                        zIndex: 1,
                      }}
                    >
                        <Typography variant="body2" fontWeight={500}>
                        {row.indicateur}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        color: "#757575",
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      Risque
                    </TableCell>
                    {displayYears.map((year) => {
                      const cellData = row.byYear[year];
                      const risque = cellData?.risque || null;
                      const color = getRiskColor(risque);
                      return (
                        <TableCell key={year} align="center">
                          {risque && risque !== "Non disponible" ? (
                            <Chip
                              icon={getRiskIcon(risque)}
                              label={risque}
                              size="small"
                              sx={{
                                backgroundColor: alpha(color, 0.12),
                                color: color,
                                fontWeight: 500,
                                fontSize: "0.7rem",
                              }}
                            />
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              N/D
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>

                  {/* Ligne Score */}
                  <TableRow
                    sx={{
                      "&:hover": { backgroundColor: alpha("#006B3F", 0.04) },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        color: "#757575",
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      Score
                    </TableCell>
                    {displayYears.map((year) => {
                      const cellData = row.byYear[year];
                      const score = cellData?.score ?? null;
                      return (
                        <TableCell key={year} align="center">
                          <Typography
                            variant="body2"
                            fontWeight={score && score > 5 ? 700 : 400}
                            color={
                              score && score > 5 ? "#CE1126" : "text.primary"
                            }
                          >
                            {formatScore(score)}
                          </Typography>
                        </TableCell>
                      );
                    })}
                  </TableRow>

                  {/* Ligne Gap */}
                  <TableRow
                    sx={{
                      "&:hover": { backgroundColor: alpha("#006B3F", 0.04) },
                      borderBottom: "2px solid #e0e0e0",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        color: "#757575",
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      Gap (FCFA)
                    </TableCell>
                    {displayYears.map((year) => {
                      const cellData = row.byYear[year];
                      const gap = cellData?.gap ?? null;
                      return (
                        <TableCell key={year} align="center">
                          <Typography variant="body2">
                            {formatAmount(gap)}
                          </Typography>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default IndicateurRiskView;