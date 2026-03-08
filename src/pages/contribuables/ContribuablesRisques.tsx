import { Box, Typography, Paper, alpha } from "@mui/material";
import { Assessment as AssessmentIcon } from "@mui/icons-material";

const dgiColors = {
  secondary: { main: "#CE1126" },
  neutral: { 200: "#EEEEEE", 500: "#9E9E9E", 900: "#212121" },
};

const ContribuablesRisques = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, color: dgiColors.neutral[900], mb: 3 }}>
        Profils à risque
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
            backgroundColor: alpha(dgiColors.secondary.main, 0.1),
            display: "flex", alignItems: "center", justifyContent: "center", mb: 2,
          }}
        >
          <AssessmentIcon sx={{ fontSize: 40, color: dgiColors.secondary.main }} />
        </Box>
        <Typography variant="h6" sx={{ color: dgiColors.neutral[900], mb: 1 }}>
          Contribuables à risque
        </Typography>
        <Typography variant="body2" sx={{ color: dgiColors.neutral[500], textAlign: "center" }}>
          Cette section affichera les contribuables identifiés comme présentant des risques fiscaux.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ContribuablesRisques;
