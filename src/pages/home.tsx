import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Paper,
  alpha,
  Divider,
  ListItemIcon,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  /*Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,*/
  Notifications as NotificationsIcon
} from "@mui/icons-material";
import { useState } from "react";
import useAuthStore from "../store/authStore";
import Sidebar from "../components/sidebar";

// Palette DGI Burkina Faso
const dgiColors = {
  primary: {
    main: "#006B3F",
    light: "#2E8B57",
    dark: "#004D2C",
    contrastText: "#FFFFFF",
  },
  accent: {
    main: "#CE8E00",
    light: "#E6A817",
    dark: "#996600",
  },
  secondary: {
    main: "#CE1126",
    light: "#E53945",
    dark: "#9C0D1C",
  },
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },
};

// Configuration des titres de pages
const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Tableau de bord", subtitle: "Vue d'ensemble de l'analyse des risques fiscaux" },
  "/dashboard/stats": { title: "Statistiques", subtitle: "Statistiques détaillées des analyses" },
  "/dashboard/analyses": { title: "Analyses", subtitle: "Analyses avancées des données fiscales" },
  "/contribuables": { title: "Contribuables", subtitle: "Liste complète des contribuables" },
  "/contribuables/search": { title: "Recherche", subtitle: "Recherche avancée de contribuables" },
  "/contribuables/risques": { title: "Profils à risque", subtitle: "Contribuables présentant des risques fiscaux" },
  "/indicateurs/tva": { title: "Indicateurs TVA", subtitle: "Analyse des indicateurs de TVA" },
  "/indicateurs/import-export": { title: "Import/Export", subtitle: "Indicateurs des opérations internationales" },
  "/indicateurs/comptabilite": { title: "Comptabilité", subtitle: "Indicateurs comptables" },
  "/parametres": { title: "Paramètres", subtitle: "Configuration des données de référence" },
  "/parametres/brigades": { title: "Brigades", subtitle: "Gestion des brigades de contrôle fiscal" },
  "/parametres/quantumes": { title: "Quantumes", subtitle: "Gestion des périodes de programmation" },
};

const Home: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Obtenir le titre et sous-titre de la page actuelle
  const currentPage = pageTitles[location.pathname] || { 
    title: "ANARISK", 
    subtitle: "Système d'Analyse des Risques Fiscaux" 
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login", { replace: true });
  };

  const getUserInitials = () => {
    const name = user?.name || user?.email || "U";
    return name.charAt(0).toUpperCase();
  };


  return (
    <Box 
      className="home-container"
      sx={{
        display: "flex",
        minHeight: "100vh",
        maxWidth: "100vw",
        overflow: "hidden",
        backgroundColor: dgiColors.neutral[100]
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Contenu Principal */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          display: "flex", 
          flexDirection: "column",
          minWidth: 0, // Important: permet au flexbox de rétrécir en dessous de son contenu
          maxWidth: "100%",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${dgiColors.neutral[200]}`,
            backgroundColor: "#fff",
            flexShrink: 0, // Le header ne doit pas rétrécir
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: dgiColors.neutral[900] }}
            >
              {currentPage.title}
            </Typography>
            <Typography variant="body2" sx={{ color: dgiColors.neutral[500] }}>
              {currentPage.subtitle}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Notifications */}
            <IconButton
              sx={{
                color: dgiColors.neutral[600],
                "&:hover": { backgroundColor: alpha(dgiColors.primary.main, 0.1) },
              }}
            >
              <NotificationsIcon />
            </IconButton>

            {/* Menu Utilisateur */}
            <Box
              onClick={handleMenuOpen}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                p: 1,
                borderRadius: 2,
                "&:hover": { backgroundColor: dgiColors.neutral[100] },
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: dgiColors.primary.main,
                  fontWeight: 600,
                }}
              >
                {getUserInitials()}
              </Avatar>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: dgiColors.neutral[800] }}
                >
                  {user?.name || "Utilisateur"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: dgiColors.neutral[500] }}
                >
                  {user?.email || "admin@dgi.bf"}
                </Typography>
              </Box>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                },
              }}
            >
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Mon profil
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Paramètres
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: dgiColors.secondary.main }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: dgiColors.secondary.main }} />
                </ListItemIcon>
                Déconnexion
              </MenuItem>
            </Menu>
          </Box>
        </Paper>

        {/* Contenu */}
        <Box 
          sx={{ 
            p: 3, 
            flexGrow: 1,
            overflow: "auto", // Permet le scroll si le contenu dépasse
            minHeight: 0, // Important pour le scroll dans un flex container
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
