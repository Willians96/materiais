import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "convex-generated/api.js";
import { Id } from "convex-generated/dataModel.js";
import { useRouter } from "./hooks/useRouter";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import RequestAccessPage from "./pages/RequestAccessPage";
import DashboardPage from "./pages/DashboardPage";
import MaterialsPage from "./pages/MaterialsPage";
import CategoriesPage from "./pages/CategoriesPage";
import UnitsPage from "./pages/UnitsPage";
import UsersPage from "./pages/UsersPage";
import ImportPage from "./pages/ImportPage";
import ExportPage from "./pages/ExportPage";
import MovimentacoesPage from "./pages/MovimentacoesPage";

// Clerk imports
import { ClerkProvider, useUser } from "@clerk/clerk-react";

// Clerk publishable key - use env variable or fallback to the provided key
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_dG91Y2hpbmctcGhlYXNhbnQtNDkuY2xlcmsuYWNjb3VudHMuZGV2JA";

function AppContent() {
  const { user: clerkUser, isSignedIn: clerkSignedIn, isLoaded: clerkLoaded } = useUser();
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const currentUser = useQuery(
    api.authCustom.getCurrentSession,
    userId ? { userId } : "skip"
  );
  const { route, navigate } = useRouter();

  // Função para carregar userId do localStorage
  const loadUserIdFromStorage = () => {
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId && savedUserId.trim() !== "") {
      try {
        setUserId(savedUserId as Id<"users">);
        return true;
      } catch (error) {
        console.error("UserId inválido:", error);
        clearLocalStorage();
        return false;
      }
    }
    return false;
  };

  // Função para limpar localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("clerkUserId");
    localStorage.removeItem("needsApproval");
    setUserId(null);
  };

  // Verificar se há usuário logado no localStorage (inicial)
  useEffect(() => {
    loadUserIdFromStorage();
    setIsInitializing(false);
  }, []);

  // Escutar evento de sincronização completa do LoginPage
  useEffect(() => {
    const handleAuthSync = () => {
      console.log("Evento auth-sync-complete recebido, recarregando userId...");
      loadUserIdFromStorage();
    };

    window.addEventListener("auth-sync-complete", handleAuthSync);
    return () => window.removeEventListener("auth-sync-complete", handleAuthSync);
  }, []);

  // Limpar localStorage se usuário não foi encontrado (após tentar carregar)
  useEffect(() => {
    if (!isInitializing && userId && currentUser === null) {
      const timeout = setTimeout(() => {
        clearLocalStorage();
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [userId, currentUser, isInitializing]);

  // Se o usuário fez logout no Clerk, limpar tudo
  useEffect(() => {
    if (clerkLoaded && !clerkSignedIn && userId) {
      clearLocalStorage();
    }
  }, [clerkLoaded, clerkSignedIn, userId]);

  // Se ainda está inicializando, mostrar loading
  if (isInitializing) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  // Se não há usuário logado, mostrar página de login
  if (!userId) {
    return <LoginPage />;
  }

  // Se está carregando dados do usuário, mostrar loading
  if (userId && currentUser === undefined) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  // Se o usuário não foi encontrado ou não há currentUser válido
  if (!currentUser) {
    const needsApproval = localStorage.getItem("needsApproval") === "true";
    const pendingUserId = localStorage.getItem("userId");
    const pendingEmail = localStorage.getItem("userEmail");

    if (needsApproval && pendingUserId && pendingEmail) {
      return (
        <RequestAccessPage
          user={{
            _id: pendingUserId as Id<"users">,
            email: pendingEmail,
            name: localStorage.getItem("userName") || undefined,
          }}
        />
      );
    }

    return <LoginPage />;
  }

  // Criar objeto user compatível com os componentes
  const user = {
    _id: currentUser.userId,
    email: currentUser.email,
    name: currentUser.name,
    role: currentUser.role,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentUser={user} currentRoute={route} navigate={navigate} />
      <main className="flex-1 overflow-auto">
        {route === "/" && <DashboardPage />}
        {route === "/materiais" && <MaterialsPage />}
        {route === "/categorias" && <CategoriesPage />}
        {route === "/unidades" && <UnitsPage />}
        {route === "/usuarios" && <UsersPage />}
        {route === "/importar" && <ImportPage />}
        {route === "/exportar" && <ExportPage />}
        {route === "/movimentacoes" && <MovimentacoesPage />}
      </main>
    </div>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <AppContent />
    </ClerkProvider>
  );
}

export default App;