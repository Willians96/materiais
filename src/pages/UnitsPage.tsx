import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex-generated/api.js";
import { Id } from "convex-generated/dataModel.js";
import { toast } from "sonner";

export default function UnitsPage() {
  const userId = localStorage.getItem("userId") as Id<"users"> | null;
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Id<"units"> | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "" });

  const units = useQuery(api.units.list);
  // Não usar getMaterialCount por enquanto - pode ser calculado localmente se necessário
  const create = useMutation(api.units.create);
  const update = useMutation(api.units.update);
  const remove = useMutation(api.units.remove);
  const initializeDefaults = useMutation(api.units.initializeDefaults);

  if (!userId) {
    return <div className="p-8">Por favor, faça login novamente.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUnit) {
        await update({ id: editingUnit, userId, ...formData });
        toast.success("Unidade atualizada!");
      } else {
        await create({ userId, ...formData });
        toast.success("Unidade criada!");
      }
      setShowForm(false);
      setFormData({ name: "", code: "" });
      setEditingUnit(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar unidade");
    }
  };

  const handleDelete = async (id: Id<"units">) => {
    if (!confirm("Tem certeza que deseja excluir esta unidade?")) return;
    try {
      await remove({ id, userId });
      toast.success("Unidade excluída!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir unidade");
    }
  };

  const handleInitialize = async () => {
    if (!confirm("Isso criará as 10 unidades padrão e 7 categorias padrão. Continuar?")) return;
    try {
      await initializeDefaults({ userId });
      toast.success("Sistema inicializado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao inicializar");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unidades</h1>
          <p className="text-gray-600 mt-2">Gerencie as unidades do sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInitialize}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          >
            Inicializar Sistema
          </button>
          <button
            onClick={() => {
              setEditingUnit(null);
              setFormData({ name: "", code: "" });
              setShowForm(true);
            }}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 font-medium"
          >
            + Nova Unidade
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units?.map((unit) => (
          <div key={unit._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{unit.name}</h3>
                {unit.code && <p className="text-sm text-gray-500">{unit.code}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingUnit(unit._id);
                    setFormData({ name: unit.name, code: unit.code || "" });
                    setShowForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(unit._id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Excluir
                </button>
              </div>
            </div>
            {/* Contagem de materiais pode ser adicionada depois */}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingUnit ? "Editar Unidade" : "Nova Unidade"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUnit(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

