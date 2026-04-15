import { useState, useMemo } from "react";
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
  ListAlt as ListAltIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  FolderSpecial as FolderSpecialIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
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
// Blocs de menu réutilisables
const menuTableauBord: MenuItem = {
  title: "Analyse & Statistiques",
  icon: <DashboardIcon />,
  subItems: [
    { title: "Vue d'ensemble", path: "/dashboard", icon: <TrendingUpIcon /> },
    //{ title: "Statistiques", path: "/dashboard/stats", icon: <BarChartIcon /> },
    //{ title: "Analyses", path: "/dashboard/analyses", icon: <AnalyticsIcon /> },
  ],
};

const menuContribuablesFull: MenuItem = {
  title: "Contribuables",
  icon: <PeopleIcon />,
  subItems: [
    { title: "Pre-liste", path: "/contribuables", icon: <ListAltIcon /> },
    { title: "Programmes", path: "/contribuables/programmes", icon: <AccountBalanceIcon /> },
    { title: "Profils risque", path: "/contribuables/risques", icon: <AssessmentIcon /> },
  ],
};

const menuContribuablesRestreint: MenuItem = {
  title: "Contribuables",
  icon: <PeopleIcon />,
  subItems: [
    { title: "Pre-liste", path: "/contribuables", icon: <ListAltIcon /> },
    { title: "Programmes", path: "/contribuables/programmes", icon: <AccountBalanceIcon /> },
  ],
};

const menuFiches: MenuItem = {
  title: "Fiches",
  icon: <FolderSpecialIcon />,
  subItems: [
    { title: "Fiches", path: "/fiches", icon: <ListAltIcon /> },
  ],
};

const menuIndicateurs: MenuItem = {
  title: "Indicateurs",
  icon: <AssessmentIcon />,
  subItems: [
    { title: "Indicateurs TVA", path: "/indicateurs/tva", icon: <PieChartIcon /> },
    { title: "Indicateurs Import/Export", path: "/indicateurs/import-export", icon: <ShowChartIcon /> },
    { title: "Indicateurs Comptabilité", path: "/indicateurs/comptabilite", icon: <BarChartIcon /> },
  ],
};

const menuParametres: MenuItem = {
  title: "Paramètres",
  icon: <SettingsIcon />,
  subItems: [
    { title: "Quantumes & tâches", path: "/parametres", icon: <SettingsIcon /> },
    { title: "Brigades", path: "/parametres/brigades", icon: <BusinessIcon /> },
   // { title: "Quantumes", path: "/parametres/quantumes", icon: <CategoryIcon /> },
    { title: "Utilisateurs", path: "/parametres/users", icon: <PeopleIcon /> },
  ],
};

