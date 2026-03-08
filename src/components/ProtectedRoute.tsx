import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  // Vérifie si l'utilisateur est authentifié
  const isAuthenticated = user !== null && token !== null;

  if (!isAuthenticated) {
    // Redirige vers la page de login en sauvegardant la location actuelle
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si children est fourni, on le rend, sinon on utilise Outlet pour les routes imbriquées
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
