import { useQuery } from "convex/react";
import { api } from "convex-generated/api.js";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportPage() {
  const userId = localStorage.getItem("userId") as string | null;
  const materials = useQuery(
    api.materials.list,
    userId ? { userId: userId as any } : "skip"
  );
  const categories = useQuery(api.categories.list);
  const units = useQuery(api.units.list);
  const stats = useQuery(
    api.materials.getStats,
    userId ? { userId: userId as any } : "skip"
  );

  const exportCSV = () => {
    if (!materials || materials.length === 0) {
      toast.error("Nenhum material para exportar");
      return;
    }

    const headers = [
      "Patrimônio",
      "Número de Série",
      "Descrição",
      "Fornecedor",
      "Local",
      "Usuário",
      "Data de Aquisição",
      "Status",
      "Unidade",
      "Categoria",
      "Validade",
    ];

    const rows = materials.map((m) => [
      m.patrimonio,
      m.numeroSerie || "",
      m.descricao,
      m.fornecedor || "",
      m.local,
      m.usuario,
      m.dataAquisicao,
      m.status,
      units?.find((u) => u._id === m.unidade)?.name || "",
      categories?.find((c) => c._id === m.categoria)?.name || "",
      m.validade || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `materiais_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Arquivo CSV exportado!");
  };

  const exportXLSX = () => {
    if (!materials || materials.length === 0) {
      toast.error("Nenhum material para exportar");
      return;
    }

    const data = materials.map((m) => ({
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
    XLSX.writeFile(workbook, `materiais_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Arquivo XLSX exportado!");
  };

  const exportPDF = (includeCharts: boolean = false) => {
    if (!materials || materials.length === 0) {
      toast.error("Nenhum material para exportar");
      return;
    }

    const doc = new jsPDF();

    // Cabeçalho institucional
    doc.setFontSize(16);
    doc.text("Polícia Militar do Estado de São Paulo", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text("Controle de Materiais - CPI-7", 105, 30, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Relatório gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 105, 40, {
      align: "center",
    });

    // Dados da tabela
    const tableData = materials.map((m) => [
      m.patrimonio,
      m.descricao,
      m.status,
      units?.find((u) => u._id === m.unidade)?.name || "",
      categories?.find((c) => c._id === m.categoria)?.name || "",
    ]);

    autoTable(doc, {
      head: [["Patrimônio", "Descrição", "Status", "Unidade", "Categoria"]],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
    });

    // Adicionar gráficos se solicitado
    if (includeCharts && stats) {
      // Adicionar estatísticas
      doc.setFontSize(12);
      doc.text("Estatísticas", 14, (doc as any).lastAutoTable.finalY + 20);
      doc.setFontSize(10);
      doc.text(`Total: ${stats.total}`, 14, (doc as any).lastAutoTable.finalY + 30);
      doc.text(`Operando: ${stats.operando}`, 14, (doc as any).lastAutoTable.finalY + 40);
      doc.text(`Descarga: ${stats.descarga}`, 14, (doc as any).lastAutoTable.finalY + 50);
      doc.text(`Baixado: ${stats.baixado}`, 14, (doc as any).lastAutoTable.finalY + 60);
    }

    doc.save(`materiais_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("Arquivo PDF exportado!");
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Exportar Materiais</h1>
        <p className="text-gray-600 mt-2">Exporte os materiais em diferentes formatos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportar CSV</h3>
          <p className="text-sm text-gray-600 mb-4">
            Exporte os materiais em formato CSV compatível com Excel
          </p>
          <button
            onClick={exportCSV}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            Exportar CSV
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportar XLSX</h3>
          <p className="text-sm text-gray-600 mb-4">
            Exporte os materiais em formato Excel (XLSX)
          </p>
          <button
            onClick={exportXLSX}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Exportar XLSX
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportar PDF</h3>
          <p className="text-sm text-gray-600 mb-4">
            Exporte os materiais em formato PDF com cabeçalho institucional
          </p>
          <div className="space-y-2">
            <button
              onClick={() => exportPDF(false)}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
            >
              Exportar PDF
            </button>
            <button
              onClick={() => exportPDF(true)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
            >
              PDF com Gráficos
            </button>
          </div>
        </div>
      </div>

      {materials && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total de Materiais</p>
              <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
            </div>
            {stats && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Operando</p>
                  <p className="text-2xl font-bold text-green-600">{stats.operando}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Descarga</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.descarga}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Baixado</p>
                  <p className="text-2xl font-bold text-red-600">{stats.baixado}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

