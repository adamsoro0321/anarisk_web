import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  alpha,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { useState } from "react";
import UserService from "../services/user.service";
import type { CreateUserData } from "../services/user.service";

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

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ open, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState<CreateUserData>({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    role: "user",
    ur: "",
    brigade: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateUserData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Supprimer l'erreur du champ modifié
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await UserService.create(formData);

      if (response.success) {
        // Réinitialiser le formulaire
        setFormData({
          nom: "",
          prenom: "",
          email: "",
          password: "",
          role: "user",
          ur: "",
          brigade: "",
        });
        setErrors({});
        onUserCreated();
        onClose();
      } else {
        setError(response.message || "Erreur lors de la création de l'utilisateur");
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || "Erreur lors de la création de l'utilisateur"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        role: "user",
        ur: "",
        brigade: "",
      });
      setErrors({});
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
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
          <PersonAddIcon sx={{ color: dgiColors.primary.main, fontSize: 32 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: dgiColors.neutral[900] }}>
              Créer un Utilisateur
            </Typography>
            <Typography variant="body2" sx={{ color: dgiColors.neutral[500], mt: 0.5 }}>
              Remplissez les informations pour créer un nouveau compte
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={loading}
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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Nom */}
          <TextField
            label="Nom *"
            value={formData.nom}
            onChange={(e) => handleChange("nom", e.target.value)}
            error={!!errors.nom}
            helperText={errors.nom}
            disabled={loading}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: dgiColors.primary.main,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: dgiColors.primary.main,
              },
            }}
          />

          {/* Prénom */}
          <TextField
            label="Prénom *"
            value={formData.prenom}
            onChange={(e) => handleChange("prenom", e.target.value)}
            error={!!errors.prenom}
            helperText={errors.prenom}
            disabled={loading}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: dgiColors.primary.main,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: dgiColors.primary.main,
              },
            }}
          />

          {/* Email */}
          <TextField
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            disabled={loading}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: dgiColors.primary.main,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: dgiColors.primary.main,
              },
            }}
          />

          {/* Mot de passe */}
          <TextField
            label="Mot de passe *"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            disabled={loading}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: dgiColors.primary.main,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: dgiColors.primary.main,
              },
            }}
          />

          {/* Rôle */}
          <FormControl
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: dgiColors.primary.main,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: dgiColors.primary.main,
              },
            }}
          >
            <InputLabel>Rôle</InputLabel>
            <Select
              value={formData.role}
              label="Rôle"
              onChange={(e) => handleChange("role", e.target.value)}
              disabled={loading}
            >
              <MenuItem value="user">Utilisateur</MenuItem>
              <MenuItem value="admin">Administrateur</MenuItem>
              <MenuItem value="dcf">DCF</MenuItem>
              <MenuItem value="agent_dcf">Agent DCF</MenuItem>
              <MenuItem value="ur">UR</MenuItem>
              <MenuItem value="bv">BV</MenuItem>
            </Select>
          </FormControl>

          {/* UR */}
          <TextField
            label="Unité de Recouvrement (UR)"
            value={formData.ur}
            onChange={(e) => handleChange("ur", e.target.value)}
            disabled={loading}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: dgiColors.primary.main,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: dgiColors.primary.main,
              },
            }}
          />

          {/* Brigade */}
          <TextField
            label="Brigade"
            value={formData.brigade}
            onChange={(e) => handleChange("brigade", e.target.value)}
            disabled={loading}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: dgiColors.primary.main,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: dgiColors.primary.main,
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: `1px solid ${dgiColors.neutral[200]}`,
          px: 3,
          py: 2,
          gap: 1,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
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
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          sx={{
            backgroundColor: dgiColors.primary.main,
            color: "white",
            "&:hover": {
              backgroundColor: dgiColors.primary.dark,
            },
            "&:disabled": {
              backgroundColor: dgiColors.neutral[200],
            },
          }}
        >
          {loading ? "Création..." : "Créer l'utilisateur"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserModal;
