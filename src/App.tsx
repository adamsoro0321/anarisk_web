import ThemeProvider from "react-bootstrap/ThemeProvider";
import { createBrowserRouter, Outlet, RouterProvider, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./pages/home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuthStore from "./store/authStore";

// Dashboard pages
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardStats from "./pages/dashboard/DashboardStats";
import DashboardAnalyses from "./pages/dashboard/DashboardAnalyses";

// Contribuables pages
import ContribuablesList from "./pages/contribuables/ContribuablesList";
import ContribuablesSearch from "./pages/contribuables/ContribuablesSearch";
//import ContribuablesRisques from "./pages/contribuables/ContribuablesRisques";
import ContribuableDetail from "./pages/contribuables/ContribuableDetail";

// Indicateurs pages
import Indicateurs from "./pages/indicateurs/Indicateurs";

// Programmes pages
import FichesList from './pages/fiches/fiche';
import Parametres from './pages/parametres/parametre';
import BrigadesPage from './pages/parametres/BrigadesPage';
import QuantumesPage from './pages/parametres/QuantumesPage';
import Users from './pages/parametres/User';
import ContribuablesProgrammes from "./pages/contribuables/ContribuablesProgrammes";
import IndicateursImportExport from "./pages/indicateurs/IndicateursImportExport";
import IndicateursComptabilite from "./pages/indicateurs/IndicateursComptabilite";

const MainLayout = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

// Composant pour rediriger les utilisateurs déjà connectés
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // Si déjà connecté, rediriger vers la page d'accueil
  if (user && token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        // Route de login (accessible uniquement si non connecté)
        {
          path: "login",
          element: (
            <PublicRoute>
              <Login />
            </PublicRoute>
          ),
        },
        // Routes protégées (nécessitent une authentification)
        {
          element: <ProtectedRoute />,
          children: [
            {
              element: <Home />,
              children: [
                // Route par défaut - Dashboard
                { index: true, element: <Navigate to="/" replace /> },
        
                // Dashboard routes
                { path: "dashboard", element: <Dashboard /> },
                { path: "dashboard/stats", element: <DashboardStats /> },
                { path: "dashboard/analyses", element: <DashboardAnalyses /> },
                
                // Contribuables routes
                { path: "contribuables", element: <ContribuablesList /> },
                { path: "contribuables/search", element: <ContribuablesSearch /> },
                { path: "contribuables/programmes", element: <ContribuablesProgrammes /> },
                { path: "contribuables/risques", element: <ContribuableDetail /> },
                { path: "contribuables/detail", element: <ContribuableDetail /> },
                { path: "contribuables/detail/:ifu", element: <ContribuableDetail /> },
                
                // Programmes routes
                { path: "fiches", element: <FichesList /> },
                
              
                
                // Indicateurs routes
                { path: "indicateurs/tva", element: <Indicateurs /> },
               { path: "indicateurs/import-export", element: <IndicateursImportExport /> },
                { path: "indicateurs/comptabilite", element: <IndicateursComptabilite /> },
                /// Paramètres
                { path: "parametres", element: <Parametres /> },
                { path: "parametres/brigades", element: <BrigadesPage /> },
                { path: "parametres/quantumes", element: <QuantumesPage /> },
                { path: "parametres/users", element: <Users /> }
              ],
            },
          ],
        },
        // Page 404
        {
          path: "*",
          element: (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100">
              <h1>404 - Page non trouvée</h1>
              <p className="text-muted">La page que vous recherchez n'existe pas.</p>
            </div>
          ),
        },
      ],
    },
  ]);

  return (
    <ThemeProvider
      breakpoints={["xxxl", "xxl", "xl", "lg", "md", "sm", "xs", "xxs"]}
      minBreakpoint="xxs"
    >
      <div className="App container-fluid p-0  vh-100 vw-100">
        <RouterProvider router={router} />
      </div>
    </ThemeProvider>
  );
}

export default App;
