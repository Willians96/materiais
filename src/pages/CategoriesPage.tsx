import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex-generated/api.js";
import { Id } from "convex-generated/dataModel.js";
import { toast } from "sonner";

export default function CategoriesPage() {
  const userId = localStorage.getItem("userId") as Id<"users"> | null;
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Id<"categories"> | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const categories = useQuery(api.categories.list);
  const create = useMutation(api.categories.create);
  const update = useMutation(api.categories.update);
  const remove = useMutation(api.categories.remove);

  if (!userId) {
    return <div className="p-8">Por favor, faça login novamente.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await update({ id: editingCategory, userId, ...formData });
        toast.success("Categoria atualizada!");
      } else {
        await create({ userId, ...formData });
        toast.success("Categoria criada!");
      }
      setShowForm(false);
      setFormData({ name: "", description: "" });
      setEditingCategory(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar categoria");
    }
  };

  const handleDelete = async (id: Id<"categories">) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
      await remove({ id, userId });
      toast.success("Categoria excluída!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir categoria");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600 mt-2">Gerencie as categorias de materiais</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: "", description: "" });
            setShowForm(true);
          }}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 font-medium"
        >
          + Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((category) => (
          <div key={category._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingCategory(category._id);
                    setFormData({ name: category.name, description: category.description || "" });
                    setShowForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Excluir
                </button>
              </div>
            </div>
            {category.description && (
              <p className="text-sm text-gray-600">{category.description}</p>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
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
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
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

