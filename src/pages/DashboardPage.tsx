import { useQuery } from "convex/react";
import { api } from "convex-generated/api.js";
import { Id } from "convex-generated/dataModel.js";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useRouter } from "../hooks/useRouter";

const COLORS = {
  operando: "#10b981",
  descarga: "#6b7280",
  baixado: "#ef4444",
};

export default function DashboardPage() {
  const userId = localStorage.getItem("userId") as Id<"users"> | null;
  const userRole = localStorage.getItem("userRole");
  const { navigate } = useRouter();
  
  const stats = useQuery(
    api.materials.getStats,
    userId ? { userId } : "skip"
  );
  const materials = useQuery(
    api.materials.list,
    userId ? { userId } : "skip"
  );
  
  // Buscar usuários pendentes (apenas para admin)
  const users = useQuery(
    api.users.list,
    userId && userRole === "admin" ? { userId } : "skip"
  );
  
  const pendingUsers = users?.filter((u) => !u.approved) || [];

  if (!stats || !materials) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statusData = [
    { name: "Operando", value: stats.operando, color: COLORS.operando },
    { name: "Descarga", value: stats.descarga, color: COLORS.descarga },
    { name: "Baixado", value: stats.baixado, color: COLORS.baixado },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Visão geral do sistema</p>
      </div>

      {/* Notificação de Usuários Pendentes (apenas para admin) */}
      {userRole === "admin" && pendingUsers.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {pendingUsers.length} usuário(s) aguardando aprovação
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Novos usuários solicitaram acesso ao sistema
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/usuarios")}
              className="ml-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              Ver Solicitações
            </button>
          </div>
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Materiais</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Operando</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.operando}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Descarga</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">{stats.descarga}</p>
            </div>
            <div className="text-4xl">ℹ️</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Baixado</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.baixado}</p>
            </div>
            <div className="text-4xl">🗑️</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Distribuição por Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Distribuição por Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Barras - Materiais por Unidade */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Materiais por Unidade
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.unidades}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#1e40af" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

