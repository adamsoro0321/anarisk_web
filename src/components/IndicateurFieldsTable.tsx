import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import type { Indicateur } from "../services/indicateur.services";

// Palette DGI
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

// Définition de toutes les variables avec métadonnées
export interface IndicateurFieldMeta {
  key: keyof Indicateur;
  label: string;
  category:
    | "Identification"
    | "Définition"
    | "Calculs"
    | "Risque"
    | "Classification"
    | "Métadonnées"
    | "Système";
  type: "string" | "number" | "boolean" | "date";
  required: boolean;
  description: string;
}

export const INDICATEUR_FIELDS: IndicateurFieldMeta[] = [
  // IDENTIFICATION (3)
  {
    key: "id",
    label: "ID",
    category: "Identification",
    type: "number",
    required: true,
    description: "Identifiant unique en base de données (auto-généré)",
  },
  {
    key: "code_indicateur",
    label: "Code Indicateur",
    category: "Identification",
    type: "string",
    required: true,
    description: "Code métier unique (ex: IND_1, IND_2, etc.)",
  },
  {
    key: "intitule",
    label: "Intitulé",
    category: "Identification",
    type: "string",
    required: true,
    description: "Nom complet et descriptif de l'indicateur",
  },

  // DÉFINITION (3)
  {
    key: "axes_controle",
    label: "Axes de Contrôle",
    category: "Définition",
    type: "string",
    required: false,
    description: "Axe de contrôle fiscal concerné",
  },
  {
    key: "objectif",
    label: "Objectif",
    category: "Définition",
    type: "string",
    required: false,
    description: "But et justification de cet indicateur",
  },
  {
    key: "designation_anomalie",
    label: "Désignation Anomalie",
    category: "Définition",
    type: "string",
    required: false,
    description: "Description précise de l'anomalie détectée",
  },

  // CALCULS (8)
  {
    key: "variables_calcul",
    label: "Variables de Calcul",
    category: "Calculs",
    type: "string",
    required: false,
    description: "Variables d'entrée nécessaires au calcul",
  },
  {
    key: "formule_calcul",
    label: "Formule de Calcul",
    category: "Calculs",
    type: "string",
    required: false,
    description: "Expression mathématique de calcul de l'indicateur",
  },
  {
    key: "seuil_declenchement",
    label: "Seuil de Déclenchement",
    category: "Calculs",
    type: "string",
    required: false,
    description: "Valeur seuil déclenchant une alerte (ex: 20%, 100 millions)",
  },
  {
    key: "regle_selection",
    label: "Règle de Sélection",
    category: "Calculs",
    type: "string",
    required: false,
    description: "Condition métier de déclenchement du risque",
  },
  {
    key: "calcul_ecart",
    label: "Calcul d'Écart",
    category: "Calculs",
    type: "string",
    required: false,
    description: "Formule de calcul de l'écart constaté",
  },
  {
    key: "coefficient_moderation",
    label: "Coefficient de Modération",
    category: "Calculs",
    type: "string",
    required: false,
    description: "Coefficient d'ajustement (ex: 75%, 80%)",
  },
  {
    key: "impact_recettes",
    label: "Impact Recettes",
    category: "Calculs",
    type: "string",
    required: false,
    description: "Formule d'estimation de l'impact financier",
  },
  {
    key: "unite_mesure",
    label: "Unité de Mesure",
    category: "Calculs",
    type: "string",
    required: false,
    description: "Unité du résultat (%, FCFA, année, etc.)",
  },

  // RISQUE (2)
  {
    key: "criticite",
    label: "Criticité",
    category: "Risque",
    type: "string",
    required: false,
    description: "Niveau de gravité du risque (1 à 5)",
  },
  {
    key: "type_controle",
    label: "Type de Contrôle",
    category: "Risque",
    type: "string",
    required: false,
    description: "DE (Droit Enquête), VP (Vérif. Ponctuelle), CSP (Contrôle Sur Pièces), VG (Vérif. Générale)",
  },

  // CLASSIFICATION (6)
  {
    key: "sources_donnees",
    label: "Sources de Données",
    category: "Classification",
    type: "string",
    required: false,
    description: "Sources d'information (SINTAX, DGD, États financiers, etc.)",
  },
  {
    key: "impots_controle",
    label: "Impôts Contrôlés",
    category: "Classification",
    type: "string",
    required: false,
    description: "Impôts concernés (TVA, IS, IBICA, IRF, etc.)",
  },
  {
    key: "segments_concernes",
    label: "Segments Concernés",
    category: "Classification",
    type: "string",
    required: false,
    description: "Segments de contribuables ciblés",
  },
  {
    key: "regimes_concernes",
    label: "Régimes Concernés",
    category: "Classification",
    type: "string",
    required: false,
    description: "Régimes fiscaux (RN, RSI, CME, ND)",
  },
  {
    key: "forme_juridique",
    label: "Forme Juridique",
    category: "Classification",
    type: "string",
    required: false,
    description: "Formes juridiques des contribuables",
  },

  // MÉTADONNÉES (4)
  {
    key: "implemente",
    label: "Implémenté",
    category: "Métadonnées",
    type: "string",
    required: false,
    description: "État d'implémentation (Oui / Non)",
  },
  {
    key: "limite",
    label: "Limites",
    category: "Métadonnées",
    type: "string",
    required: false,
    description: "Limitations ou restrictions connues de l'indicateur",
  },
  {
    key: "commentaires",
    label: "Commentaires",
    category: "Métadonnées",
    type: "string",
    required: false,
    description: "Notes additionnelles et observations",
  },
  {
    key: "type",
    label: "Type",
    category: "Métadonnées",
    type: "string",
    required: false,
    description: "Type ou catégorie spécifique",
  },

  // SYSTÈME (3)
  {
    key: "actif",
    label: "Actif",
    category: "Système",
    type: "boolean",
    required: true,
    description: "Statut actif/inactif de l'indicateur (soft delete)",
  },
  {
    key: "date_creation",
    label: "Date de Création",
    category: "Système",
    type: "date",
    required: true,
    description: "Date et heure de création (UTC, ISO 8601)",
  },
  {
    key: "date_modification",
    label: "Date de Modification",
    category: "Système",
    type: "date",
    required: false,
    description: "Date et heure de dernière modification (UTC, ISO 8601)",
  },
];

