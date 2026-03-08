import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Divider,
  alpha,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  ExpandLess,
  ExpandMore,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  PersonSearch as PersonSearchIcon,
  ListAlt as ListAltIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  FolderSpecial as FolderSpecialIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import useAuthStore from "../store/authStore";
import dgi_logo from "../assets/dgi_logo.png"
// Palette DGI Burkina Faso - Identique au Login
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

// Types pour les items du menu
interface SubMenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubMenuItem[];
}

// Configuration du menu
const menuItems: MenuItem[] = [
  {
    title: "Tableau de bord",
    icon: <DashboardIcon />,
    subItems: [
      { title: "Vue d'ensemble", path: "/dashboard", icon: <TrendingUpIcon /> },
      { title: "Statistiques", path: "/dashboard/stats", icon: <BarChartIcon /> },
      { title: "Analyses", path: "/dashboard/analyses", icon: <AnalyticsIcon /> },
    ],
  },
  {
    title: "Contribuables",
    icon: <PeopleIcon />,
    subItems: [
      { title: "Pre-liste", path: "/contribuables", icon: <ListAltIcon /> },
      { title: "Programmes", path: "/contribuables/programmes", icon: <AccountBalanceIcon /> },
    //  { title: "Recherche avancée", path: "/contribuables/search", icon: <PersonSearchIcon /> },
      { title: "Profils risque", path: "/contribuables/risques", icon: <AssessmentIcon /> },
    ],
  },
  {
    title: "Fiches",
    icon: <FolderSpecialIcon />,
    subItems: [
      { title: "fiches", path: "/fiches", icon: <ListAltIcon /> },
      //{ title: "Recherche avancée", path: "/programmes/search", icon: <PersonSearchIcon /> },
     // { title: "Profils à risque", path: "/programmes/risques", icon: <AssessmentIcon /> },
    ],
  },
  {
    title: "Indicateurs",
    icon: <AssessmentIcon />,
    subItems: [
      { title: "Indicateurs TVA", path: "/indicateurs/tva", icon: <PieChartIcon /> },
      { title: "Indicateurs Import/Export", path: "/indicateurs/import-export", icon: <ShowChartIcon /> },
      { title: "Indicateurs Comptabilité", path: "/indicateurs/comptabilite", icon: <BarChartIcon /> },
    ],
  },
];

const gestionUser = {
  title: "Utilisateurs",
  icon: <PeopleIcon />,
  subItems: [
    { title: "Liste des utilisateurs", path: "/users", icon: <ListAltIcon /> },
  ],
};

const parameItems = {
  title: "Paramètres",  
  icon: <SettingsIcon />,
  subItems: [
    { title: "Données", path: "/parametres", icon: <SettingsIcon /> }
  ],
};
const drawerWidth = 280;
const drawerWidthCollapsed = 72;

