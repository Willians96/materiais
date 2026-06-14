import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex-generated/api.js";
import { Id } from "convex-generated/dataModel.js";
import { toast } from "sonner";

interface RequestAccessPageProps {
  user: {
    _id: Id<"users">;
    email: string;
    name?: string;
    unit?: Id<"units">;
  };
}

export default function RequestAccessPage({ user }: RequestAccessPageProps) {
  const [name, setName] = useState(user.name || "");
  const requestAccess = useMutation(api.users.requestAccess);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Se já existe usuário, apenas atualizar dados
      // Unidade será atribuída pelo administrador
      await requestAccess({
        email: user.email,
        name: name || undefined,
      });
      
      toast.success("Solicitação enviada! Aguarde aprovação do administrador.");
      
      // Limpar flag de aprovação pendente
      localStorage.removeItem("needsApproval");
      
      // Mostrar mensagem informativa
      setTimeout(() => {
        alert("Sua solicitação foi enviada. O administrador será notificado e você receberá acesso em breve.");
        // Limpar localStorage e redirecionar para login
        localStorage.clear();
        window.location.href = "/";
      }, 1000);
    } catch (error: any) {
      if (error.message === "Usuário já existe") {
        toast.info("Sua solicitação já foi registrada. Aguarde aprovação do administrador.");
        localStorage.removeItem("needsApproval");
        setTimeout(() => {
          localStorage.clear();
          window.location.href = "/";
        }, 2000);
      } else {
        toast.error(error.message || "Erro ao solicitar acesso");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Solicitar Acesso
          </h1>
          <p className="text-gray-600">
            Complete seu perfil para solicitar acesso ao sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Seu nome completo"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium">ℹ️ Informação</p>
            <p className="mt-1">A unidade será atribuída pelo administrador após a aprovação da sua solicitação.</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors font-medium"
          >
            Solicitar Acesso
          </button>
        </form>
      </div>
    </div>
  );
}

