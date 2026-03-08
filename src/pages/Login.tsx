import {
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
  AccountBalance as AccountBalanceIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Fade,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import axios from "axios";
import { Formik } from "formik";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { object, string } from "yup";
import useAuthStore from "../store/authStore";
import dgi_logo from "../assets/dgi_logo.png";


// Palette DGI Burkina Faso - Couleurs officielles inspirées du drapeau
// Vert (espoir, agriculture), Rouge (révolution), Jaune/Or (richesses)
const dgiColors = {
  // Vert officiel DGI
  primary: {
    main: "#006B3F", // Vert foncé du drapeau
    light: "#2E8B57",
    dark: "#004D2C",
    contrastText: "#FFFFFF",
  },
  // Accent doré
  accent: {
    main: "#CE8E00", // Or/Jaune foncé
    light: "#E6A817",
    dark: "#996600",
  },
  // Rouge accent (utilisé avec parcimonie)
  secondary: {
    main: "#CE1126", // Rouge du drapeau
    light: "#E53945",
    dark: "#9C0D1C",
  },
  // Neutres
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

const Login = () => {
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // Schéma de validation
  const userSchema = object({
    email: string()
      .email("Format de l'e-mail incorrect")
      .required("L'adresse e-mail est obligatoire"),
    password: string()
      .required("Le mot de passe est obligatoire")
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  });

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${dgiColors.neutral[50]} 0%, ${dgiColors.neutral[100]} 100%)`,
      }}
    >
      <Container maxWidth="md">
        <Fade in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              border: `1px solid ${dgiColors.neutral[200]}`,
            }}
          >
            {/* Panneau gauche - Branding */}
            <Box
              sx={{
                width: { xs: "0%", md: "45%" },
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: `linear-gradient(180deg, ${dgiColors.primary.main} 0%, ${dgiColors.primary.dark} 100%)`,
                p: 5,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Décoration géométrique subtile */}
              <Box
                sx={{
                  position: "absolute",
                  top: -100,
                  right: -100,
                  width: 300,
                  height: 300,
                  borderRadius: "50%",
                  backgroundColor: alpha(dgiColors.accent.main, 0.1),
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -80,
                  left: -80,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  backgroundColor: alpha("#fff", 0.05),
                }}
              />

              {/* Contenu du panneau gauche */}
              <Box sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                <AccountBalanceIcon
                  sx={{
                    fontSize: 64,
                    color: dgiColors.accent.main,
                    mb: 3,
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    mb: 2,
                    letterSpacing: 1,
                  }}
                >
                  ANARISK
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: alpha("#fff", 0.85),
                    mb: 4,
                    lineHeight: 1.8,
                    maxWidth: 280,
                  }}
                >
                  Système d'Analyse des Risques Fiscaux
                  <br />
                  Direction Générale des Impôts
                </Typography>
                
                {/* Ligne décorative */}
                <Box
                  sx={{
                    width: 60,
                    height: 3,
                    backgroundColor: dgiColors.accent.main,
                    mx: "auto",
                    borderRadius: 2,
                  }}
                />

                <Typography
                  variant="caption"
                  sx={{
                    color: alpha("#fff", 0.6),
                    display: "block",
                    mt: 4,
                    fontSize: "0.75rem",
                  }}
                >
                  Burkina Faso
                </Typography>
              </Box>
            </Box>

            {/* Panneau droit - Formulaire */}
            <Box
              sx={{
                width: { xs: "100%", md: "55%" },
                p: { xs: 4, sm: 6 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                backgroundColor: "#fff",
              }}
            >
              {/* Header mobile uniquement */}
              <Box
                sx={{
                  display: { xs: "flex", md: "none" },
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: 2,
                    backgroundColor: dgiColors.primary.main,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <img
                    src={dgi_logo}
                    alt="DGI Logo"
                    style={{ width: "50px", height: "50px" }}
                  />
                </Box>
              </Box>

              {/* Titre du formulaire */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: dgiColors.neutral[900],
                  mb: 1,
                }}
              >
                Connexion
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: dgiColors.neutral[600],
                  mb: 4,
                }}
              >
                Accédez à votre espace de gestion sécurisé
              </Typography>

              <Formik
                validationSchema={userSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  setLoginError(null);
                  try {
                    console.log("values",values)
                    const resp = await axios.post(
                      `${import.meta.env.VITE_API_URL}/api/v1/login`,
                      values,
                      /*{
                        withCredentials: true,
                      }*/
                    );

                    if (resp.status === 200) {
                      const userData = resp.data.user || { id: 1, email: values.email };
                      const token = resp.data.token || "jwt-token";
                      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
                      login(userData, token, expiresAt);
                      navigate("/");
                    }
                  } catch (error) {
                    if (axios.isAxiosError(error) && error.response) {
                      setLoginError(error.response.data?.message || "Identifiants incorrects");
                    } else {
                      setLoginError("Erreur de connexion. Veuillez réessayer.");
                    }
                  }
                  setSubmitting(false);
                }}
                initialValues={{ email: "", password: "" }}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  isSubmitting,
                }) => (
                  <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                    }}
                  >
                    {/* Email Field */}
                    <TextField
                      label="Adresse email"
                      name="email"
                      variant="outlined"
                      fullWidth
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: dgiColors.neutral[400] }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: dgiColors.neutral[50],
                          "&:hover fieldset": {
                            borderColor: dgiColors.primary.light,
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: dgiColors.primary.main,
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: dgiColors.primary.main,
                        },
                      }}
                    />

                    {/* Password Field */}
                    <TextField
                      label="Mot de passe"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      fullWidth
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: dgiColors.neutral[400] }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                              sx={{ color: dgiColors.neutral[500] }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: dgiColors.neutral[50],
                          "&:hover fieldset": {
                            borderColor: dgiColors.primary.light,
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: dgiColors.primary.main,
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: dgiColors.primary.main,
                        },
                      }}
                    />

                    {/* Error Alert */}
                    {loginError && (
                      <Fade in={true}>
                        <Alert
                          severity="error"
                          sx={{
                            borderRadius: 2,
                            backgroundColor: alpha(dgiColors.secondary.main, 0.08),
                            border: `1px solid ${alpha(dgiColors.secondary.main, 0.2)}`,
                          }}
                        >
                          {loginError}
                        </Alert>
                      </Fade>
                    )}

                    {/* Forgot Password Link */}
                    <Box sx={{ textAlign: "right" }}>
                      <Link to="/change-password" style={{ textDecoration: "none" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: dgiColors.primary.main,
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          Mot de passe oublié ?
                        </Typography>
                      </Link>
                    </Box>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={isSubmitting}
                      startIcon={
                        isSubmitting ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <LoginIcon />
                        )
                      }
                      sx={{
                        mt: 1,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: "1rem",
                        fontWeight: 600,
                        backgroundColor: dgiColors.primary.main,
                        boxShadow: "none",
                        "&:hover": {
                          backgroundColor: dgiColors.primary.dark,
                          boxShadow: `0 4px 12px ${alpha(dgiColors.primary.main, 0.4)}`,
                        },
                        "&:disabled": {
                          backgroundColor: dgiColors.neutral[300],
                        },
                      }}
                    >
                      {isSubmitting ? "Connexion en cours..." : "Se connecter"}
                    </Button>
                  </Box>
                )}
              </Formik>

              {/* Footer */}
              <Box
                sx={{
                  textAlign: "center",
                  mt: 5,
                  pt: 3,
                  borderTop: `1px solid ${dgiColors.neutral[200]}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: dgiColors.neutral[500],
                    fontSize: "0.75rem",
                  }}
                >
                  © 2025 Direction Générale des Impôts • Burkina Faso
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;
