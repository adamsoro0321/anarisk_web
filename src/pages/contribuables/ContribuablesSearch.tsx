import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  alpha,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Chip,
  Divider,
} from "@mui/material";
import {
  PersonSearch as PersonSearchIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import StatService, { type SearchResult } from "../../services/stat.service";

const dgiColors = {
  primary: { main: "#006B3F", light: "#2E8B57" },
  accent: { main: "#CE8E00" },
  neutral: { 100: "#F5F5F5", 200: "#EEEEEE", 400: "#BDBDBD", 500: "#9E9E9E", 900: "#212121" },
};

const ContribuablesSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Recherche de contribuables
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setSearching(true);
      const response = await StatService.searchContribuables(query, 20);
      if (response.success) {
        setSearchResults(response.results);
      }
      setHasSearched(true);
    } catch (err) {
      console.error("Erreur recherche:", err);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Navigation vers le détail
  const handleSelectContribuable = (ifu: string) => {
    navigate(`/contribuables/detail/${ifu}`);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, color: dgiColors.neutral[900], mb: 3 }}>
        Recherche de Contribuables
      </Typography>

      {/* Barre de recherche */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${dgiColors.neutral[200]}`,
        }}
      >
        <TextField
          fullWidth
          placeholder="Rechercher par IFU ou nom du contribuable..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: dgiColors.neutral[500] }} />
              </InputAdornment>
            ),
            endAdornment: searching ? (
              <InputAdornment position="end">
                <CircularProgress size={20} sx={{ color: dgiColors.primary.main }} />
              </InputAdornment>
            ) : null,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&.Mui-focused fieldset": {
                borderColor: dgiColors.primary.main,
              },
            },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          Entrez au moins 2 caractères pour lancer la recherche
        </Typography>
      </Paper>

      {/* Résultats */}
      {hasSearched && searchResults.length === 0 && !searching && (
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            border: `1px solid ${dgiColors.neutral[200]}`,
            textAlign: "center",
          }}
        >
          <PersonSearchIcon sx={{ fontSize: 60, color: dgiColors.neutral[400], mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucun résultat trouvé
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Essayez avec un autre terme de recherche.
          </Typography>
        </Paper>
      )}

      {searchResults.length > 0 && (
        <Paper
          sx={{
            borderRadius: 3,
            border: `1px solid ${dgiColors.neutral[200]}`,
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 2, backgroundColor: dgiColors.neutral[100] }}>
            <Typography variant="subtitle2" color="text.secondary">
              {searchResults.length} résultat(s) trouvé(s)
            </Typography>
          </Box>
          <List disablePadding>
            {searchResults.map((result, index) => (
              <Box key={result.ifu}>
                {index > 0 && <Divider />}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleSelectContribuable(result.ifu)}
                    sx={{
                      py: 2,
                      "&:hover": { backgroundColor: alpha(dgiColors.primary.main, 0.04) },
                    }}
                  >
                    <ListItemIcon>
                      <BusinessIcon sx={{ color: dgiColors.primary.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography
                            variant="body1"
                            fontWeight={600}
                            sx={{ fontFamily: "monospace", color: dgiColors.primary.main }}
                          >
                            {result.ifu}
                          </Typography>
                          {result.etat && (
                            <Chip
                              label={result.etat}
                              size="small"
                              color={result.etat === "ACTIF" ? "success" : "default"}
                              sx={{ fontSize: "0.7rem", height: 20 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.primary">
                            {result.nom || "Nom non disponible"}
                          </Typography>
                          {result.structure && (
                            <Typography variant="caption" color="text.secondary">
                              {result.structure}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ArrowForwardIcon sx={{ color: dgiColors.neutral[400] }} />
                  </ListItemButton>
                </ListItem>
              </Box>
            ))}
          </List>
        </Paper>
      )}

      {/* État initial */}
      {!hasSearched && searchQuery.length < 2 && (
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            border: `1px solid ${dgiColors.neutral[200]}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: alpha(dgiColors.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <PersonSearchIcon sx={{ fontSize: 40, color: dgiColors.primary.main }} />
          </Box>
          <Typography variant="h6" sx={{ color: dgiColors.neutral[900], mb: 1 }}>
            Recherche de contribuables
          </Typography>
          <Typography variant="body2" sx={{ color: dgiColors.neutral[500], textAlign: "center", maxWidth: 400 }}>
            Recherchez un contribuable par son IFU ou son nom pour visualiser tous ses indicateurs de risque.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ContribuablesSearch;
