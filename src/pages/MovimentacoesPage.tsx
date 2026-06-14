import { Id } from "convex-generated/dataModel.js";

export default function MovimentacoesPage() {
  const userId = localStorage.getItem("userId") as Id<"users"> | null;

  if (!userId) {
    return <div className="p-8">Por favor, faça login novamente.</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Movimentações</h1>
        <p className="text-gray-600 mt-2">Gestão de movimentações de materiais</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Funcionalidade de movimentações em desenvolvimento.
        </p>
      </div>
    </div>
  );
}

