import { Box, Typography, Paper, CircularProgress, Alert } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import IndicateurService from "../../services/indicateur.services";
import type { Indicateur } from "../../services/indicateur.services";

const dgiColors = {
  accent: { main: "#006B3F" },
  neutral: { 200: "#EEEEEE", 500: "#9E9E9E", 900: "#212121" },
};

const Indicateurs = () => {
  const [indicateurs, setIndicateurs] = useState<Indicateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const columns: GridColDef[] = [
    {
      field: "code_indicateur",
      headerName: "Code",
      width: 120,
      headerClassName: "table-header",
    },
    {
      field: "intitule",
      headerName: "Intitulé",
      width: 250,
      headerClassName: "table-header",
    },
    {
      field: "impots_controle",
      headerName: "Impôts contrôle",
      width: 150,
      headerClassName: "table-header",
    },
    {
      field: "implemente",
      headerName: "Implémenté",
      width: 120,
      headerClassName: "table-header",
    },
    {
      field: "formule_calcul",
      headerName: "Formule de calcul",
      width: 200,
      headerClassName: "table-header",
    },
    {
      field: "regimes_concernes",
      headerName: "Régimes concernés",
      width: 180,
      headerClassName: "table-header",
    },
    {
      field: "forme_juridique",
      headerName: "Forme juridique",
      width: 150,
      headerClassName: "table-header",
    },
    {
      field: "criticite",
      headerName: "Criticité",
      width: 120,
      headerClassName: "table-header",
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: dgiColors.accent.main }} />
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
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3, 
          color: dgiColors.neutral[900],
          fontWeight: 600 
        }}
      >
        Liste des Indicateurs de Risque
      </Typography>

      <Paper
        sx={{
          borderRadius: 3,
          border: `1px solid ${dgiColors.neutral[200]}`,
          overflow: "hidden",
        }}
      >
        <DataGrid
          rows={indicateurs}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          autoHeight
          getRowClassName={(params) => {
            return params.row.criticite === "5" || params.row.criticite === 5
              ? "criticite-5"
              : "";
          }}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: dgiColors.accent.main,
              color: "white",
              borderColor: dgiColors.neutral[200],
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
              color: "white",
            },
            "& .table-header": {
              backgroundColor: dgiColors.accent.main,
              color: "white !important",
            },
            "& .MuiDataGrid-cell": {
              borderColor: dgiColors.neutral[200],
            },
            "& .MuiDataGrid-footerContainer": {
              borderColor: dgiColors.neutral[200],
            },
            "& .criticite-5": {
              backgroundColor: "#ffebee",
              "&:hover": {
                backgroundColor: "#ffcdd2",
              },
            },
            "& .criticite-5 .MuiDataGrid-cell": {
              color: "#c62828",
              fontWeight: 500,
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default Indicateurs;
