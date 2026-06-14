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
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, UserButton } from "@clerk/clerk-react";

// Clerk publishable key - use env variable or fallback to the provided key
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_dG91Y2hpbmctcGhlYXNhbnQtNDkuY2xlcmsuYWNjb3VudHMuZGV2JA";

function AppContent() {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const currentUser = useQuery(
    api.authCustom.getCurrentSession,
    userId ? { userId } : "skip"
  );
  const { route, navigate } = useRouter();

  // Verificar se há usuário logado no localStorage
  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId && savedUserId.trim() !== "") {
      try {
        if (savedUserId.length > 0) {
          setUserId(savedUserId as Id<"users">);
        } else {
          localStorage.removeItem("userId");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userName");
          localStorage.removeItem("userRole");
          localStorage.removeItem("clerkUserId");
        }
      } catch (error) {
        console.error("UserId inválido:", error);
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
        localStorage.removeItem("clerkUserId");
      }
    }
    setIsInitializing(false);
  }, []);

  // Limpar localStorage se usuário não foi encontrado (após tentar carregar)
  useEffect(() => {
    if (!isInitializing && userId && currentUser === null) {
      const timeout = setTimeout(() => {
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
        localStorage.removeItem("clerkUserId");
        setUserId(null);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [userId, currentUser, isInitializing]);

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