import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex-generated/api.js";
import { Id } from "convex-generated/dataModel.js";
import { toast } from "sonner";
import MaterialForm from "../components/MaterialForm";
import * as XLSX from "xlsx";

export default function MaterialsPage() {
  const userId = localStorage.getItem("userId") as Id<"users"> | null;
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Id<"categories"> | undefined>();
  const [selectedUnit, setSelectedUnit] = useState<Id<"units"> | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<"operando" | "descarga" | "baixado" | undefined>();
  const [selectedMaterials, setSelectedMaterials] = useState<Set<Id<"materials">>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Id<"materials"> | null>(null);

  const materials = useQuery(
    api.materials.list,
    userId ? {
      userId,
      search: search || undefined,
      categoria: selectedCategory,
      unidade: selectedUnit,
      status: selectedStatus,
    } : "skip"
  );

  const categories = useQuery(api.categories.list);
  const units = useQuery(api.units.list);
  const deleteMaterial = useMutation(api.materials.remove);
  const deleteBatch = useMutation(api.materials.removeBatch);
  
  if (!userId) {
    return <div className="p-8">Por favor, faça login novamente.</div>;
  }

  const handleDelete = async (id: Id<"materials">) => {
    if (!confirm("Tem certeza que deseja excluir este material?")) return;
    try {
      await deleteMaterial({ id, userId });
      toast.success("Material excluído com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir material");
    }
  };

  const handleDeleteBatch = async () => {
    if (selectedMaterials.size === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${selectedMaterials.size} material(is) selecionado(s)?`)) return;
    try {
      await deleteBatch({ ids: Array.from(selectedMaterials), userId });
      toast.success("Materiais excluídos com sucesso!");
      setSelectedMaterials(new Set());
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir materiais");
    }
  };

  const toggleSelect = (id: Id<"materials">) => {
    const newSet = new Set(selectedMaterials);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedMaterials(newSet);
  };

  const toggleSelectAll = () => {
    if (!materials) return;
    if (selectedMaterials.size === materials.length) {
      setSelectedMaterials(new Set());
    } else {
      setSelectedMaterials(new Set(materials.map((m) => m._id)));
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      operando: "bg-green-100 text-green-800",
      descarga: "bg-gray-100 text-gray-800",
      baixado: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const handleExportByCategory = () => {
    console.log("handleExportByCategory chamado", { selectedCategory, materials: materials?.length });
    try {
      if (!materials || materials.length === 0) {
        toast.error("Nenhum material para exportar");
        return;
      }

      if (!selectedCategory) {
        toast.error("Selecione uma categoria para exportar");
        return;
      }

      const categoryName = categories?.find((c) => c._id === selectedCategory)?.name || "categoria";
      const filteredMaterials = materials.filter((m) => m.categoria === selectedCategory);

      if (filteredMaterials.length === 0) {
        toast.error("Nenhum material encontrado para esta categoria");
        return;
      }

      const data = filteredMaterials.map((m) => ({
        Patrimônio: m.patrimonio,
        "Número de Série": m.numeroSerie || "",
        Descrição: m.descricao,
        Fornecedor: m.fornecedor || "",
        Local: m.local,
        Usuário: m.usuario,
        "Data de Aquisição": m.dataAquisicao,
        Status: m.status,
        Unidade: units?.find((u) => u._id === m.unidade)?.name || "",
        Categoria: categories?.find((c) => c._id === m.categoria)?.name || "",
        Validade: m.validade || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Materiais");
      XLSX.writeFile(workbook, `materiais_categoria_${categoryName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success(`Materiais da categoria "${categoryName}" exportados!`);
    } catch (error: any) {
      console.error("Erro ao exportar por categoria:", error);
      toast.error(`Erro ao exportar: ${error.message || "Erro desconhecido"}`);
    }
  };

  const handleExportByUnit = () => {
    console.log("handleExportByUnit chamado", { selectedUnit, materials: materials?.length });
    try {
      if (!materials || materials.length === 0) {
        toast.error("Nenhum material para exportar");
        return;
      }

      if (!selectedUnit) {
        toast.error("Selecione uma unidade para exportar");
        return;
      }

      const unitName = units?.find((u) => u._id === selectedUnit)?.name || "unidade";
      const filteredMaterials = materials.filter((m) => m.unidade === selectedUnit);

      if (filteredMaterials.length === 0) {
        toast.error("Nenhum material encontrado para esta unidade");
        return;
      }

      const data = filteredMaterials.map((m) => ({
        Patrimônio: m.patrimonio,
        "Número de Série": m.numeroSerie || "",
        Descrição: m.descricao,
        Fornecedor: m.fornecedor || "",
        Local: m.local,
        Usuário: m.usuario,
        "Data de Aquisição": m.dataAquisicao,
        Status: m.status,
        Unidade: units?.find((u) => u._id === m.unidade)?.name || "",
        Categoria: categories?.find((c) => c._id === m.categoria)?.name || "",
        Validade: m.validade || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Materiais");
      XLSX.writeFile(workbook, `materiais_unidade_${unitName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success(`Materiais da unidade "${unitName}" exportados!`);
    } catch (error: any) {
      console.error("Erro ao exportar por unidade:", error);
      toast.error(`Erro ao exportar: ${error.message || "Erro desconhecido"}`);
    }
  };

  const handleExportByStatus = () => {
    console.log("handleExportByStatus chamado", { selectedStatus, materials: materials?.length });
    try {
      if (!materials || materials.length === 0) {
        toast.error("Nenhum material para exportar");
        return;
      }

      if (!selectedStatus) {
        toast.error("Selecione um status para exportar");
        return;
      }

      const statusLabel = selectedStatus === "operando" ? "Operando" : selectedStatus === "descarga" ? "Descarga" : "Baixado";
      const filteredMaterials = materials.filter((m) => m.status === selectedStatus);

      if (filteredMaterials.length === 0) {
        toast.error("Nenhum material encontrado para este status");
        return;
      }

      const data = filteredMaterials.map((m) => ({
        Patrimônio: m.patrimonio,
        "Número de Série": m.numeroSerie || "",
        Descrição: m.descricao,
        Fornecedor: m.fornecedor || "",
        Local: m.local,
        Usuário: m.usuario,
        "Data de Aquisição": m.dataAquisicao,
        Status: m.status,
        Unidade: units?.find((u) => u._id === m.unidade)?.name || "",
        Categoria: categories?.find((c) => c._id === m.categoria)?.name || "",
        Validade: m.validade || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Materiais");
      XLSX.writeFile(workbook, `materiais_status_${selectedStatus}_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success(`Materiais com status "${statusLabel}" exportados!`);
    } catch (error: any) {
      console.error("Erro ao exportar por status:", error);
      toast.error(`Erro ao exportar: ${error.message || "Erro desconhecido"}`);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Materiais</h1>
          <p className="text-gray-600 mt-2">Gestão de materiais do sistema</p>
        </div>
        <button
          onClick={() => {
            setEditingMaterial(null);
            setShowForm(true);
          }}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Adicionar Material
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Buscar por patrimônio ou série..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value as Id<"categories"> | undefined || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Filtrar por categoria"
          >
            <option value="">Todas as Categorias</option>
            {categories?.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={selectedUnit || ""}
            onChange={(e) => setSelectedUnit(e.target.value as Id<"units"> | undefined || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Filtrar por unidade"
          >
            <option value="">Todas as Unidades</option>
            {units?.map((unit) => (
              <option key={unit._id} value={unit._id}>
                {unit.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus || ""}
            onChange={(e) => setSelectedStatus(e.target.value as "operando" | "descarga" | "baixado" | undefined || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Filtrar por status"
          >
            <option value="">Todos os Status</option>
            <option value="operando">Operando</option>
            <option value="descarga">Descarga</option>
            <option value="baixado">Baixado</option>
          </select>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Botão Movimentações clicado");
              window.history.pushState({}, "", "/movimentacoes");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
            className="px-4 py-2 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors"
          >
            Movimentações
          </button>
          <button
            type="button"
            onClick={handleExportByCategory}
            className="px-4 py-2 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors"
          >
            Exportar Categoria
          </button>
          <button
            type="button"
            onClick={handleExportByUnit}
            className="px-4 py-2 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors"
          >
            Exportar Unidade
          </button>
          <button
            type="button"
            onClick={handleExportByStatus}
            className="px-4 py-2 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors"
          >
            Exportar Status
          </button>
          {selectedMaterials.size > 0 && (
            <button
              onClick={handleDeleteBatch}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Deletar Selecionados ({selectedMaterials.size})
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Materiais */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <label className="sr-only">Selecionar todos</label>
                  <input
                    type="checkbox"
                    checked={materials ? selectedMaterials.size === materials.length : false}
                    onChange={toggleSelectAll}
                    className="rounded"
                    aria-label="Selecionar todos os materiais"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patrimônio</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nº Série</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Descrição</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Local</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Unidade</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {materials?.map((material) => (
                <tr key={material._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedMaterials.has(material._id)}
                      onChange={() => toggleSelect(material._id)}
                      className="rounded"
                      aria-label={`Selecionar material ${material.patrimonio}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{material.patrimonio}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{material.numeroSerie || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{material.descricao}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{material.local}</td>
                  <td className="px-4 py-3">{getStatusBadge(material.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {units?.find((u) => u._id === material.unidade)?.name || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingMaterial(material._id);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(material._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {materials?.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Nenhum material encontrado
          </div>
        )}
      </div>

      {showForm && (
        <MaterialForm
          materialId={editingMaterial}
          categories={categories || []}
          units={units || []}
          onClose={() => {
            setShowForm(false);
            setEditingMaterial(null);
          }}
        />
      )}
    </div>
  );
}

