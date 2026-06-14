import { useQuery, useMutation } from "convex/react";
import { api } from "convex-generated/api.js";
import { Id } from "convex-generated/dataModel.js";
import { toast } from "sonner";

export default function UsersPage() {
  const currentUserId = localStorage.getItem("userId") as Id<"users"> | null;
  const users = useQuery(
    api.users.list,
    currentUserId ? { userId: currentUserId } : "skip"
  );
  const units = useQuery(api.units.list);
  const approve = useMutation(api.users.approve);
  const updateRole = useMutation(api.users.updateRole);
  const updateUnit = useMutation(api.users.updateUnit);
  const toggleActive = useMutation(api.users.toggleActive);

  const pendingUsers = users?.filter((u) => !u.approved) || [];
  const approvedUsers = users?.filter((u) => u.approved) || [];

  // Função auxiliar para obter o nome da unidade
  const getUnitName = (unitId: Id<"units"> | undefined): string => {
    if (!unitId || !units) return "-";
    const unit = units.find((u) => u._id === unitId);
    return unit?.name || "-";
  };

  if (!currentUserId) {
    return <div className="p-8">Por favor, faça login novamente.</div>;
  }

  // Estado de carregamento
  if (users === undefined) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  // Erro ao carregar
  if (users === null) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium">Erro ao carregar usuários</p>
          <p className="text-red-600 text-sm mt-2">
            Verifique se você tem permissão de administrador ou tente recarregar a página.
          </p>
        </div>
      </div>
    );
  }

  const handleApprove = async (userId: Id<"users">) => {
    if (!currentUserId) {
      toast.error("Você precisa estar logado para aprovar usuários");
      return;
    }

    try {
      const result = await approve({ userId, currentUserId });
      toast.success(result?.message || "Usuário aprovado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao aprovar usuário:", error);
      const errorMessage = error.message || "Erro ao aprovar usuário";
      toast.error(errorMessage);
    }
  };

  const handleRoleChange = async (userId: Id<"users">, role: "admin" | "user") => {
    try {
      await updateRole({ userId, currentUserId, role });
      toast.success("Papel atualizado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar papel");
    }
  };

  const handleUnitChange = async (userId: Id<"users">, unitId: Id<"units"> | undefined) => {
    try {
      await updateUnit({ userId, currentUserId, unit: unitId });
      toast.success("Unidade atualizada!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar unidade");
    }
  };

  const handleToggleActive = async (userId: Id<"users">) => {
    try {
      await toggleActive({ userId, currentUserId });
      toast.success("Status atualizado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
        <p className="text-gray-600 mt-2">Gerencie os usuários do sistema</p>
      </div>

      {/* Usuários Pendentes */}
      {pendingUsers.length > 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Usuários Pendentes ({pendingUsers.length})
          </h2>
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user._id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.email}</p>
                  {user.name && <p className="text-sm text-gray-600">{user.name}</p>}
                  {user.unit && (
                    <p className="text-xs text-gray-500 mt-1">Unidade: {getUnitName(user.unit)}</p>
                  )}
                </div>
                <button
                  onClick={() => handleApprove(user._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Aprovar
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-medium">✓ Nenhum usuário pendente de aprovação</p>
        </div>
      )}

      {/* Usuários Aprovados */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Usuários Aprovados ({approvedUsers.length})
          </h2>
        </div>
        {approvedUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhum usuário aprovado ainda.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Papel</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Unidade</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {approvedUsers.map((user) => (
              <tr key={user._id}>
                <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.name || "-"}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value as "admin" | "user")}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.unit || ""}
                    onChange={(e) => handleUnitChange(user._id, e.target.value as Id<"units"> | undefined)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="">Sem unidade</option>
                    {units?.map((unit) => (
                      <option key={unit._id} value={unit._id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {user.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleActive(user._id)}
                    className={`text-sm px-3 py-1 rounded ${
                      user.active
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {user.active ? "Desativar" : "Ativar"}
                  </button>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

