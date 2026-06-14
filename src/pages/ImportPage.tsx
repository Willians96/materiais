import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex-generated/api.js";
import { Id } from "convex-generated/dataModel.js";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export default function ImportPage() {
  const userId = localStorage.getItem("userId") as Id<"users"> | null;
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);
  const createMaterial = useMutation(api.materials.create);
  const categories = useQuery(api.categories.list);
  const units = useQuery(api.units.list);
  
  if (!userId) {
    return <div className="p-8">Por favor, faça login novamente.</div>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportErrors([]);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Selecione um arquivo");
      return;
    }

    setLoading(true);
    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      let data: any[] = [];

      if (fileExtension === "csv") {
        const text = await file.text();
        const parsed = Papa.parse(text, { 
          header: true,
          skipEmptyLines: true,
          trimHeaders: true
        });
        data = parsed.data as any[];
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { 
            type: "array",
            cellDates: false,
            cellNF: false,
            cellText: false,
            sheetStubs: false
          });
          
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            toast.error("Arquivo Excel não contém planilhas");
            setLoading(false);
            return;
          }

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          if (!worksheet) {
            toast.error("Não foi possível ler a planilha");
            setLoading(false);
            return;
          }

          // Converter diretamente para JSON usando os cabeçalhos da primeira linha
          data = XLSX.utils.sheet_to_json(worksheet, { 
            defval: "",
            raw: false,
            blankrows: false,
            header: 1 // Ler como array primeiro
          }) as any[];

          // Se não tem dados, erro
          if (data.length === 0) {
            toast.error("Arquivo Excel está vazio");
            setLoading(false);
            return;
          }

          // Pegar cabeçalhos da primeira linha e normalizar
          const headers = (data[0] as any[]).map((h: any) => {
            if (!h) return "";
            const headerStr = String(h).trim();
            // Normalizar removendo espaços e acentos para comparação
            const normalized = headerStr.toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") // Remove acentos
              .replace(/\s+/g, ""); // Remove espaços
            
            // Mapear para chaves esperadas (comparar versão normalizada)
            if (normalized.includes("patrimonio")) return "patrimonio";
            if (normalized.includes("descricao")) return "descricao";
            if (normalized.includes("local")) return "local";
            if (normalized.includes("usuario")) return "usuario";
            if (normalized.includes("data") && normalized.includes("aquisicao")) return "dataAquisicao";
            if (normalized.includes("status")) return "status";
            if (normalized.includes("categoria")) return "categoria";
            if (normalized.includes("unidade")) return "unidade";
            if (normalized.includes("numero") && normalized.includes("serie")) return "numeroSerie";
            if (normalized.includes("fornecedor")) return "fornecedor";
            if (normalized.includes("validade")) return "validade";
            
            // Se não mapear, usar o nome original normalizado (sem espaços)
            return normalized;
          });

          // Converter linhas de dados para objetos
          const dataWithHeaders: any[] = [];
          for (let i = 1; i < data.length; i++) {
            const row = data[i] as any[];
            if (!row || row.length === 0) continue;
            
            const rowObj: any = {};
            headers.forEach((header, index) => {
              if (header) {
                const value = row[index];
                rowObj[header] = value !== undefined && value !== null ? String(value).trim() : "";
              }
            });
            
            // Só adicionar se tiver pelo menos um campo
            if (Object.keys(rowObj).length > 0) {
              dataWithHeaders.push(rowObj);
            }
          }

          data = dataWithHeaders;
          
          // Log para debug
          if (data.length > 0) {
            console.log("Dados processados do Excel:", data.slice(0, 2)); // Mostrar primeiras 2 linhas
            console.log("Total de linhas:", data.length);
            console.log("Cabeçalhos mapeados:", headers.filter(h => h));
          }
        } catch (error: any) {
          console.error("Erro ao processar arquivo Excel:", error);
          toast.error(`Erro ao ler arquivo Excel: ${error.message || "Erro desconhecido"}`);
          setLoading(false);
          return;
        }
      } else {
        toast.error("Formato de arquivo não suportado. Use CSV ou XLSX");
        setLoading(false);
        return;
      }

      // Filtrar linhas vazias
      data = data.filter(row => {
        // Verificar se pelo menos um campo obrigatório tem valor
        const patrimonio = row.patrimonio || row.Patrimônio || row.PATRIMONIO;
        const descricao = row.descricao || row.Descrição || row.DESCRIÇÃO;
        return patrimonio || descricao;
      });

      if (data.length === 0) {
        toast.error("Nenhum dado válido encontrado no arquivo");
        setLoading(false);
        return;
      }

      // Mapear colunas e criar materiais
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 2; // +2 porque linha 1 é cabeçalho e arrays começam em 0
        try {
          // Mapear colunas (ajustar conforme necessário)
          // Tentar diferentes variações de nomes de colunas
          const patrimonio = String(
            row.patrimonio || 
            row.Patrimônio || 
            row.PATRIMONIO ||
            row["patrimonio"] ||
            row["Patrimônio"] ||
            ""
          ).trim();
          
          const descricao = String(
            row.descricao || 
            row.Descrição || 
            row.DESCRIÇÃO ||
            row["descricao"] ||
            row["Descrição"] ||
            ""
          ).trim();
          
          const local = String(
            row.local || 
            row.Local || 
            row.LOCAL ||
            row["local"] ||
            ""
          ).trim();
          
          const usuario = String(
            row.usuario || 
            row.Usuário || 
            row.USUÁRIO ||
            row["usuario"] ||
            row["Usuário"] ||
            ""
          ).trim();
          
          const dataAquisicao = String(
            row.dataAquisicao || 
            row["Data de Aquisição"] || 
            row.DATA_AQUISICAO ||
            row["dataAquisicao"] ||
            row["data_aquisicao"] ||
            row["datadeaquisição"] ||
            row["datadeaquisicao"] ||
            ""
          ).trim();
          
          const statusRaw = String(
            row.status || 
            row.Status || 
            row.STATUS ||
            row["status"] ||
            "operando"
          ).trim();
          
          const categoria = String(
            row.categoria || 
            row.Categoria || 
            row.CATEGORIA ||
            row["categoria"] ||
            ""
          ).trim();
          
          const unidade = String(
            row.unidade || 
            row.Unidade || 
            row.UNIDADE ||
            row["unidade"] ||
            ""
          ).trim();

          // Validar campos obrigatórios
          if (!patrimonio) {
            errors.push(`Linha ${rowNumber}: Patrimônio é obrigatório`);
            errorCount++;
            continue;
          }
          if (!descricao) {
            errors.push(`Linha ${rowNumber}: Descrição é obrigatória`);
            errorCount++;
            continue;
          }
          if (!local) {
            errors.push(`Linha ${rowNumber}: Local é obrigatório`);
            errorCount++;
            continue;
          }
          if (!usuario) {
            errors.push(`Linha ${rowNumber}: Usuário é obrigatório`);
            errorCount++;
            continue;
          }
          if (!dataAquisicao) {
            errors.push(`Linha ${rowNumber}: Data de Aquisição é obrigatória`);
            errorCount++;
            continue;
          }

          // Função auxiliar para normalizar strings (remover acentos, espaços extras, etc)
          const normalizeString = (str: string) => {
            return str
              .toLowerCase()
              .trim()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") // Remove acentos
              .replace(/\s+/g, " "); // Remove espaços múltiplos
          };

          // Encontrar IDs de categoria e unidade (busca flexível)
          const categoryId = categories?.find((c) => {
            const catName = normalizeString(c.name);
            const searchName = normalizeString(categoria);
            return catName === searchName || catName.includes(searchName) || searchName.includes(catName);
          })?._id;

          const unitId = units?.find((u) => {
            const unitName = normalizeString(u.name);
            const searchName = normalizeString(unidade);
            return unitName === searchName || unitName.includes(searchName) || searchName.includes(unitName);
          })?._id;

          if (!categoryId) {
            const availableCategories = categories?.map(c => c.name).join(", ") || "nenhuma";
            errors.push(`Linha ${rowNumber}: Categoria "${categoria}" não encontrada. Disponíveis: ${availableCategories}`);
            errorCount++;
            continue;
          }
          if (!unitId) {
            const availableUnits = units?.map(u => u.name).join(", ") || "nenhuma";
            errors.push(`Linha ${rowNumber}: Unidade "${unidade}" não encontrada. Disponíveis: ${availableUnits}`);
            errorCount++;
            continue;
          }

          // Converter status para o formato correto
          let status: "operando" | "descarga" | "baixado" = "operando";
          const statusLower = statusRaw.toLowerCase().trim();
          if (statusLower === "descarga" || statusLower === "em descarga") {
            status = "descarga";
          } else if (statusLower === "baixado" || statusLower === "baixa" || statusLower === "baixado") {
            status = "baixado";
          } else {
            status = "operando";
          }

          // Processar campos opcionais
          const numeroSerie = String(
            row.numeroSerie || 
            row["Número de Série"] || 
            row["numeroSerie"] ||
            row["numero_serie"] ||
            row["Número de Série"] ||
            row["númerodesérie"] ||
            row["numerodeserie"] ||
            ""
          ).trim() || undefined;
          
          const fornecedor = String(
            row.fornecedor || 
            row.Fornecedor || 
            row["fornecedor"] ||
            row["Fornecedor"] ||
            ""
          ).trim() || undefined;
          
          const validade = String(
            row.validade || 
            row.Validade || 
            row["validade"] ||
            row["Validade"] ||
            ""
          ).trim() || undefined;

          await createMaterial({
            userId,
            patrimonio: patrimonio,
            numeroSerie: numeroSerie,
            descricao: descricao,
            fornecedor: fornecedor,
            local: local,
            usuario: usuario,
            dataAquisicao: dataAquisicao,
            status: status,
            unidade: unitId,
            categoria: categoryId,
            validade: validade,
          });

          successCount++;
        } catch (error: any) {
          const errorMsg = error.message || "Erro desconhecido";
          errors.push(`Linha ${rowNumber}: ${errorMsg}`);
          console.error(`Erro ao importar material linha ${rowNumber}:`, error);
          errorCount++;
        }
      }

      // Armazenar resultados
      setImportResult({ success: successCount, errors: errorCount });
      setImportErrors(errors);

      // Mostrar resultado
      if (errorCount === 0) {
        toast.success(`Importação concluída com sucesso! ${successCount} material(is) importado(s)`);
      } else if (successCount === 0) {
        toast.error(`Importação falhou! ${errorCount} erro(s). Verifique os dados do arquivo.`);
      } else {
        toast.warning(`Importação parcial: ${successCount} sucesso, ${errorCount} erro(s)`);
      }
      
      // Limpar arquivo apenas se tudo foi importado com sucesso
      if (errorCount === 0) {
        setFile(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao importar arquivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Importar Materiais</h1>
        <p className="text-gray-600 mt-2">Importe materiais de arquivos CSV ou XLSX</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="mb-6">
          <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
            Selecione o arquivo (CSV ou XLSX)
          </label>
          <input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {file && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Arquivo selecionado: <strong>{file.name}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Tamanho: {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Formato esperado das colunas:
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono">
            <p>patrimonio, descricao, local, usuario, dataAquisicao, status, categoria, unidade</p>
            <p className="mt-2 text-gray-600">
              Colunas opcionais: numeroSerie, fornecedor, validade
            </p>
          </div>
        </div>

        <button
          onClick={handleImport}
          disabled={!file || loading}
          className="w-full bg-blue-900 text-white py-2 px-4 rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {loading ? "Importando..." : "Importar"}
        </button>

        {/* Mostrar resultado da importação */}
        {importResult && (
          <div className={`mt-6 p-4 rounded-lg ${
            importResult.errors === 0 
              ? "bg-green-50 border border-green-200" 
              : importResult.success === 0
              ? "bg-red-50 border border-red-200"
              : "bg-yellow-50 border border-yellow-200"
          }`}>
            <h4 className="font-semibold mb-2">
              {importResult.errors === 0 
                ? "✅ Importação concluída com sucesso!" 
                : importResult.success === 0
                ? "❌ Importação falhou"
                : "⚠️ Importação parcial"}
            </h4>
            <p className="text-sm mb-2">
              {importResult.success} sucesso, {importResult.errors} erro(s)
            </p>
            {importErrors.length > 0 && (
              <div className="mt-3 max-h-60 overflow-y-auto">
                <p className="text-sm font-medium mb-2">Detalhes dos erros:</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  {importErrors.slice(0, 20).map((error, idx) => (
                    <li key={idx} className="text-gray-700">{error}</li>
                  ))}
                  {importErrors.length > 20 && (
                    <li className="text-gray-500 italic">
                      ... e mais {importErrors.length - 20} erro(s) (verifique o console)
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

