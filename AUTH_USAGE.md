# Guide d'utilisation de l'authentification - ANARISK

## Architecture du système d'authentification

### 1. Store Zustand (`authStore.ts`)
L'application utilise **Zustand** avec persistance chiffrée pour gérer l'état d'authentification:

```typescript
interface User {
  id: number;
  email: string;
  name?: string;
  nom?: string;
  prenom?: string;
  role?: string;
  roles?: string[];
  ur?: string;           // Unité de Renseignement
  brigade?: string;      // Brigade d'affectation
  [key: string]: unknown;
}

interface AuthState {
  user: User | null;
  token: string | null;
  expiresAt: number | null;
  login: (userData: User, token: string, expiresAt: number) => void;
  logout: () => void;
  setToken: (token: string, expiresAt: number) => void;
  clearToken: () => void;
}
```

### 2. Données utilisateur disponibles (depuis le backend)
Après une connexion réussie, l'objet `user` contient:
- `id`: Identifiant unique de l'utilisateur
- `email`: Adresse email
- `nom`: Nom de famille
- `prenom`: Prénom
- `role`: Rôle principal (string)
- `roles`: Liste des rôles (array)
- `ur`: Unité de Renseignement (string, optionnel)
- `brigade`: Brigade d'affectation (string, optionnel)

**Note**: Ces données sont également encodées dans le token JWT pour un accès sécurisé côté backend.

## Comment accéder à l'utilisateur connecté

### Dans un composant fonctionnel

```typescript
import useAuthStore from "../store/authStore";

const MonComposant = () => {
  // Récupérer l'utilisateur complet
  const user = useAuthStore((state) => state.user);
  
  // Récupérer uniquement le token
  const token = useAuthStore((state) => state.token);
  
  // Récupérer plusieurs valeurs
  const { user, token, logout } = useAuthStore((state) => ({
    user: state.user,
    token: state.token,
    logout: state.logout
  }));

  return (
    <div>
      {user && <p>Bonjour {user.name || user.email}</p>}
    </div>
  );
};
```

### Exemples d'utilisation courante

#### 1. Afficher le nom de l'utilisateur
```typescript
const user = useAuthStore((state) => state.user);
const displayName = user?.name || user?.email || "Utilisateur";
```

#### 2. Afficher l'unité de renseignement et la brigade
```typescript
const user = useAuthStore((state) => state.user);

return (
  <Box>
    <Typography>Utilisateur: {user?.email}</Typography>
    {user?.ur && <Typography>UR: {user.ur}</Typography>}
    {user?.brigade && <Typography>Brigade: {user.brigade}</Typography>}
  </Box>
);
```

#### 2. Vérifier si l'utilisateur est connecté
```typescript
const user = useAuthStore((state) => state.user);
const token = useAuthStore((state) => state.token);
const isAuthenticated = user !== null && token !== null;
```

#### 3. Déconnexion
```typescript
const logout = useAuthStore((state) => state.logout);
const navigate = useNavigate();

const handleLogout = () => {
  logout();
  navigate("/login", { replace: true });
};
```

#### 4. Inclure le token dans les requêtes API
```typescript
const token = useAuthStore((state) => state.token);

// Avec axios
const response = await axios.get('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Avec l'instance API configurée (recommandé)
import { API } from "../../api/API.js";
const response = await API.get('/endpoint'); // Token ajouté automatiquement
```

## Routes protégées

### ProtectedRoute Component
Le composant `ProtectedRoute` vérifie automatiquement l'authentification:

```typescript
// src/components/ProtectedRoute.tsx
const ProtectedRoute: React.FC = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = user !== null && token !== null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
```

### Utilisation dans le routage
```typescript
// App.tsx
{
  element: <ProtectedRoute />,
  children: [
    { path: "dashboard", element: <Dashboard /> },
    { path: "contribuables", element: <ContribuablesList /> },
    // ...
  ]
}
```

## Persistance et sécurité

### Chiffrement des données
Les données d'authentification sont chiffrées avec AES avant d'être stockées dans localStorage:

