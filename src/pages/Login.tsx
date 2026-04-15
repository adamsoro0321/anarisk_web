import {
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
  Shield as ShieldIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
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
  Slide,
  Zoom,
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
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, 
          ${alpha(dgiColors.primary.dark, 0.95)} 0%, 
          ${alpha(dgiColors.primary.main, 0.9)} 35%,
          ${alpha(dgiColors.accent.main, 0.3)} 100%)`,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, ${alpha(dgiColors.accent.main, 0.15)} 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${alpha(dgiColors.primary.light, 0.15)} 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, ${alpha("#fff", 0.05)} 0%, transparent 50%)
          `,
          animation: "gradientShift 15s ease infinite",
        },
        "@keyframes gradientShift": {
          "0%, 100%": {
            opacity: 1,
          },
          "50%": {
            opacity: 0.8,
          },
        },
      }}
    >
      {/* Décoration de fond animée */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(dgiColors.accent.main, 0.2)} 0%, transparent 70%)`,
          filter: "blur(60px)",
          animation: "float 20s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translate(0, 0) scale(1)" },
            "50%": { transform: "translate(-50px, -50px) scale(1.1)" },
          },
        }}
      />
      
      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(dgiColors.primary.light, 0.2)} 0%, transparent 70%)`,
          filter: "blur(60px)",
          animation: "float 25s ease-in-out infinite reverse",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Fade in={true} timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              borderRadius: 5,
              overflow: "hidden",
              background: alpha("#fff", 0.98),
              backdropFilter: "blur(20px)",
              boxShadow: `
                0 10px 40px ${alpha(dgiColors.primary.dark, 0.2)},
                0 0 0 1px ${alpha("#fff", 0.1)} inset
              `,
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: `
                  0 20px 60px ${alpha(dgiColors.primary.dark, 0.3)},
                  0 0 0 1px ${alpha("#fff", 0.1)} inset
                `,
              },
            }}
          >
            {/* Panneau gauche - Branding avec design moderne */}
            <Box
              sx={{
                width: { xs: "0%", md: "45%" },
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: `linear-gradient(135deg, 
                  ${dgiColors.primary.main} 0%, 
                  ${dgiColors.primary.dark} 100%)`,
                p: 6,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Patterns géométriques modernes */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.1,
                  background: `
                    linear-gradient(45deg, transparent 48%, ${alpha("#fff", 0.3)} 49%, ${alpha("#fff", 0.3)} 51%, transparent 52%),
                    linear-gradient(-45deg, transparent 48%, ${alpha("#fff", 0.3)} 49%, ${alpha("#fff", 0.3)} 51%, transparent 52%)
                  `,
                  backgroundSize: "30px 30px",
                }}
              />

              {/* Cercles décoratifs avec animation */}
              {[...Array(3)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    position: "absolute",
                    width: 200 - i * 50,
                    height: 200 - i * 50,
                    borderRadius: "50%",
                    border: `2px solid ${alpha("#fff", 0.1 - i * 0.03)}`,
                    top: `${20 + i * 10}%`,
                    right: `${-10 + i * 5}%`,
                    animation: `spin${i} ${30 + i * 10}s linear infinite`,
                    "@keyframes spin0": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                    "@keyframes spin1": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(-360deg)" },
                    },
                    "@keyframes spin2": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              ))}

              <Zoom in={true} timeout={800} style={{ transitionDelay: "200ms" }}>
                <Box sx={{ position: "relative", zIndex: 2, textAlign: "center" }}>
                  {/* Logo avec effet glassmorphism */}
                  <Box
                    sx={{
                      width: 90,
                      height: 90,
                      borderRadius: "24px",
                      background: "#fff",
                      backdropFilter: "blur(10px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 4,
                      padding: 2,
                      border: `2px solid ${alpha("#fff", 0.9)}`,
                      boxShadow: `0 8px 32px ${alpha("#000", 0.15)}`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05) rotate(5deg)",
                        boxShadow: `0 12px 48px ${alpha("#000", 0.25)}`,
                      },
                    }}
                  >
                    <img
                      src={dgi_logo}
                      alt="DGI Logo"
                      style={{
                        width: "70px",
                        height: "70px",
                        objectFit: "contain",
                      }}
                    />
                  </Box>

                  <Typography
                    variant="h3"
                    sx={{
                      color: "#fff",
                      fontWeight: 800,
                      mb: 2,
                      letterSpacing: 2,
                      textShadow: `0 2px 20px ${alpha("#000", 0.2)}`,
                    }}
                  >
                    ANARISK
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      color: alpha("#fff", 0.95),
                      mb: 4,
                      lineHeight: 1.6,
                      fontWeight: 500,
                      maxWidth: 320,
                      mx: "auto",
                    }}
                  >
                    Système d'Analyse des Risques Fiscaux
                  </Typography>

                  {/* Features avec icônes */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 5 }}>
                    {[
                      { icon: ShieldIcon, text: "Generer des contribuable à risque" },
                      { icon: TrendingUpIcon, text: "Analyse en temps réel" },
                      { icon: SecurityIcon, text: "Génération de fiches de vérification" },
                    ].map((item, index) => (
                      <Slide
                        key={index}
                        in={true}
                        direction="right"
                        timeout={600}
                        style={{ transitionDelay: `${400 + index * 200}ms` }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            color: alpha("#fff", 0.9),
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateX(10px)",
                              color: "#fff",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              background: alpha("#fff", 0.15),
                              backdropFilter: "blur(10px)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: `1px solid ${alpha("#fff", 0.2)}`,
                            }}
                          >
                            <item.icon sx={{ fontSize: 20 }} />
                          </Box>
                          <Typography variant="body1" fontWeight={500}>
                            {item.text}
                          </Typography>
                        </Box>
                      </Slide>
                    ))}
                  </Box>

                  {/* Badge Burkina Faso */}
                  <Box
                    sx={{
                      mt: 6,
                      pt: 4,
                      borderTop: `1px solid ${alpha("#fff", 0.2)}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: alpha("#fff", 0.7),
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        letterSpacing: 1,
                      }}
                    >
                      Direction Générale des Impôts
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: alpha("#fff", 0.6),
                        fontSize: "0.75rem",
                        mt: 0.5,
                      }}
                    >
                      🇧🇫 Burkina Faso
                    </Typography>
                  </Box>
                </Box>
              </Zoom>
            </Box>

            {/* Panneau droit - Formulaire moderne */}
            <Box
              sx={{
                width: { xs: "100%", md: "55%" },
                p: { xs: 4, sm: 6, md: 7 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                backgroundColor: "#fff",
              }}
            >
              {/* Header mobile avec animations */}
              <Slide in={true} direction="down" timeout={600}>
                <Box
                  sx={{
                    display: { xs: "flex", md: "none" },
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 5,
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 3,
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                      boxShadow: `0 8px 24px ${alpha(dgiColors.primary.main, 0.3)}`,
                      border: `2px solid ${alpha(dgiColors.primary.main, 0.1)}`,
                    }}
                  >
                    <img
                      src={dgi_logo}
                      alt="DGI Logo"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: dgiColors.primary.main,
                      letterSpacing: 1,
                    }}
                  >
                    ANARISK
                  </Typography>
                </Box>
              </Slide>

              {/* Titre avec animation */}
              <Fade in={true} timeout={800} style={{ transitionDelay: "300ms" }}>
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: dgiColors.neutral[900],
                      mb: 1.5,
                      background: `linear-gradient(135deg, ${dgiColors.primary.main}, ${dgiColors.accent.main})`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Bienvenue
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: dgiColors.neutral[600],
                      fontSize: "1.05rem",
                    }}
                  >
                    Connectez-vous pour accéder à votre espace
                  </Typography>
                </Box>
              </Fade>

              <Formik
                validationSchema={userSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  setLoginError(null);
                  try {
                  
                    const resp = await axios.post(
                      `${import.meta.env.VITE_API_URL}/api/v1/login`,
                      values
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
                      setLoginError(
                        error.response.data?.message || "Identifiants incorrects"
                      );
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
                    {/* Email Field avec style moderne */}
                    <Slide in={true} direction="left" timeout={600} style={{ transitionDelay: "400ms" }}>
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
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 2,
                                  background: alpha(dgiColors.primary.main, 0.08),
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  mr: 1,
                                }}
                              >
                                <EmailIcon
                                  sx={{
                                    color: dgiColors.primary.main,
                                    fontSize: 20,
                                  }}
                                />
                              </Box>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            backgroundColor: alpha(dgiColors.neutral[100], 0.5),
                            transition: "all 0.3s ease",
                            "& fieldset": {
                              borderColor: dgiColors.neutral[200],
                              borderWidth: 2,
                            },
                            "&:hover": {
                              backgroundColor: alpha(dgiColors.primary.main, 0.02),
                              "& fieldset": {
                                borderColor: dgiColors.primary.light,
                              },
                            },
                            "&.Mui-focused": {
                              backgroundColor: "#fff",
                              boxShadow: `0 0 0 4px ${alpha(dgiColors.primary.main, 0.1)}`,
                              "& fieldset": {
                                borderColor: dgiColors.primary.main,
                              },
                            },
                          },
                          "& .MuiInputLabel-root": {
                            fontWeight: 500,
                            "&.Mui-focused": {
                              color: dgiColors.primary.main,
                            },
                          },
                        }}
                      />
                    </Slide>

                    {/* Password Field avec style moderne */}
                    <Slide in={true} direction="left" timeout={600} style={{ transitionDelay: "500ms" }}>
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
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 2,
                                  background: alpha(dgiColors.primary.main, 0.08),
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  mr: 1,
                                }}
                              >
                                <LockIcon
                                  sx={{
                                    color: dgiColors.primary.main,
                                    fontSize: 20,
                                  }}
                                />
                              </Box>
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                edge="end"
                                sx={{
                                  color: dgiColors.neutral[500],
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    color: dgiColors.primary.main,
                                    backgroundColor: alpha(dgiColors.primary.main, 0.08),
                                  },
                                }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            backgroundColor: alpha(dgiColors.neutral[100], 0.5),
                            transition: "all 0.3s ease",
                            "& fieldset": {
                              borderColor: dgiColors.neutral[200],
                              borderWidth: 2,
                            },
                            "&:hover": {
                              backgroundColor: alpha(dgiColors.primary.main, 0.02),
                              "& fieldset": {
                                borderColor: dgiColors.primary.light,
                              },
                            },
                            "&.Mui-focused": {
                              backgroundColor: "#fff",
                              boxShadow: `0 0 0 4px ${alpha(dgiColors.primary.main, 0.1)}`,
                              "& fieldset": {
                                borderColor: dgiColors.primary.main,
                              },
                            },
                          },
                          "& .MuiInputLabel-root": {
                            fontWeight: 500,
                            "&.Mui-focused": {
                              color: dgiColors.primary.main,
                            },
                          },
                        }}
                      />
                    </Slide>

                    {/* Error Alert moderne */}
                    {loginError && (
                      <Zoom in={true}>
                        <Alert
                          severity="error"
                          sx={{
                            borderRadius: 3,
                            backgroundColor: alpha(dgiColors.secondary.main, 0.05),
                            border: `2px solid ${alpha(dgiColors.secondary.main, 0.15)}`,
                            fontWeight: 500,
                            "& .MuiAlert-icon": {
                              color: dgiColors.secondary.main,
                            },
                          }}
                        >
                          {loginError}
                        </Alert>
                      </Zoom>
                    )}

                    {/* Forgot Password Link moderne */}
                    <Fade in={true} timeout={800} style={{ transitionDelay: "600ms" }}>
                      <Box sx={{ textAlign: "right" }}>
                        <Link to="/change-password" style={{ textDecoration: "none" }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: dgiColors.primary.main,
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              position: "relative",
                              display: "inline-block",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                color: dgiColors.primary.dark,
                                "&::after": {
                                  width: "100%",
                                },
                              },
                              "&::after": {
                                content: '""',
                                position: "absolute",
                                bottom: -2,
                                left: 0,
                                width: 0,
                                height: 2,
                                backgroundColor: dgiColors.primary.main,
                                transition: "width 0.3s ease",
                              },
                            }}
                          >
                            Mot de passe oublié ?
                          </Typography>
                        </Link>
                      </Box>
                    </Fade>

                    {/* Submit Button moderne avec effet glassmorphism */}
                    <Slide in={true} direction="up" timeout={600} style={{ transitionDelay: "700ms" }}>
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
                          mt: 2,
                          py: 1.8,
                          borderRadius: 3,
                          textTransform: "none",
                          fontSize: "1.05rem",
                          fontWeight: 600,
                          background: `linear-gradient(135deg, ${dgiColors.primary.main}, ${dgiColors.primary.dark})`,
                          boxShadow: `0 8px 24px ${alpha(dgiColors.primary.main, 0.35)}`,
                          position: "relative",
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: "-100%",
                            width: "100%",
                            height: "100%",
                            background: `linear-gradient(90deg, transparent, ${alpha("#fff", 0.2)}, transparent)`,
                            transition: "left 0.5s ease",
                          },
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: `0 12px 32px ${alpha(dgiColors.primary.main, 0.45)}`,
                            "&::before": {
                              left: "100%",
                            },
                          },
                          "&:active": {
                            transform: "translateY(0)",
                          },
                          "&:disabled": {
                            background: dgiColors.neutral[300],
                            boxShadow: "none",
                          },
                        }}
                      >
                        {isSubmitting ? "Connexion en cours..." : "Se connecter"}
                      </Button>
                    </Slide>
                  </Box>
                )}
              </Formik>

              {/* Footer élégant */}
              <Fade in={true} timeout={1000} style={{ transitionDelay: "800ms" }}>
                <Box
                  sx={{
                    textAlign: "center",
                    mt: 6,
                    pt: 4,
                    borderTop: `2px solid ${alpha(dgiColors.neutral[300], 0.5)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: dgiColors.neutral[500],
                      fontSize: "0.85rem",
                      fontWeight: 500,
                    }}
                  >
                    © {new Date().getFullYear()} Direction Générale des Impôts
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: dgiColors.neutral[400],
                      fontSize: "0.75rem",
                      mt: 0.5,
                    }}
                  >
                    🇧🇫 Burkina Faso • Tous droits réservés
                  </Typography>
                </Box>
              </Fade>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;
