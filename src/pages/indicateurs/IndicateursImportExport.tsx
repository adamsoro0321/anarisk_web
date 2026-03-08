import { Box, Typography, Paper, alpha } from "@mui/material";
import { ShowChart as ShowChartIcon } from "@mui/icons-material";

const dgiColors = {
  primary: { main: "#006B3F" },
  neutral: { 200: "#EEEEEE", 500: "#9E9E9E", 900: "#212121" },
};

const IndicateursImportExport = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, color: dgiColors.neutral[900], mb: 3 }}>
        Indicateurs Import/Export
      </Typography>
      
      <Paper
        sx={{
          p: 4, borderRadius: 3,
          border: `1px solid ${dgiColors.neutral[200]}`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: 300,
        }}
      >
        <Box
          sx={{
            width: 80, height: 80, borderRadius: "50%",
            backgroundColor: alpha(dgiColors.primary.main, 0.1),
            display: "flex", alignItems: "center", justifyContent: "center", mb: 2,
          }}
        >
          <ShowChartIcon sx={{ fontSize: 40, color: dgiColors.primary.main }} />
        </Box>
        <Typography variant="h6" sx={{ color: dgiColors.neutral[900], mb: 1 }}>
          Analyse Import/Export
        </Typography>
        <Typography variant="body2" sx={{ color: dgiColors.neutral[500], textAlign: "center" }}>
          Cette section affichera les indicateurs de risque liés aux opérations d'import/export.
        </Typography>
      </Paper>
    </Box>
  );
};

export default IndicateursImportExport;
