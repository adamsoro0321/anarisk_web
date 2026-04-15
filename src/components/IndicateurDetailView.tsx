import { Box, Typography, Paper, Grid, Chip, Divider, alpha } from "@mui/material";
import {
  InfoOutlined,
  Calculate,
  Assessment,
  Category,
  CheckCircle,
  Info,
  CalendarToday,
} from "@mui/icons-material";
import type { Indicateur } from "../services/indicateur.services";

// Palette DGI
const dgiColors = {
  primary: { main: "#006B3F", light: "#2E8B57", dark: "#004D2C" },
  accent: { main: "#CE8E00", light: "#E6A817", dark: "#996600" },
  secondary: { main: "#CE1126", light: "#E53945", dark: "#9C0D1C" },
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    500: "#9E9E9E",
    700: "#616161",
    900: "#212121",
  },
};

interface IndicateurDetailViewProps {
  indicateur: Indicateur;
}

const IndicateurDetailView: React.FC<IndicateurDetailViewProps> = ({ indicateur }) => {
  // Fonction pour formater les dates
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Non disponible";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fonction pour obtenir la couleur de criticité
  const getCriticitéColor = (criticite?: string | null) => {
    const level = criticite ? parseInt(criticite) : 0;
    if (level >= 5) return dgiColors.secondary.main;
    if (level >= 3) return dgiColors.accent.main;
    return dgiColors.primary.main;
  };

  // Section de détail générique
  const DetailSection = ({
    title,
    icon,
    children,
    color = dgiColors.primary.main,
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    color?: string;
  }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        border: `2px solid ${alpha(color, 0.2)}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.02)} 0%, ${alpha(
          "#fff",
          0.98
        )} 100%)`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: alpha(color, 0.1),
            color: color,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: color,
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  );

  // Ligne de détail
  const DetailRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={12} md={4}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: dgiColors.neutral[700],
            fontSize: "0.9rem",
          }}
        >
          {label}
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <Typography
          variant="body2"
          sx={{
            color: dgiColors.neutral[900],
            fontSize: "0.9rem",
            lineHeight: 1.6,
          }}
        >
          {value || <em style={{ color: dgiColors.neutral[500] }}>Non renseigné</em>}
        </Typography>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      {/* En-tête avec informations principales */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${dgiColors.primary.main} 0%, ${dgiColors.primary.dark} 100%)`,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: alpha("#fff", 0.05),
          }}
        />
        
        <Box sx={{ position: "relative" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Chip
              label={indicateur.code_indicateur}
              sx={{
                backgroundColor: alpha("#fff", 0.2),
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.95rem",
                backdropFilter: "blur(10px)",
                border: `1px solid ${alpha("#fff", 0.3)}`,
              }}
            />
            <Chip
              label={`Criticité: ${indicateur.criticite || "N/A"}`}
              sx={{
                backgroundColor: getCriticitéColor(indicateur.criticite),
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            />
            <Chip
              label={indicateur.actif ? "Actif" : "Inactif"}
              icon={<CheckCircle sx={{ color: "#fff !important" }} />}
              sx={{
                backgroundColor: indicateur.actif
                  ? alpha("#4CAF50", 0.9)
                  : alpha(dgiColors.neutral[500], 0.8),
                color: "#fff",
                fontWeight: 600,
              }}
            />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 1.5,
              textShadow: "0 2px 8px rgba(0,0,0,0.2)",
              lineHeight: 1.3,
            }}
          >
            {indicateur.intitule}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              opacity: 0.9,
              fontSize: "1rem",
              lineHeight: 1.6,
            }}
          >
            {indicateur.objectif || "Aucun objectif défini"}
          </Typography>
        </Box>
      </Paper>

      {/* 1. DÉFINITION MÉTIER */}
      <DetailSection
        title="1. Définition Métier"
        icon={<InfoOutlined />}
        color={dgiColors.primary.main}
      >
        <DetailRow label="Axes de contrôle" value={indicateur.axes_controle} />
        <DetailRow label="Objectif" value={indicateur.objectif} />
        <DetailRow label="Désignation anomalie" value={indicateur.designation_anomalie} />
        <DetailRow label="Unité de mesure" value={indicateur.unite_mesure} />
      </DetailSection>

      {/* 2. CALCULS ET FORMULES */}
      <DetailSection
        title="2. Calculs et Formules"
        icon={<Calculate />}
        color={dgiColors.accent.main}
      >
        <DetailRow label="Variables de calcul" value={indicateur.variables_calcul} />
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: dgiColors.neutral[700],
                fontSize: "0.9rem",
              }}
            >
              Formule de calcul
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: alpha(dgiColors.accent.main, 0.05),
                border: `1px solid ${alpha(dgiColors.accent.main, 0.2)}`,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  color: dgiColors.accent.dark,
                  fontSize: "0.9rem",
                }}
              >
                {indicateur.formule_calcul || "Non définie"}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <DetailRow label="Seuil de déclenchement" value={indicateur.seuil_declenchement} />
        <DetailRow label="Règle de sélection" value={indicateur.regle_selection} />
        <DetailRow label="Calcul d'écart" value={indicateur.calcul_ecart} />
        <DetailRow label="Coefficient modération" value={indicateur.coefficient_moderation} />
        <DetailRow label="Impact recettes" value={indicateur.impact_recettes} />
      </DetailSection>

      {/* 3. ÉVALUATION DU RISQUE */}
      <DetailSection
        title="3. Évaluation du Risque"
        icon={<Assessment />}
        color={getCriticitéColor(indicateur.criticite)}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: alpha(getCriticitéColor(indicateur.criticite), 0.1),
                border: `2px solid ${alpha(
                  getCriticitéColor(indicateur.criticite),
                  0.3
                )}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: dgiColors.neutral[700],
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontSize: "0.7rem",
                }}
              >
                Niveau de Criticité
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: getCriticitéColor(indicateur.criticite),
                  mt: 1,
                }}
              >
                {indicateur.criticite || "N/A"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: alpha(dgiColors.primary.main, 0.05),
                border: `2px solid ${alpha(dgiColors.primary.main, 0.2)}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: dgiColors.neutral[700],
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontSize: "0.7rem",
                }}
              >
                Type de Contrôle
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: dgiColors.primary.dark,
                  mt: 1,
                }}
              >
                {indicateur.type_controle || "Non défini"}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DetailSection>

      {/* 4. CLASSIFICATION FISCALE */}
      <DetailSection
        title="4. Classification Fiscale"
        icon={<Category />}
        color={dgiColors.primary.light}
      >
        <DetailRow label="Type de contrôle" value={indicateur.type_controle} />
        <DetailRow label="Sources de données" value={indicateur.sources_donnees} />
        <DetailRow label="Impôts contrôlés" value={indicateur.impots_controle} />
        <DetailRow label="Segments concernés" value={indicateur.segments_concernes} />
        <DetailRow label="Régimes concernés" value={indicateur.regimes_concernes} />
        <DetailRow label="Forme juridique" value={indicateur.forme_juridique} />
      </DetailSection>

      {/* 5. MÉTADONNÉES */}
      <DetailSection title="5. Métadonnées" icon={<Info />} color={dgiColors.neutral[700]}>
        <DetailRow label="Implémenté" value={indicateur.implemente} />
        <DetailRow label="Limites" value={indicateur.limite} />
        <DetailRow label="Commentaires" value={indicateur.commentaires} />
        <DetailRow label="Type" value={indicateur.type} />
      </DetailSection>

      {/* 6. INFORMATIONS SYSTÈME */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: alpha(dgiColors.neutral[100], 0.5),
          border: `1px solid ${dgiColors.neutral[300]}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <CalendarToday sx={{ color: dgiColors.neutral[700], mr: 1.5 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: dgiColors.neutral[900],
            }}
          >
            Informations Système
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="caption"
              sx={{
                color: dgiColors.neutral[700],
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.7rem",
              }}
            >
              ID Système
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: dgiColors.neutral[900], fontWeight: 600, mt: 0.5 }}
            >
              #{indicateur.id}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              variant="caption"
              sx={{
                color: dgiColors.neutral[700],
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.7rem",
              }}
            >
              Statut
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: dgiColors.neutral[900], fontWeight: 600, mt: 0.5 }}
            >
              {indicateur.actif ? "✓ Actif" : "✗ Inactif"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              variant="caption"
              sx={{
                color: dgiColors.neutral[700],
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.7rem",
              }}
            >
              Date de création
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: dgiColors.neutral[900], mt: 0.5 }}
            >
              {formatDate(indicateur.date_creation)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              variant="caption"
              sx={{
                color: dgiColors.neutral[700],
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.7rem",
              }}
            >
              Dernière modification
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: dgiColors.neutral[900], mt: 0.5 }}
            >
              {formatDate(indicateur.date_modification || null)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default IndicateurDetailView;
