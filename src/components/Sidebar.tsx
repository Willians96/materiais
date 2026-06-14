import { Id } from "convex-generated/dataModel.js";
import { useQuery } from "convex/react";
import { api } from "convex-generated/api.js";

interface SidebarProps {
  currentUser: {
    _id: Id<"users">;
    email: string;
    name?: string;
    role: "admin" | "user";
  };
  currentRoute: string;
  navigate: (path: string) => void;
}

export default function Sidebar({ currentUser, currentRoute, navigate }: SidebarProps) {
  // Buscar usuários pendentes (apenas para admin)
  const users = useQuery(
    api.users.list,
    currentUser.role === "admin" ? { userId: currentUser._id } : "skip"
  );
  
  const pendingCount = users?.filter((u) => !u.approved).length || 0;
  const handleSignOut = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    window.location.href = "/";
  };

  const menuItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/materiais", label: "Materiais", icon: "📦" },
    { path: "/importar", label: "Importar", icon: "📥" },
    { path: "/exportar", label: "Exportar", icon: "📤" },
    { path: "/categorias", label: "Categorias", icon: "🏷️" },
    { path: "/unidades", label: "Unidades", icon: "🏢" },
    ...(currentUser.role === "admin" ? [{ 
      path: "/usuarios", 
      label: "Usuários", 
      icon: "👥",
      badge: pendingCount > 0 ? pendingCount : undefined
    }] : []),
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-900">PMESP</h1>
        <p className="text-sm text-gray-600">Controle de Materiais</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
              currentRoute === item.path
                ? "bg-gray-100 text-blue-900 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </div>
            {item.badge && item.badge > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900">{currentUser.email}</p>
          <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