const Sidebar: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>(["Tableau de bord"]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const handleToggleExpand = (title: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setExpandedItems([title]);
      return;
    }
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setExpandedItems([]);
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (subItems?: SubMenuItem[]) =>
    subItems?.some((item) => location.pathname.startsWith(item.path));

  const currentWidth = isCollapsed ? drawerWidthCollapsed : drawerWidth;

  if (!user) {
    return null; // Ne pas afficher le sidebar si l'utilisateur n'est pas connecté
  }
 if (user.role === "admin" && !menuItems.some((item) => item.title === gestionUser.title)) {
    menuItems.push(gestionUser);
    menuItems.push(parameItems);
  }
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: currentWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: currentWidth,
          boxSizing: "border-box",
          background: `linear-gradient(180deg, ${dgiColors.primary.main} 0%, ${dgiColors.primary.dark} 100%)`,
          borderRight: "none",
          transition: "width 0.3s ease",
          overflowX: "hidden",
        },
      }}
    >
      {/* Header du Sidebar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          p: 2,
          minHeight: 80,
        }}
      >
        {!isCollapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <img src={dgi_logo} width={50} height={50}  />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  letterSpacing: 1,
                  lineHeight: 1.2,
                }}
              >
                ANARISK
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: alpha("#fff", 0.7),
                  fontSize: "0.65rem",
                }}
              >
                DGI Burkina Faso
              </Typography>
            </Box>
          </Box>
        )}
        {isCollapsed && (
          <img src={dgi_logo} width={30} height={30}  />
        )}
        <IconButton
          onClick={handleToggleCollapse}
          sx={{
            color: alpha("#fff", 0.7),
            "&:hover": {
              color: "#fff",
              backgroundColor: alpha("#fff", 0.1),
            },
          }}
        >
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      {/* Ligne décorative */}
      <Box
        sx={{
          mx: isCollapsed ? 1 : 2,
          height: 2,
          borderRadius: 1,
          background: `linear-gradient(90deg, ${dgiColors.accent.main} 0%, transparent 100%)`,
          mb: 2,
        }}
      />

      {/* Menu Items */}
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <Box key={item.title} sx={{ mb: 0.5 }}>
            {/* Item Principal */}
            <Tooltip
              title={isCollapsed ? item.title : ""}
              placement="right"
              arrow
            >
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() =>
                    item.subItems
                      ? handleToggleExpand(item.title)
                      : item.path && handleNavigate(item.path)
                  }
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    py: 1.5,
                    px: isCollapsed ? 1.5 : 2,
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    backgroundColor: isParentActive(item.subItems)
                      ? alpha("#fff", 0.15)
                      : "transparent",
                    "&:hover": {
                      backgroundColor: alpha("#fff", 0.1),
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isParentActive(item.subItems)
                        ? dgiColors.accent.main
                        : alpha("#fff", 0.8),
                      minWidth: isCollapsed ? 0 : 40,
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && (
                    <>
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          fontSize: "0.9rem",
                          fontWeight: isParentActive(item.subItems) ? 600 : 500,
                          color: "#fff",
                        }}
                      />
                      {item.subItems &&
                        (expandedItems.includes(item.title) ? (
                          <ExpandLess sx={{ color: alpha("#fff", 0.7) }} />
                        ) : (
                          <ExpandMore sx={{ color: alpha("#fff", 0.7) }} />
                        ))}
                    </>
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>

            {/* Sous-menu */}
            {item.subItems && !isCollapsed && (
              <Collapse
                in={expandedItems.includes(item.title)}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItem key={subItem.path} disablePadding>
                      <ListItemButton
                        onClick={() => handleNavigate(subItem.path)}
                        sx={{
                          pl: 4,
                          py: 1,
                          borderRadius: 2,
                          mx: 1,
                          mb: 0.5,
                          backgroundColor: isActive(subItem.path)
                            ? alpha(dgiColors.accent.main, 0.2)
                            : "transparent",
                          borderLeft: isActive(subItem.path)
                            ? `3px solid ${dgiColors.accent.main}`
                            : "3px solid transparent",
                          "&:hover": {
                            backgroundColor: alpha("#fff", 0.08),
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: isActive(subItem.path)
                              ? dgiColors.accent.main
                              : alpha("#fff", 0.6),
                            minWidth: 32,
                            "& svg": { fontSize: 18 },
                          }}
                        >
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={subItem.title}
                          primaryTypographyProps={{
                            fontSize: "0.85rem",
                            fontWeight: isActive(subItem.path) ? 600 : 400,
                            color: isActive(subItem.path)
                              ? "#fff"
                              : alpha("#fff", 0.8),
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>

      {/* Footer du Sidebar */}
      <Box sx={{ mt: "auto", p: 2 }}>
        <Divider sx={{ borderColor: alpha("#fff", 0.1), mb: 2 }} />
        {!isCollapsed && (
          <Typography
            variant="caption"
            sx={{
              color: alpha("#fff", 0.5),
              display: "block",
              textAlign: "center",
              fontSize: "0.7rem",
            }}
          >
            © 2025 DGI • Burkina Faso
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;