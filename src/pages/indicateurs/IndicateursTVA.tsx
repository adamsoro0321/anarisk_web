import { Box, Typography, Paper, alpha } from "@mui/material";
import { PieChart as PieChartIcon } from "@mui/icons-material";

const dgiColors = {
  accent: { main: "#CE8E00" },
  neutral: { 200: "#EEEEEE", 500: "#9E9E9E", 900: "#212121" },
};

const IndicateursTVA = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, color: dgiColors.neutral[900], mb: 3 }}>
        Indicateurs TVA
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
            backgroundColor: alpha(dgiColors.accent.main, 0.1),
            display: "flex", alignItems: "center", justifyContent: "center", mb: 2,
          }}
        >
          <PieChartIcon sx={{ fontSize: 40, color: dgiColors.accent.main }} />
        </Box>
        <Typography variant="h6" sx={{ color: dgiColors.neutral[900], mb: 1 }}>
          Analyse des indicateurs TVA
        </Typography>
        <Typography variant="body2" sx={{ color: dgiColors.neutral[500], textAlign: "center" }}>
          Cette section affichera les indicateurs de risque liés à la TVA.
        </Typography>
      </Paper>
    </Box>
  );
};

export default IndicateursTVA;
