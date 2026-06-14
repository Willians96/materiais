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

function App() {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<{
    _id: Id<"users">;
    email: string;
    name?: string;
  } | null>(null);

  const currentUser = useQuery(
    api.authCustom.getCurrentSession,
    userId ? { userId } : "skip"
  );
  const { route, navigate } = useRouter();

  // Carregar userId do localStorage na inicialização
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
          _id: pendingId as Id<"users">,
          email: pendingEmail,
          name: pendingName || undefined,
        });
      }
    }

    setIsInitializing(false);
  }, []);

  // Limpar localStorage se usuário não foi encontrado
  useEffect(() => {
    if (!isInitializing && userId && currentUser === null) {
      const timeout = setTimeout(() => {
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
        localStorage.removeItem("needsApproval");
        setUserId(null);
        setNeedsApproval(false);
        setPendingUserData(null);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [userId, currentUser, isInitializing]);

  // Loading inicial
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se precisa de aprovação
  if (needsApproval && pendingUserData) {
    return <RequestAccessPage />;
  }

  // Se não há usuário logado
  if (!userId) {
    return <LoginPage />;
  }

  // Carregando dados do usuário
  if (currentUser === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Validando sessão...</p>
        </div>
      </div>
    );
  }

  // Se usuário não encontrado
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

  // Criar objeto user
  const user = {
    _id: currentUser.userId,
    email: currentUser.email,
    name: currentUser.name,
    role: currentUser.role,
    unit: currentUser.unit,
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

export default App;