// Statistiques par catégorie
export const getFieldStats = () => {
  const stats = INDICATEUR_FIELDS.reduce(
    (acc, field) => {
      acc.total++;
      if (field.required) acc.required++;
      else acc.optional++;
      acc.byCategory[field.category] = (acc.byCategory[field.category] || 0) + 1;
      acc.byType[field.type] = (acc.byType[field.type] || 0) + 1;
      return acc;
    },
    {
      total: 0,
      required: 0,
      optional: 0,
      byCategory: {} as Record<string, number>,
      byType: {} as Record<string, number>,
    }
  );
  return stats;
};

interface IndicateurFieldsTableProps {
  showDescription?: boolean;
  showType?: boolean;
  showRequired?: boolean;
}

const IndicateurFieldsTable: React.FC<IndicateurFieldsTableProps> = ({
  showDescription = true,
  showType = true,
  showRequired = true,
}) => {
  const stats = getFieldStats();

  // Grouper par catégorie
  const fieldsByCategory = INDICATEUR_FIELDS.reduce((acc, field) => {
    if (!acc[field.category]) acc[field.category] = [];
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, IndicateurFieldMeta[]>);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Identification: dgiColors.primary.main,
      Définition: dgiColors.primary.light,
      Calculs: dgiColors.accent.main,
      Risque: dgiColors.secondary.main,
      Classification: dgiColors.primary.dark,
      Métadonnées: dgiColors.neutral[700],
      Système: dgiColors.neutral[500],
    };
    return colors[category] || dgiColors.neutral[500];
  };

  return (
    <Box>
      {/* En-tête avec statistiques */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${dgiColors.primary.main} 0%, ${dgiColors.primary.dark} 100%)`,
          color: "#fff",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          📊 Catalogue Complet des Variables Indicateur
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Chip
            label={`${stats.total} variables totales`}
            sx={{
              backgroundColor: alpha("#fff", 0.2),
              color: "#fff",
              fontWeight: 600,
            }}
          />
          <Chip
            label={`${stats.required} obligatoires`}
            sx={{
              backgroundColor: alpha(dgiColors.secondary.light, 0.9),
              color: "#fff",
              fontWeight: 600,
            }}
          />
          <Chip
            label={`${stats.optional} optionnelles`}
            sx={{
              backgroundColor: alpha(dgiColors.accent.main, 0.9),
              color: "#fff",
              fontWeight: 600,
            }}
          />
        </Box>
      </Paper>

      {/* Tableau par catégorie */}
      {Object.entries(fieldsByCategory).map(([category, fields], idx) => (
        <Accordion
          key={category}
          defaultExpanded={idx === 0}
          sx={{
            mb: 2,
            borderRadius: 2,
            "&:before": { display: "none" },
            boxShadow: `0 2px 8px ${alpha(getCategoryColor(category), 0.1)}`,
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: alpha(getCategoryColor(category), 0.08),
              borderRadius: 2,
              "&:hover": {
                backgroundColor: alpha(getCategoryColor(category), 0.12),
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: getCategoryColor(category),
                }}
              >
                {category}
              </Typography>
              <Chip
                label={`${fields.length} variable${fields.length > 1 ? "s" : ""}`}
                size="small"
                sx={{
                  backgroundColor: alpha(getCategoryColor(category), 0.15),
                  color: getCategoryColor(category),
                  fontWeight: 600,
                }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: alpha(getCategoryColor(category), 0.05),
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: dgiColors.neutral[900] }}>
                      Variable
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: dgiColors.neutral[900] }}>
                      Clé API
                    </TableCell>
                    {showType && (
                      <TableCell sx={{ fontWeight: 700, color: dgiColors.neutral[900] }}>
                        Type
                      </TableCell>
                    )}
                    {showRequired && (
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 700, color: dgiColors.neutral[900] }}
                      >
                        Requis
                      </TableCell>
                    )}
                    {showDescription && (
                      <TableCell sx={{ fontWeight: 700, color: dgiColors.neutral[900] }}>
                        Description
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field) => (
                    <TableRow
                      key={field.key}
                      sx={{
                        "&:hover": {
                          backgroundColor: alpha(getCategoryColor(category), 0.03),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: dgiColors.neutral[900],
                          }}
                        >
                          {field.label}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.85rem",
                            color: dgiColors.accent.dark,
                            backgroundColor: alpha(dgiColors.accent.main, 0.05),
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            display: "inline-block",
                          }}
                        >
                          {field.key}
                        </Typography>
                      </TableCell>
                      {showType && (
                        <TableCell>
                          <Chip
                            label={field.type}
                            size="small"
                            sx={{
                              fontSize: "0.7rem",
                              height: 22,
                              backgroundColor: alpha(dgiColors.primary.light, 0.1),
                              color: dgiColors.primary.dark,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                      )}
                      {showRequired && (
                        <TableCell align="center">
                          {field.required ? (
                            <Chip
                              label="Oui"
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                height: 22,
                                backgroundColor: alpha(dgiColors.secondary.light, 0.2),
                                color: dgiColors.secondary.main,
                                fontWeight: 600,
                              }}
                            />
                          ) : (
                            <Chip
                              label="Non"
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                height: 22,
                                backgroundColor: alpha(dgiColors.neutral[500], 0.1),
                                color: dgiColors.neutral[700],
                              }}
                            />
                          )}
                        </TableCell>
                      )}
                      {showDescription && (
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "0.85rem",
                              color: dgiColors.neutral[700],
                              lineHeight: 1.5,
                            }}
                          >
                            {field.description}
                          </Typography>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default IndicateurFieldsTable;
