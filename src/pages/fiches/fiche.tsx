import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  alpha,
  CircularProgress,
  Alert,
  Button,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  FolderSpecial as FolderSpecialIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  AccountTree as AccountTreeIcon,
  Groups as GroupsIcon,
  InsertDriveFile as InsertDriveFileIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Image as ImageIcon,
  TableChart as TableChartIcon,
  NavigateNext as NavigateNextIcon,
  CloudDownload as CloudDownloadIcon,
} from "@mui/icons-material";

import programmeService from "../../services/fiches.service";
import type {
  Programme,
  Structure,
  SousStructure,
  Brigade,
  FileInfo,
  ContribuableFiles,
} from "../../services/fiches.service";
import useAuthStore from "../../store/authStore";

// Palette DGI Burkina Faso
const dgiColors = {
  primary: { main: "#006B3F", light: "#2E8B57", dark: "#004D2C" },
  accent: { main: "#CE8E00", light: "#E6A817" },
  secondary: { main: "#CE1126", light: "#E53945" },
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

// Types pour la navigation
type NavigationLevel = "programmes" | "structures" | "sous-structures" | "brigades" | "files";

interface NavigationState {
  level: NavigationLevel;
  programme?: string;
  programmeDate?: string;
  structure?: string;
  sousStructure?: string;
  brigade?: string;
}

// Composant carte pour les dossiers
interface FolderCardProps {
  title: string;
  subtitle?: string;
  count?: number;
  countLabel?: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
  onSecondaryAction?: () => void;
  secondaryActionIcon?: React.ReactNode;
  secondaryActionTooltip?: string;
  secondaryActionLoading?: boolean;
}

const FolderCard: React.FC<FolderCardProps> = ({
  title,
  subtitle,
  count,
  countLabel,
  icon,
  onClick,
  color = dgiColors.primary.main,
  onSecondaryAction,
  secondaryActionIcon,
  secondaryActionTooltip = "Action",
  secondaryActionLoading = false,
}) => (
  <Card
    elevation={0}
    sx={{
      border: `1px solid ${dgiColors.neutral[200]}`,
      borderRadius: 2,
      transition: "all 0.2s ease",
      position: "relative",
      "&:hover": {
        borderColor: color,
        boxShadow: `0 4px 12px ${alpha(color, 0.15)}`,
        transform: "translateY(-2px)",
      },
    }}
  >
    {onSecondaryAction && (
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
        }}
      >
        <Tooltip title={secondaryActionTooltip}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onSecondaryAction();
            }}
            disabled={secondaryActionLoading}
            sx={{
              backgroundColor: alpha(color, 0.1),
              color: color,
              "&:hover": {
                backgroundColor: alpha(color, 0.2),
              },
            }}
          >
            {secondaryActionLoading ? (
              <CircularProgress size={20} sx={{ color: color }} />
            ) : (
              secondaryActionIcon
            )}
          </IconButton>
        </Tooltip>
      </Box>
    )}
    <CardActionArea onClick={onClick}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(color, 0.1),
              color: color,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, pr: onSecondaryAction ? 4 : 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              noWrap
              sx={{ color: dgiColors.neutral[900] }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{ color: dgiColors.neutral[500], mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
            {count !== undefined && (
              <Chip
                size="small"
                label={`${count} ${countLabel || "éléments"}`}
                sx={{
                  mt: 1,
                  backgroundColor: alpha(color, 0.1),
                  color: color,
                  fontWeight: 500,
                }}
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </CardActionArea>
  </Card>
);

// Composant pour afficher un fichier
interface FileCardProps {
  file: FileInfo;
  onDownload: (file: FileInfo) => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onDownload }) => {
  const getFileIcon = () => {
    switch (file.file_type) {
      case "xlsx":
        return <TableChartIcon />;
      case "chart":
      case "forecast":
      case "image":
        return <ImageIcon />;
      default:
        return <InsertDriveFileIcon />;
    }
  };

  const getFileColor = () => {
    switch (file.file_type) {
      case "xlsx":
        return dgiColors.primary.main;
      case "chart":
        return dgiColors.accent.main;
      case "forecast":
        return dgiColors.secondary.main;
      default:
        return dgiColors.neutral[700];
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${dgiColors.neutral[200]}`,
        borderRadius: 2,
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: getFileColor(),
          boxShadow: `0 2px 8px ${alpha(getFileColor(), 0.15)}`,
        },
      }}
    >
      <CardActionArea onClick={() => onDownload(file)}>
        <CardContent sx={{ py: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ color: getFileColor() }}>{getFileIcon()}</Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={500} noWrap>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {file.size_formatted} • {file.modified_date}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={file.file_type}
              sx={{
                backgroundColor: alpha(getFileColor(), 0.1),
                color: getFileColor(),
                fontSize: "0.7rem",
              }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

// Composant principal
const FichesList: React.FC = () => {
  // États
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingBrigade, setDownloadingBrigade] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  // État de navigation
  const [navigation, setNavigation] = useState<NavigationState>({
    level: "programmes",
  });


  // Données
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [sousStructures, setSousStructures] = useState<SousStructure[]>([]);
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [contribuables, setContribuables] = useState<ContribuableFiles[]>([]);

  // Chargement des données selon le niveau
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      switch (navigation.level) {
        case "programmes": {
          const progs = await programmeService.listProgrammes();
          setProgrammes(progs);
          break;
        }

        case "structures": {
          if (navigation.programme) {
            const structs = await programmeService.listStructures(navigation.programme);
            setStructures(structs);
          }
          break;
        }

        case "sous-structures": {
          if (navigation.programme && navigation.structure) {
            const sousStructs = await programmeService.listSousStructures(
              navigation.programme,
              navigation.structure
            );
            setSousStructures(sousStructs);
          }
          break;
        }

        case "brigades": {
          if (navigation.programme && navigation.structure && navigation.sousStructure) {
            const brigs = await programmeService.listBrigades(
              navigation.programme,
              navigation.structure,
              navigation.sousStructure
            );
            setBrigades(brigs);
          }
          break;
        }

        case "files": {
          if (
            navigation.programme &&
            navigation.structure &&
            navigation.sousStructure &&
            navigation.brigade
          ) {
            const contribs = await programmeService.listContribuablesInBrigade(
              navigation.programme,
              navigation.structure,
              navigation.sousStructure,
              navigation.brigade
            );
            setContribuables(contribs);

            const filesList = await programmeService.listFilesInBrigade(
              navigation.programme,
              navigation.structure,
              navigation.sousStructure,
              navigation.brigade
            );
            setFiles(filesList);
          }
          break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Navigation handlers
  const handleSelectProgramme = (prog: Programme) => {
    setNavigation({
      level: "structures",
      programme: prog.name,
      programmeDate: prog.date,
    });
  };

  const handleSelectStructure = (struct: Structure) => {
    setNavigation((prev) => ({
      ...prev,
      level: "sous-structures",
      structure: struct.code,
    }));
  };

  const handleSelectSousStructure = (sousStruct: SousStructure) => {
    setNavigation((prev) => ({
      ...prev,
      level: "brigades",
      sousStructure: sousStruct.name,
    }));
  };

  const handleSelectBrigade = (brigade: Brigade) => {
    setNavigation((prev) => ({
      ...prev,
      level: "files",
      brigade: brigade.name,
    }));
  };

  const handleBack = () => {
    switch (navigation.level) {
      case "structures":
        setNavigation({ level: "programmes" });
        break;
      case "sous-structures":
        setNavigation((prev) => ({
          level: "structures",
          programme: prev.programme,
          programmeDate: prev.programmeDate,
        }));
        break;
      case "brigades":
        setNavigation((prev) => ({
          level: "sous-structures",
          programme: prev.programme,
          programmeDate: prev.programmeDate,
          structure: prev.structure,
        }));
        break;
      case "files":
        setNavigation((prev) => ({
          level: "brigades",
          programme: prev.programme,
          programmeDate: prev.programmeDate,
          structure: prev.structure,
          sousStructure: prev.sousStructure,
        }));
        break;
    }
  };

  const handleBreadcrumbClick = (level: NavigationLevel) => {
    switch (level) {
      case "programmes":
        setNavigation({ level: "programmes" });
        break;
      case "structures":
        setNavigation((prev) => ({
          level: "structures",
          programme: prev.programme,
          programmeDate: prev.programmeDate,
        }));
        break;
      case "sous-structures":
        setNavigation((prev) => ({
          level: "sous-structures",
          programme: prev.programme,
          programmeDate: prev.programmeDate,
          structure: prev.structure,
        }));
        break;
      case "brigades":
        setNavigation((prev) => ({
          level: "brigades",
          programme: prev.programme,
          programmeDate: prev.programmeDate,
          structure: prev.structure,
          sousStructure: prev.sousStructure,
        }));
        break;
    }
  };

  const handleDownloadFile = (file: FileInfo) => {
    if (
      navigation.programme &&
      navigation.structure &&
      navigation.sousStructure &&
      navigation.brigade
    ) {
      const url = programmeService.getFileDownloadUrl(
        navigation.programme,
        navigation.structure,
        navigation.sousStructure,
        navigation.brigade,
        file.name
      );
      window.open(url, "_blank");
    }
  };

  const handleDownloadBrigade = async (brigade: Brigade) => {
    if (!navigation.programme || !navigation.structure || !navigation.sousStructure) {
      return;
    }

    try {
      setDownloadingBrigade(brigade.name);
      
      const blob = await programmeService.downloadBrigadeZip(
        navigation.programme,
        navigation.structure,
        navigation.sousStructure,
        brigade.name
      );

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${brigade.name}_${navigation.structure}_${navigation.programme}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error("Erreur lors du téléchargement de la brigade:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du téléchargement de la brigade"
      );
    } finally {
      setDownloadingBrigade(null);
    }
  };

  // Filtrage des données
  const filterData = <T extends { name?: string; code?: string }>(
    data: T[],
    query: string
  ): T[] => {
    if (!query) return data;
    const lowerQuery = query.toLowerCase();
    return data.filter(
      (item) =>
        item.name?.toLowerCase().includes(lowerQuery) ||
        item.code?.toLowerCase().includes(lowerQuery)
    );
  };

  // Titre selon le niveau
  const getTitle = () => {
    switch (navigation.level) {
      case "programmes":
        return "Programmes de contrôle";
      case "structures":
        return `Structures - ${navigation.programme}`;
      case "sous-structures":
        return `Sous-structures - ${navigation.structure}`;
      case "brigades":
        return `Brigades - ${navigation.sousStructure}`;
      case "files":
        return `Fichiers - ${navigation.brigade}`;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${dgiColors.primary.main} 0%, ${dgiColors.primary.dark} 100%)`,
          borderRadius: 2,
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          {navigation.level !== "programmes" && (
            <IconButton
              onClick={handleBack}
              sx={{ color: "white", "&:hover": { backgroundColor: alpha("#fff", 0.1) } }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <FolderSpecialIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              {getTitle()}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Explorez les programmes de contrôle fiscal
            </Typography>
          </Box>
        </Box>

        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: alpha("#fff", 0.7) }} />}
          sx={{ "& .MuiBreadcrumbs-li": { color: alpha("#fff", 0.9) } }}
        >
          <Link
            component="button"
            underline="hover"
            onClick={() => handleBreadcrumbClick("programmes")}
            sx={{
              color: navigation.level === "programmes" ? "white" : alpha("#fff", 0.7),
              fontWeight: navigation.level === "programmes" ? 600 : 400,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <HomeIcon fontSize="small" />
            Programmes
          </Link>
          {navigation.programme && (
            <Link
              component="button"
              underline="hover"
              onClick={() => handleBreadcrumbClick("structures")}
              sx={{
                color: navigation.level === "structures" ? "white" : alpha("#fff", 0.7),
                fontWeight: navigation.level === "structures" ? 600 : 400,
              }}
            >
              {navigation.programme}
            </Link>
          )}
          {navigation.structure && (
            <Link
              component="button"
              underline="hover"
              onClick={() => handleBreadcrumbClick("sous-structures")}
              sx={{
                color: navigation.level === "sous-structures" ? "white" : alpha("#fff", 0.7),
                fontWeight: navigation.level === "sous-structures" ? 600 : 400,
              }}
            >
              {navigation.structure}
            </Link>
          )}
          {navigation.sousStructure && (
            <Link
              component="button"
              underline="hover"
              onClick={() => handleBreadcrumbClick("brigades")}
              sx={{
                color: navigation.level === "brigades" ? "white" : alpha("#fff", 0.7),
                fontWeight: navigation.level === "brigades" ? 600 : 400,
              }}
            >
              {navigation.sousStructure}
            </Link>
          )}
          {navigation.brigade && (
            <Typography sx={{ color: "white", fontWeight: 600 }}>
              {navigation.brigade}
            </Typography>
          )}
        </Breadcrumbs>
      </Paper>

      {/* Barre de recherche et actions */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          placeholder="Rechercher..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: dgiColors.neutral[500] }} />
              </InputAdornment>
            ),
          }}
        />
        <Tooltip title="Actualiser">
          <IconButton onClick={loadData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Contenu */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: dgiColors.primary.main }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button size="small" onClick={loadData} sx={{ ml: 2 }}>
            Réessayer
          </Button>
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {/* Programmes */}
          {navigation.level === "programmes" &&
            filterData(programmes, searchQuery).map((prog) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={prog.name}>
                <FolderCard
                  title={prog.name.replace("programme_", "").replace(/_/g, "/")}
                  subtitle={`Date: ${prog.date}`}
                  count={prog.structures_count}
                  countLabel="structures"
                  icon={<FolderSpecialIcon sx={{ fontSize: 32 }} />}
                  onClick={() => handleSelectProgramme(prog)}
                  color={dgiColors.primary.main}
                />
              </Grid>
            ))}

          {/* Structures */}
          {navigation.level === "structures" &&
            filterData(structures, searchQuery).map((struct) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={struct.code}>
                <FolderCard
                  title={struct.code}
                  subtitle={`${struct.total_contribuables} contribuables`}
                  count={struct.sous_structures_count}
                  countLabel="sous-structures"
                  icon={<BusinessIcon sx={{ fontSize: 32 }} />}
                  onClick={() => handleSelectStructure(struct)}
                  color={dgiColors.accent.main}
                />
              </Grid>
            ))}

          {/* Sous-structures */}
          {navigation.level === "sous-structures" &&
            filterData(sousStructures, searchQuery).map((sousStruct) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={sousStruct.name}>
                <FolderCard
                  title={sousStruct.name}
                  subtitle={`${sousStruct.total_contribuables} contribuables`}
                  count={sousStruct.brigades_count}
                  countLabel="brigades"
                  icon={<AccountTreeIcon sx={{ fontSize: 32 }} />}
                  onClick={() => handleSelectSousStructure(sousStruct)}
                  color={dgiColors.primary.light}
                />
              </Grid>
            ))}

          {/* Brigades */}
          {navigation.level === "brigades" &&
            filterData(brigades, searchQuery).map((brigade) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={brigade.name}>
                <FolderCard
                  title={brigade.name}
                  subtitle={`${brigade.xlsx_count} xlsx, ${brigade.png_count} images`}
                  count={brigade.contribuables_count}
                  countLabel="contribuables"
                  icon={<GroupsIcon sx={{ fontSize: 32 }} />}
                  onClick={() => handleSelectBrigade(brigade)}
                  color={dgiColors.secondary.main}
                  onSecondaryAction={() => handleDownloadBrigade(brigade)}
                  secondaryActionIcon={<CloudDownloadIcon fontSize="small" />}
                  secondaryActionTooltip="Télécharger tous les fichiers (ZIP)"
                  secondaryActionLoading={downloadingBrigade === brigade.name}
                />
              </Grid>
            ))}

          {/* Fichiers */}
          {navigation.level === "files" && (
            <>
              {/* Résumé des contribuables */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: dgiColors.neutral[700] }}>
                  Contribuables ({contribuables.length})
                </Typography>
              </Grid>
              {contribuables.map((contrib) => (
                <Grid item xs={12} sm={6} md={4} key={contrib.ifu}>
                  <Card
                    elevation={0}
                    sx={{
                      border: `1px solid ${dgiColors.neutral[200]}`,
                      borderRadius: 2,
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600}>
                        IFU: {contrib.ifu}
                      </Typography>
                      <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {contrib.xlsx && (
                          <Chip
                            size="small"
                            label="Excel"
                            icon={<TableChartIcon />}
                            sx={{
                              backgroundColor: alpha(dgiColors.primary.main, 0.1),
                              color: dgiColors.primary.main,
                            }}
                            onClick={() => contrib.xlsx && handleDownloadFile(contrib.xlsx)}
                          />
                        )}
                        {contrib.chart_png && (
                          <Chip
                            size="small"
                            label="Graphique"
                            icon={<ImageIcon />}
                            sx={{
                              backgroundColor: alpha(dgiColors.accent.main, 0.1),
                              color: dgiColors.accent.main,
                            }}
                            onClick={() => contrib.chart_png && handleDownloadFile(contrib.chart_png)}
                          />
                        )}
                        {contrib.forecast_png && (
                          <Chip
                            size="small"
                            label="Prévision"
                            icon={<ImageIcon />}
                            sx={{
                              backgroundColor: alpha(dgiColors.secondary.main, 0.1),
                              color: dgiColors.secondary.main,
                            }}
                            onClick={() => contrib.forecast_png && handleDownloadFile(contrib.forecast_png)}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {/* Liste des fichiers */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 3, mb: 2, color: dgiColors.neutral[700] }}>
                  Tous les fichiers ({files.length})
                </Typography>
              </Grid>
              {files
                .filter((f) =>
                  searchQuery
                    ? f.name.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                )
                .map((file) => (
                  <Grid item xs={12} sm={6} md={4} key={file.name}>
                    <FileCard file={file} onDownload={handleDownloadFile} />
                  </Grid>
                ))}
            </>
          )}

          {/* Message si aucun résultat */}
          {((navigation.level === "programmes" && programmes.length === 0) ||
            (navigation.level === "structures" && structures.length === 0) ||
            (navigation.level === "sous-structures" && sousStructures.length === 0) ||
            (navigation.level === "brigades" && brigades.length === 0) ||
            (navigation.level === "files" && files.length === 0)) && (
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: dgiColors.neutral[500],
                }}
              >
                <FolderOpenIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6">Aucun élément trouvé</Typography>
                <Typography variant="body2">
                  Ce dossier est vide ou les données ne sont pas disponibles.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default FichesList;
