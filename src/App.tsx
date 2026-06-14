import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
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
  const [needsApproval, setNeedsApproval] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<{
    userId: Id<"users">;
    email: string;
    name?: string;
  } | null>(null);
  const [syncing, setSyncing] = useState(false);

  const syncClerkUser = useMutation(api.authCustom.syncClerkUser);
  const currentUser = useQuery(
    api.authCustom.getCurrentSession,
    userId ? { userId } : "skip"
  );
  const { route, navigate } = useRouter();

  // Função para limpar localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("clerkUserId");
    localStorage.removeItem("needsApproval");
  };

  // Sincronizar usuário Clerk → Convex quando Clerk detectar login
  useEffect(() => {
    if (clerkLoaded && clerkSignedIn && clerkUser && !syncing && !userId) {
      const syncUser = async () => {
        setSyncing(true);
        try {
          const userEmail = clerkUser.primaryEmailAddress?.emailAddress ||
                            clerkUser.emailAddresses?.[0]?.emailAddress || "";

          console.log("App.tsx: Sincronizando usuário Clerk:", {
            clerkUserId: clerkUser.id,
            email: userEmail
          });

          const result = await syncClerkUser({
            clerkUserId: clerkUser.id,
            email: userEmail,
            name: clerkUser.fullName || clerkUser.firstName || undefined,
          });

          if (result) {
            console.log("App.tsx: Usuário sincronizado:", result);

            // Salvar no localStorage
            localStorage.setItem("userId", result.userId);
            localStorage.setItem("userEmail", result.email);
            localStorage.setItem("userName", result.name || "");
            localStorage.setItem("userRole", result.role);
            localStorage.setItem("clerkUserId", clerkUser.id);

            if (!result.approved) {
              // Usuário pendente de aprovação
              localStorage.setItem("needsApproval", "true");
              setNeedsApproval(true);
              setPendingUserData({
                userId: result.userId,
                email: result.email,
                name: result.name,
              });
            } else if (!result.active) {
              // Usuário inativo
              localStorage.removeItem("needsApproval");
              clearLocalStorage();
              setUserId(null);
              // Não pode chamar signOut aqui porque causaria loop
            } else {
              // Usuário aprovado e ativo - LIBERAR ACESSO
              localStorage.removeItem("needsApproval");
              setNeedsApproval(false);
              setUserId(result.userId);
            }
          }
        } catch (error: any) {
          console.error("App.tsx: Erro ao sincronizar usuário:", error);
          clearLocalStorage();
          setUserId(null);
        } finally {
          setSyncing(false);
        }
      };

      syncUser();
    }
  }, [clerkLoaded, clerkSignedIn, clerkUser, syncing, userId, syncClerkUser]);

  // Verificar localStorage na inicialização (caso usuário já esteja logado)
  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId && savedUserId.trim() !== "") {
      setUserId(savedUserId as Id<"users">);
    }

    // Verificar se tem flag de needsApproval
    if (localStorage.getItem("needsApproval") === "true") {
      const pendingId = localStorage.getItem("userId");
      const pendingEmail = localStorage.getItem("userEmail");
      const pendingName = localStorage.getItem("userName");
      if (pendingId && pendingEmail) {
        setNeedsApproval(true);
        setPendingUserData({
          userId: pendingId as Id<"users">,
          email: pendingEmail,
          name: pendingName || undefined,
        });
      }
    }

    setIsInitializing(false);
  }, []);

  // Limpar localStorage se usuário não foi encontrado no Convex
  useEffect(() => {
    if (!isInitializing && userId && currentUser === null) {
      const timeout = setTimeout(() => {
        console.log("App.tsx: Usuário não encontrado no Convex, limpando...");
        clearLocalStorage();
        setUserId(null);
        setNeedsApproval(false);
        setPendingUserData(null);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [userId, currentUser, isInitializing]);

  // Se o usuário fez logout no Clerk, limpar tudo
  useEffect(() => {
    if (clerkLoaded && !clerkSignedIn && userId) {
      console.log("App.tsx: Clerk detectou logout, limpando...");
      clearLocalStorage();
      setUserId(null);
      setNeedsApproval(false);
      setPendingUserData(null);
    }
  }, [clerkLoaded, clerkSignedIn, userId]);

  // Se ainda está inicializando ou sincronizando, mostrar loading
  if (isInitializing || syncing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {syncing ? "Sincronizando com o sistema..." : "Carregando..."}
          </p>
        </div>
      </div>
    );
  }

  // Se o usuário precisa de aprovação, mostrar página de solicitação
  if (needsApproval && pendingUserData) {
    return <RequestAccessPage user={pendingUserData} />;
  }

  // Se não há usuário logado, mostrar página de login
  if (!userId) {
    return <LoginPage />;
  }

  // Se está carregando dados do usuário, mostrar loading
  if (userId && currentUser === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Validando sessão...</p>
        </div>
      </div>
    );
  }

  // Se o usuário não foi encontrado
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando credenciais...</p>
        </div>
      </div>
    );
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