// Menus par rôle
// admin      : accès complet (tableau de bord, contribuables, fiches, indicateurs, paramètres)
// dcf        : tableau de bord, contribuables (complet), fiches, indicateurs,paramètres
// agent_dcf  : tableau de bord, contribuables (pre-liste + programmes), fiches
// ur         : tableau de bord, contribuables (pre-liste + programmes)
// bv         : tableau de bord, fiches
const menusByRole: Record<string, MenuItem[]> = {
  admin:     [menuContribuablesFull,   menuFiches,menuTableauBord, menuIndicateurs, menuParametres],
  dcf:       [ menuContribuablesFull,    menuFiches,menuTableauBord, menuIndicateurs, menuParametres],
  agent_dcf: [ menuContribuablesRestreint, menuFiches,menuIndicateurs],
  ur:        [ menuFiches,menuIndicateurs],
  bv:        [ menuFiches,menuIndicateurs],
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

  const menuItems = useMemo(
    () => menusByRole[(user?.role as string) ?? ''] ?? [],
    [user?.role]
  );

  if (!user) {
    return null;
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
          borderRight: `1px solid ${alpha("#fff", 0.08)}`,
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowX: "hidden",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      {/* Header du Sidebar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          p: isCollapsed ? 2 : 3,
          minHeight: 88,
          borderBottom: `1px solid ${alpha("#fff", 0.1)}`,
          background: `linear-gradient(135deg, ${alpha("#fff", 0.05)} 0%, transparent 100%)`,
          backdropFilter: "blur(10px)",
          position: "relative",
        }}
      >
        {!isCollapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                position: "relative",
                filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))",
              }}
            >
              <img src={dgi_logo} width={56} height={56} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "#fff",
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                  lineHeight: 1.2,
                  fontSize: "1.3rem",
                  textShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                  background: `linear-gradient(135deg, #fff 0%, ${alpha("#fff", 0.9)} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ANARISK
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: alpha("#fff", 0.7),
                  fontSize: "0.7rem",
                  letterSpacing: "0.5px",
                  fontWeight: 500,
                }}
              >
                DGI Burkina Faso
              </Typography>
            </Box>
          </Box>
        )}
        {isCollapsed && (
          <Box
            sx={{
              position: "relative",
              filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))",
            }}
          >
            <img src={dgi_logo} width={36} height={36} />
          </Box>
        )}
        <IconButton
          onClick={handleToggleCollapse}
          sx={{
            color: alpha("#fff", 0.8),
            backgroundColor: alpha("#fff", 0.1),
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha("#fff", 0.15)}`,
            width: 36,
            height: 36,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: alpha("#fff", 0.2),
              color: "#fff",
              transform: "scale(1.08)",
              boxShadow: `0 4px 12px ${alpha("#000", 0.25)}`,
            },
          }}
        >
          {isCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>

        {/* Ligne décorative améliorée en bas du header */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, ${dgiColors.accent.main} 0%, ${dgiColors.accent.light} 50%, transparent 100%)`,
            opacity: 0.8,
            boxShadow: `0 0 8px ${alpha(dgiColors.accent.main, 0.5)}`,
          }}
        />
      </Box>

      {/* Menu Items */}
      <List sx={{ px: isCollapsed ? 1 : 2, py: 2 }}>
        {menuItems.map((item) => (
          <Box key={item.title} sx={{ mb: 1 }}>
            {/* Item Principal */}
            <Tooltip
              title={isCollapsed ? item.title : ""}
              placement="right"
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    backgroundColor: dgiColors.primary.dark,
                    color: "#fff",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    boxShadow: `0 4px 12px ${alpha("#000", 0.2)}`,
                    border: `1px solid ${alpha("#fff", 0.1)}`,
                    backdropFilter: "blur(10px)",
                  },
                },
              }}
            >
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() =>
                    item.subItems
                      ? handleToggleExpand(item.title)
                      : item.path && handleNavigate(item.path)
                  }
                  sx={{
                    borderRadius: 3,
                    mb: 0.5,
                    py: 1.8,
                    px: isCollapsed ? 1.5 : 2.5,
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    backgroundColor: isParentActive(item.subItems)
                      ? alpha("#fff", 0.18)
                      : "transparent",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${alpha("#fff", 0.1)} 0%, transparent 100%)`,
                      opacity: isParentActive(item.subItems) ? 1 : 0,
                      transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    },
                    "&:hover": {
                      backgroundColor: alpha("#fff", 0.15),
                      transform: "translateX(4px)",
                      "&::before": {
                        opacity: 1,
                      },
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: isParentActive(item.subItems)
                      ? `0 4px 12px ${alpha("#000", 0.15)}`
                      : "none",
                  }}
                >
                  {/* Indicateur actif - barre latérale */}
                  {isParentActive(item.subItems) && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 4,
                        height: "70%",
                        borderRadius: "0 4px 4px 0",
                        background: `linear-gradient(180deg, ${dgiColors.accent.main} 0%, ${dgiColors.accent.light} 100%)`,
                        boxShadow: `0 0 12px ${alpha(dgiColors.accent.main, 0.6)}`,
                      }}
                    />
                  )}

                  <ListItemIcon
                    sx={{
                      color: isParentActive(item.subItems)
                        ? dgiColors.accent.light
                        : alpha("#fff", 0.85),
                      minWidth: isCollapsed ? 0 : 44,
                      justifyContent: "center",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "& svg": {
                        fontSize: 22,
                        filter: isParentActive(item.subItems)
                          ? `drop-shadow(0 0 8px ${alpha(dgiColors.accent.main, 0.6)})`
                          : "none",
                      },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && (
                    <>
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          fontSize: "0.92rem",
                          fontWeight: isParentActive(item.subItems) ? 700 : 600,
                          color: "#fff",
                          letterSpacing: "0.3px",
                        }}
                      />
                      {item.subItems &&
                        (expandedItems.includes(item.title) ? (
                          <ExpandLess
                            sx={{
                              color: alpha("#fff", 0.75),
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          />
                        ) : (
                          <ExpandMore
                            sx={{
                              color: alpha("#fff", 0.75),
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          />
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
                timeout={400}
                unmountOnExit
                sx={{
                  "& .MuiCollapse-wrapperInner": {
                    paddingTop: 0.5,
                  },
                }}
              >
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItem key={subItem.path} disablePadding>
                      <ListItemButton
                        onClick={() => handleNavigate(subItem.path)}
                        sx={{
                          pl: 5,
                          pr: 2.5,
                          py: 1.3,
                          borderRadius: 3,
                          mx: 0.5,
                          mb: 0.5,
                          backgroundColor: isActive(subItem.path)
                            ? alpha(dgiColors.accent.main, 0.25)
                            : "transparent",
                          borderLeft: isActive(subItem.path)
                            ? `3px solid ${dgiColors.accent.light}`
                            : `3px solid transparent`,
                          position: "relative",
                          overflow: "hidden",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(135deg, ${alpha(dgiColors.accent.main, 0.1)} 0%, transparent 100%)`,
                            opacity: isActive(subItem.path) ? 1 : 0,
                            transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          },
                          "&:hover": {
                            backgroundColor: alpha("#fff", 0.1),
                            borderLeftColor: alpha(dgiColors.accent.light, 0.6),
                            transform: "translateX(4px)",
                            "&::before": {
                              opacity: 1,
                            },
                          },
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: isActive(subItem.path)
                            ? `0 2px 8px ${alpha("#000", 0.1)}`
                            : "none",
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: isActive(subItem.path)
                              ? dgiColors.accent.light
                              : alpha("#fff", 0.7),
                            minWidth: 36,
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "& svg": {
                              fontSize: 19,
                              filter: isActive(subItem.path)
                                ? `drop-shadow(0 0 6px ${alpha(dgiColors.accent.main, 0.5)})`
                                : "none",
                            },
                          }}
                        >
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={subItem.title}
                          primaryTypographyProps={{
                            fontSize: "0.87rem",
                            fontWeight: isActive(subItem.path) ? 650 : 500,
                            color: isActive(subItem.path)
                              ? "#fff"
                              : alpha("#fff", 0.85),
                            letterSpacing: "0.2px",
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
      <Box
        sx={{
          mt: "auto",
          p: isCollapsed ? 1.5 : 2.5,
          borderTop: `1px solid ${alpha("#fff", 0.1)}`,
          background: `linear-gradient(135deg, ${alpha("#fff", 0.03)} 0%, transparent 100%)`,
        }}
      >
        {!isCollapsed && (
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: alpha("#fff", 0.6),
                display: "block",
                textAlign: "center",
                fontSize: "0.72rem",
                fontWeight: 500,
                letterSpacing: "0.5px",
                mb: 0.5,
              }}
            >
              © 2025 DGI • Burkina Faso
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: alpha("#fff", 0.4),
                display: "block",
                textAlign: "center",
                fontSize: "0.68rem",
                fontStyle: "italic",
              }}
            >
              v1.0.0
            </Typography>
          </Box>
        )}
        {isCollapsed && (
          <Box
            sx={{
              width: "100%",
              height: 3,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${dgiColors.accent.main} 0%, ${dgiColors.accent.light} 100%)`,
              opacity: 0.5,
            }}
          />
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;