```typescript
// Clé secrète configurée dans authStore.ts
const SECRET_KEY = "1234567890abcdef";

// Les données sont automatiquement chiffrées/déchiffrées
const encryptedLocalStorage = {
  getItem: (name: string) => decryptData(localStorage.getItem(name)),
  setItem: (name: string, value: string) => {
    const encrypted = encryptData(value);
    localStorage.setItem(name, encrypted);
  }
};
```

**⚠️ Important**: En production, la clé secrète devrait être gérée de manière sécurisée via des variables d'environnement.

### Expiration du token
Le token JWT a une expiration qui est vérifiée:
```typescript
const expiresAt = useAuthStore((state) => state.expiresAt);
const isTokenExpired = expiresAt ? Date.now() > expiresAt : false;
```

## Flux d'authentification

### 1. Connexion
```
User → Login Form → API.post('/login') → Backend vérifie credentials
→ Retour: { token, user } → authStore.login(user, token, expiresAt)
→ localStorage (chiffré) → Navigation vers Dashboard
```

### 2. Vérification de session
```
Page Load → AuthStore lit localStorage (déchiffre)
→ Si user + token valides → Accès autorisé
→ Sinon → Redirection vers /login
```

### 3. Déconnexion
```
User → Logout button → authStore.logout()
→ Clear state → Clear localStorage → Navigate to /login
```

## Exemple complet: ContribuablesProgrammes

```typescript
import useAuthStore from "../../store/authStore";

const ContribuablesProgrammes = () => {
  // Accéder à l'utilisateur
  const user = useAuthStore((state) => state.user);

  const handleUpload = async () => {
    // L'utilisateur est disponible pour audit/logging
    console.log('Upload initié par:', {
      email: user?.email,
      ur: user?.ur,
      brigade: user?.brigade,
      fileName: selectedFile.name
    });
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    // Le token est automatiquement ajouté par l'instance API
    const response = await API.post('/upload-programme-file', formData);
  };

  return (
    <Box>
      {user && (
        <Box>
          <Typography variant="caption">
            Connecté: {user.name || user.email}
          </Typography>
          {(user.ur || user.brigade) && (
            <Typography variant="caption">
              {user.ur && `UR: ${user.ur}`}
              {user.ur && user.brigade && ' • '}
              {user.brigade && `Brigade: ${user.brigade}`}
            </Typography>
          )}
        </Box>
      )}
      {/* Reste du composant */}
    </Box>
  );
};
```

## Bonnes pratiques

1. **Toujours vérifier si user existe** avant d'accéder à ses propriétés:
   ```typescript
   {user && <p>{user.email}</p>}
   // ou
   const email = user?.email || 'Non connecté';
   ```

2. **Utiliser les sélecteurs Zustand de manière optimisée**:
   ```typescript
   // ✅ Bon - Ne re-render que si user change
   const user = useAuthStore((state) => state.user);
   
   // ❌ Éviter - Re-render à chaque changement du store
   const store = useAuthStore();
   ```

3. **Gérer l'expiration du token**:
   ```typescript
   useEffect(() => {
     const checkTokenExpiration = () => {
       const expiresAt = useAuthStore.getState().expiresAt;
       if (expiresAt && Date.now() > expiresAt) {
         logout();
         navigate('/login');
       }
     };
     
     const interval = setInterval(checkTokenExpiration, 60000); // Vérif toutes les minutes
     return () => clearInterval(interval);
   }, []);
   ```

4. **Logging et audit**:
   ```typescript
   const logAction = (action: string) => {
     const user = useAuthStore.getState().user;
     console.log(`[${new Date().toISOString()}] ${user?.email}: ${action}`);
   };
   ```

## Debugging

### Inspecter l'état d'authentification dans la console
```javascript
// Dans les DevTools
localStorage.getItem('auth-storage'); // Données chiffrées
useAuthStore.getState(); // État actuel
```

### Vider le cache d'authentification
```javascript
localStorage.removeItem('auth-storage');
window.location.reload();
```

---

**Dernière mise à jour**: Février 2026  
**Fichiers principaux**:
- `src/store/authStore.ts`
- `src/pages/Login.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/api/auth.py` (backend)
