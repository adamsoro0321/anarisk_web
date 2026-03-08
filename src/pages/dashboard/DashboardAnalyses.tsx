import { Box, Typography, Paper, alpha } from "@mui/material";
import { Analytics as AnalyticsIcon } from "@mui/icons-material";

const dgiColors = {
  primary: { main: "#006B3F", light: "#2E8B57", dark: "#004D2C" },
  accent: { main: "#CE8E00" },
  neutral: { 200: "#EEEEEE", 500: "#9E9E9E", 900: "#212121" },
};

const DashboardAnalyses = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, color: dgiColors.neutral[900], mb: 3 }}>
        Analyses
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
          <AnalyticsIcon sx={{ fontSize: 40, color: dgiColors.accent.main }} />
        </Box>
        <Typography variant="h6" sx={{ color: dgiColors.neutral[900], mb: 1 }}>
          Analyses avancées
        </Typography>
        <Typography variant="body2" sx={{ color: dgiColors.neutral[500], textAlign: "center" }}>
          Cette section permettra d'effectuer des analyses avancées sur les données fiscales.
        </Typography>
      </Paper>
    </Box>
  );
};

export default DashboardAnalyses;
