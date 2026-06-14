import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex-generated/api.js";
import { Id } from "convex-generated/dataModel.js";
import { toast } from "sonner";

interface MaterialFormProps {
  materialId: Id<"materials"> | null;
  categories: Array<{ _id: Id<"categories">; name: string }>;
  units: Array<{ _id: Id<"units">; name: string }>;
  onClose: () => void;
}

export default function MaterialForm({ materialId, categories, units, onClose }: MaterialFormProps) {
  const userId = localStorage.getItem("userId") as Id<"users"> | null;
  const material = useQuery(
    api.materials.get,
    materialId && userId ? { id: materialId, userId } : "skip"
  );
  const create = useMutation(api.materials.create);
  const update = useMutation(api.materials.update);
  
  if (!userId) {
    return <div>Erro: usuário não autenticado</div>;
  }

  const [formData, setFormData] = useState({
    patrimonio: "",
    numeroSerie: "",
    descricao: "",
    fornecedor: "",
    local: "",
    usuario: "",
    dataAquisicao: "",
    status: "operando" as "operando" | "descarga" | "baixado",
    unidade: "" as Id<"units"> | "",
    categoria: "" as Id<"categories"> | "",
    validade: "",
  });

  useEffect(() => {
    if (material) {
      setFormData({
        patrimonio: material.patrimonio,
        numeroSerie: material.numeroSerie || "",
        descricao: material.descricao,
        fornecedor: material.fornecedor || "",
        local: material.local,
        usuario: material.usuario,
        dataAquisicao: material.dataAquisicao,
        status: material.status,
        unidade: material.unidade,
        categoria: material.categoria,
        validade: material.validade || "",
      });
    }
  }, [material]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    try {
      if (materialId) {
        await update({
          id: materialId,
          userId,
          ...formData,
          unidade: formData.unidade || undefined,
          categoria: formData.categoria || undefined,
        });
        toast.success("Material atualizado com sucesso!");
      } else {
        if (!formData.unidade || !formData.categoria) {
          toast.error("Unidade e Categoria são obrigatórios");
          return;
        }
        await create({
          userId,
          ...formData,
          unidade: formData.unidade as Id<"units">,
          categoria: formData.categoria as Id<"categories">,
          numeroSerie: formData.numeroSerie || undefined,
          fornecedor: formData.fornecedor || undefined,
          validade: formData.validade || undefined,
        });
        toast.success("Material criado com sucesso!");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar material");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {materialId ? "Editar Material" : "Novo Material"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patrimônio *
              </label>
              <input
                type="text"
                value={formData.patrimonio}
                onChange={(e) => setFormData({ ...formData, patrimonio: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Série
              </label>
              <input
                type="text"
                value={formData.numeroSerie}
                onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <input
              type="text"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornecedor
              </label>
              <input
                type="text"
                value={formData.fornecedor}
                onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Local *
              </label>
              <input
                type="text"
                value={formData.local}
                onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuário *
              </label>
              <input
                type="text"
                value={formData.usuario}
                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Aquisição *
              </label>
              <input
                type="date"
                value={formData.dataAquisicao}
                onChange={(e) => setFormData({ ...formData, dataAquisicao: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="operando">Operando</option>
                <option value="descarga">Descarga</option>
                <option value="baixado">Baixado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidade *
              </label>
              <select
                value={formData.unidade}
                onChange={(e) => setFormData({ ...formData, unidade: e.target.value as Id<"units"> })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione...</option>
                {units.map((unit) => (
                  <option key={unit._id} value={unit._id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value as Id<"categories"> })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Validade (para alimentos)
            </label>
            <input
              type="date"
              value={formData.validade}
              onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          </div>

          <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium shadow-md"
            >
              {materialId ? "Atualizar" : "Criar Material"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

