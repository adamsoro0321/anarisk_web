import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  alpha,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import IndicateurService from "../../services/indicateur.services";
import type { Indicateur } from "../../services/indicateur.services";
import IndicateurDetailView from "../../components/IndicateurDetailView";


const dgiColors = {
  primary: { main: "#006B3F", light: "#2E8B57", dark: "#004D2C" },
  accent: { main: "#CE8E00", light: "#E6A817" },
  secondary: { main: "#CE1126", light: "#E53945" },
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    500: "#9E9E9E",
    700: "#616161",
    900: "#212121",
  },
};

const Indicateurs = () => {
  const [indicateurs, setIndicateurs] = useState<Indicateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndicateur, setSelectedIndicateur] = useState<Indicateur | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    loadIndicateurs();
  }, []);

  const loadIndicateurs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await IndicateurService.getAll();

      if (response.success) {
        setIndicateurs(response.data);
      } else {
        setError("Erreur lors du chargement des indicateurs");
      }
    } catch (err) {
      setError("Erreur lors du chargement des indicateurs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (indicateur: Indicateur) => {
    setSelectedIndicateur(indicateur);
    setDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setSelectedIndicateur(null);
  };

  // Statistiques
  const stats = {
    total: indicateurs.length,
    actifs: indicateurs.filter((i) => i.actif).length,
    implementes: indicateurs.filter((i) => i.implemente?.toLowerCase() === "oui").length,
    criticite5: indicateurs.filter((i) => i.criticite === "5").length,
  };

  const columns: GridColDef[] = [
    {
      field: "code_indicateur",
      headerName: "Code",
      width: 120,
      headerClassName: "table-header",
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: dgiColors.primary.main,
            fontFamily: "monospace",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "intitule",
      headerName: "Intitulé",
      width: 300,
      headerClassName: "table-header",
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "criticite",
      headerName: "Criticité",
      width: 100,
      headerClassName: "table-header",
      renderCell: (params: GridRenderCellParams) => {
        const level = params.value ? parseInt(params.value as string) : 0;
        const getColor = () => {
          if (level >= 5) return dgiColors.secondary.main;
          if (level >= 3) return dgiColors.accent.main;
          return dgiColors.primary.main;
        };
        return (
          <Chip
            label={params.value || "N/A"}
            size="small"
            sx={{
              backgroundColor: alpha(getColor(), 0.15),
              color: getColor(),
              fontWeight: 700,
              fontSize: "0.75rem",
            }}
          />
        );
      },
    },
    {
      field: "impots_controle",
      headerName: "Impôts",
      width: 150,
      headerClassName: "table-header",
    },
    {
      field: "type_controle",
      headerName: "Type",
      width: 100,
      headerClassName: "table-header",
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value || "N/A"}
          size="small"
          sx={{
            backgroundColor: alpha(dgiColors.primary.light, 0.1),
            color: dgiColors.primary.dark,
            fontWeight: 600,
            fontSize: "0.7rem",
          }}
        />
      ),
    },
    {
      field: "implemente",
      headerName: "Implémenté",
      width: 120,
      headerClassName: "table-header",
      renderCell: (params: GridRenderCellParams) => {
        const isImplemented = params.value?.toLowerCase() === "oui";
        return (
          <Chip
            label={params.value || "Non"}
            size="small"
            sx={{
              backgroundColor: isImplemented
                ? alpha("#4CAF50", 0.15)
                : alpha(dgiColors.neutral[500], 0.1),
              color: isImplemented ? "#2E7D32" : dgiColors.neutral[700],
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          />
        );
      },
    },
    {
      field: "regimes_concernes",
      headerName: "Régimes",
      width: 140,
      headerClassName: "table-header",
    },
    {
      field: "actif",
      headerName: "Statut",
      width: 100,
      headerClassName: "table-header",
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? "Actif" : "Inactif"}
          size="small"
          sx={{
            backgroundColor: params.value
              ? alpha(dgiColors.primary.main, 0.15)
              : alpha(dgiColors.neutral[500], 0.1),
            color: params.value ? dgiColors.primary.dark : dgiColors.neutral[700],
            fontWeight: 600,
            fontSize: "0.7rem",
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      headerClassName: "table-header",
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          onClick={() => handleViewDetails(params.row as Indicateur)}
          sx={{
            color: dgiColors.primary.main,
            "&:hover": {
              backgroundColor: alpha(dgiColors.primary.main, 0.1),
            },
          }}
          title="Voir tous les détails"
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: dgiColors.primary.main }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header avec titre et statistiques */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            color: dgiColors.neutral[900],
            fontWeight: 700,
          }}
        >
          Indicateurs de Risque Fiscal
        </Typography>

        {/* Statistiques */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Paper
            elevation={0}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              border: `2px solid ${alpha(dgiColors.primary.main, 0.2)}`,
              background: `linear-gradient(135deg, ${alpha(
                dgiColors.primary.main,
                0.05
              )} 0%, #fff 100%)`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: dgiColors.neutral[700],
                fontWeight: 600,
                textTransform: "uppercase",
                fontSize: "0.7rem",
                letterSpacing: "0.5px",
              }}
            >
              Total
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: dgiColors.primary.main,
                lineHeight: 1.2,
              }}
            >
              {stats.total}
            </Typography>
          </Paper>

      

          <Paper
            elevation={0}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              border: `2px solid ${alpha(dgiColors.accent.main, 0.2)}`,
              background: `linear-gradient(135deg, ${alpha(
                dgiColors.accent.main,
                0.05
              )} 0%, #fff 100%)`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: dgiColors.neutral[700],
                fontWeight: 600,
                textTransform: "uppercase",
                fontSize: "0.7rem",
                letterSpacing: "0.5px",
              }}
            >
              Implémentés
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: dgiColors.accent.main,
                lineHeight: 1.2,
              }}
            >
              {stats.implementes}
            </Typography>
          </Paper>

      
        </Box>
      </Box>

      {/* Liste des indicateurs */}
      <Paper
        sx={{
          borderRadius: 3,
          border: `1px solid ${dgiColors.neutral[200]}`,
          overflow: "hidden",
          p: 3,
        }}
      >
        <DataGrid
              rows={indicateurs}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25 },
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              autoHeight
              getRowClassName={(params) => {
                const level = params.row.criticite ? parseInt(params.row.criticite) : 0;
                return level >= 5 ? "criticite-5" : "";
              }}
              sx={{
                border: "none",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: dgiColors.primary.main,
                  color: "white",
                  borderColor: dgiColors.neutral[200],
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: 700,
                  color: "white",
                },
                "& .table-header": {
                  backgroundColor: dgiColors.primary.main,
                  color: "white !important",
                },
                "& .MuiDataGrid-cell": {
                  borderColor: dgiColors.neutral[200],
                },
                "& .MuiDataGrid-footerContainer": {
                  borderColor: dgiColors.neutral[200],
                },
                "& .criticite-5": {
                  backgroundColor: alpha(dgiColors.secondary.light, 0.05),
                  "&:hover": {
                    backgroundColor: alpha(dgiColors.secondary.light, 0.1),
                  },
                },
              }}
            />
      </Paper>

      {/* Modal de détails */}
      <Dialog
        open={detailModalOpen}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${dgiColors.neutral[200]}`,
            pb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AssessmentIcon sx={{ color: dgiColors.primary.main, fontSize: 32 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: dgiColors.neutral[900] }}>
                Détails Complets de l'Indicateur
              </Typography>
              {selectedIndicateur && (
                <Typography variant="body2" sx={{ color: dgiColors.neutral[500], mt: 0.5 }}>
                  {selectedIndicateur.code_indicateur} - Toutes les variables (28 champs)
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              color: dgiColors.neutral[700],
              "&:hover": {
                backgroundColor: alpha(dgiColors.secondary.main, 0.1),
                color: dgiColors.secondary.main,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {selectedIndicateur && <IndicateurDetailView indicateur={selectedIndicateur} />}
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: `1px solid ${dgiColors.neutral[200]}`,
            px: 3,
            py: 2,
          }}
        >
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            sx={{
              borderColor: dgiColors.neutral[200],
              color: dgiColors.neutral[700],
              "&:hover": {
                borderColor: dgiColors.neutral[500],
                backgroundColor: dgiColors.neutral[100],
              },
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Indicateurs;
