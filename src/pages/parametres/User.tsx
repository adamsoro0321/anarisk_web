import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  alpha,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import UserService from "../../services/user.service";
import type { User } from "../../services/user.service";
import CreateUserModal from "../../modal/CreateUserModal";

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

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (page = 1, perPage = 25) => {
    try {
      setLoading(true);
      setError(null);
      const response = await UserService.getAll({ page, per_page: perPage });

      if (response.success) {
        setUsers(response.data);
      } else {
        setError("Erreur lors du chargement des utilisateurs");
      }
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setSelectedUser(null);
  };

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleUserCreated = () => {
    loadUsers();
  };

  // Calcul des statistiques
  const stats = {
    total: users.length,
    actifs: users.filter((u) => u.status === "active").length,
    inactifs: users.filter((u) => u.status === "inactive" || u.status === "suspended").length,
    admins: users.filter((u) => u.roles.includes("admin")).length,
  };

  // Définition des colonnes du DataGrid
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
      headerClassName: "table-header",
    },
    {
      field: "nom",
      headerName: "Nom",
      width: 150,
      headerClassName: "table-header",
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: dgiColors.neutral[900],
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "prenom",
      headerName: "Prénom",
      width: 150,
      headerClassName: "table-header",
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
      headerClassName: "table-header",
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.85rem",
            color: dgiColors.primary.main,
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "roles",
      headerName: "Rôles",
      width: 200,
      headerClassName: "table-header",
      renderCell: (params: GridRenderCellParams) => {
        const roles = params.value as string[];
        return (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {roles && roles.length > 0 ? (
              roles.map((role, index) => {
                const isAdmin = role.toLowerCase() === "admin";
                return (
                  <Chip
                    key={index}
                    label={role}
                    size="small"
                    sx={{
                      backgroundColor: isAdmin
                        ? alpha(dgiColors.secondary.main, 0.15)
                        : alpha(dgiColors.accent.main, 0.15),
                      color: isAdmin ? dgiColors.secondary.main : dgiColors.accent.main,
                      fontWeight: 600,
                      fontSize: "0.7rem",
                    }}
                  />
                );
              })
            ) : (
              <Chip
                label="Aucun"
                size="small"
                sx={{
                  backgroundColor: alpha(dgiColors.neutral[500], 0.1),
                  color: dgiColors.neutral[700],
                  fontSize: "0.7rem",
                }}
              />
            )}
          </Box>
        );
      },
    },
    {
      field: "ur",
      headerName: "UR",
      width: 100,
      headerClassName: "table-header",
    },
    {
      field: "brigade",
      headerName: "Brigade",
      width: 120,
      headerClassName: "table-header",
    },
    {
      field: "status",
      headerName: "Statut",
      width: 120,
      headerClassName: "table-header",
      renderCell: (params: GridRenderCellParams) => {
        const isActive = params.value === "active";
        return (
          <Chip
            label={isActive ? "Actif" : "Inactif"}
            size="small"
            sx={{
              backgroundColor: isActive
                ? alpha("#4CAF50", 0.15)
                : alpha(dgiColors.neutral[500], 0.1),
              color: isActive ? "#2E7D32" : dgiColors.neutral[700],
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      headerClassName: "table-header",
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            onClick={() => handleViewDetails(params.row as User)}
            sx={{
              color: dgiColors.primary.main,
              "&:hover": {
                backgroundColor: alpha(dgiColors.primary.main, 0.1),
              },
            }}
            title="Voir les détails"
            size="small"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => {
              /* TODO: implémenter l'édition */
            }}
            sx={{
              color: dgiColors.accent.main,
              "&:hover": {
                backgroundColor: alpha(dgiColors.accent.main, 0.1),
              },
            }}
            title="Modifier"
            size="small"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => {
              /* TODO: implémenter la suppression */
            }}
            sx={{
              color: dgiColors.secondary.main,
              "&:hover": {
                backgroundColor: alpha(dgiColors.secondary.main, 0.1),
              },
            }}
            title="Supprimer"
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: dgiColors.primary.main }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header avec titre et statistiques */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h4"
            sx={{
              color: dgiColors.neutral[900],
              fontWeight: 700,
            }}
          >
            Gestion des Utilisateurs
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
            sx={{
              backgroundColor: dgiColors.primary.main,
              color: "white",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: dgiColors.primary.dark,
              },
            }}
          >
            Créer un utilisateur
          </Button>
        </Box>

       
      </Box>

      {/* Liste des utilisateurs */}
      <Paper
        sx={{
          borderRadius: 3,
          border: `1px solid ${dgiColors.neutral[200]}`,
          overflow: "hidden",
          p: 3,
        }}
      >
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.id || row.email}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: dgiColors.primary.main,
              color: "white",
              borderColor: dgiColors.neutral[200],
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 700,
              color: "white",
            },
            "& .table-header": {
              backgroundColor: dgiColors.primary.main,
              color: "white !important",
            },
            "& .MuiDataGrid-cell": {
              borderColor: dgiColors.neutral[200],
            },
            "& .MuiDataGrid-footerContainer": {
              borderColor: dgiColors.neutral[200],
            },
          }}
        />
      </Paper>

      {/* Modal de détails */}
      <Dialog
        open={detailModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${dgiColors.neutral[200]}`,
            pb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <PersonIcon sx={{ color: dgiColors.primary.main, fontSize: 32 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: dgiColors.neutral[900] }}>
                Détails de l'Utilisateur
              </Typography>
              {selectedUser && (
                <Typography variant="body2" sx={{ color: dgiColors.neutral[500], mt: 0.5 }}>
                  {selectedUser.prenom} {selectedUser.nom}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              color: dgiColors.neutral[700],
              "&:hover": {
                backgroundColor: alpha(dgiColors.secondary.main, 0.1),
                color: dgiColors.secondary.main,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {selectedUser && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Informations personnelles */}
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: dgiColors.neutral[700],
                    fontWeight: 700,
                    letterSpacing: "1px",
                  }}
                >
                  Informations Personnelles
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    backgroundColor: alpha(dgiColors.primary.main, 0.05),
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: dgiColors.neutral[700] }}>
                      ID:
                    </Typography>
                    <Typography variant="body2">{selectedUser.id}</Typography>

                    <Typography variant="body2" sx={{ fontWeight: 600, color: dgiColors.neutral[700] }}>
                      Nom:
                    </Typography>
                    <Typography variant="body2">{selectedUser.nom}</Typography>

                    <Typography variant="body2" sx={{ fontWeight: 600, color: dgiColors.neutral[700] }}>
                      Prénom:
                    </Typography>
                    <Typography variant="body2">{selectedUser.prenom}</Typography>

                    <Typography variant="body2" sx={{ fontWeight: 600, color: dgiColors.neutral[700] }}>
                      Email:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                      {selectedUser.email}
                    </Typography>

                    <Typography variant="body2" sx={{ fontWeight: 600, color: dgiColors.neutral[700] }}>
                      Statut:
                    </Typography>
                    <Chip
                      label={selectedUser.status === "active" ? "Actif" : "Inactif"}
                      size="small"
                      sx={{
                        width: "fit-content",
                        backgroundColor:
                          selectedUser.status === "active"
                            ? alpha("#4CAF50", 0.15)
                            : alpha(dgiColors.neutral[500], 0.1),
                        color: selectedUser.status === "active" ? "#2E7D32" : dgiColors.neutral[700],
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Affectation */}
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: dgiColors.neutral[700],
                    fontWeight: 700,
                    letterSpacing: "1px",
                  }}
                >
                  Affectation
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    backgroundColor: alpha(dgiColors.accent.main, 0.05),
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: dgiColors.neutral[700] }}>
                      UR:
                    </Typography>
                    <Typography variant="body2">{selectedUser.ur || "Non spécifié"}</Typography>

                    <Typography variant="body2" sx={{ fontWeight: 600, color: dgiColors.neutral[700] }}>
                      Brigade:
                    </Typography>
                    <Typography variant="body2">{selectedUser.brigade || "Non spécifiée"}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Rôles */}
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: dgiColors.neutral[700],
                    fontWeight: 700,
                    letterSpacing: "1px",
                  }}
                >
                  Rôles et Permissions
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    backgroundColor: alpha(dgiColors.secondary.main, 0.05),
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {selectedUser.roles && selectedUser.roles.length > 0 ? (
                      selectedUser.roles.map((role, index) => (
                        <Chip
                          key={index}
                          label={role}
                          sx={{
                            backgroundColor:
                              role.toLowerCase() === "admin"
                                ? alpha(dgiColors.secondary.main, 0.15)
                                : alpha(dgiColors.accent.main, 0.15),
                            color:
                              role.toLowerCase() === "admin"
                                ? dgiColors.secondary.main
                                : dgiColors.accent.main,
                            fontWeight: 600,
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: dgiColors.neutral[500] }}>
                        Aucun rôle assigné
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Dates */}
              {selectedUser.date_creation && (
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      color: dgiColors.neutral[700],
                      fontWeight: 700,
                      letterSpacing: "1px",
                    }}
                  >
                    Informations Système
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      p: 2,
                      backgroundColor: alpha(dgiColors.neutral[500], 0.05),
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: dgiColors.neutral[700] }}>
                        Créé le:
                      </Typography>
                      <Typography variant="body2">
                        {new Date(selectedUser.date_creation).toLocaleString("fr-FR")}
                      </Typography>

                      {selectedUser.date_modification && (
                        <>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: dgiColors.neutral[700] }}>
                            Modifié le:
                          </Typography>
                          <Typography variant="body2">
                            {new Date(selectedUser.date_modification).toLocaleString("fr-FR")}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: `1px solid ${dgiColors.neutral[200]}`,
            px: 3,
            py: 2,
          }}
        >
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            sx={{
              borderColor: dgiColors.neutral[200],
              color: dgiColors.neutral[700],
              "&:hover": {
                borderColor: dgiColors.neutral[500],
                backgroundColor: dgiColors.neutral[100],
              },
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de création d'utilisateur */}
      <CreateUserModal
        open={createModalOpen}
        onClose={handleCloseCreateModal}
        onUserCreated={handleUserCreated}
      />
    </Box>
  );
};

export default Users;
