import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { saveAuditLog } from "./audit";

export const list = query({
  args: {
    userId: v.optional(v.id("users")),
    search: v.optional(v.string()),
    categoria: v.optional(v.id("categories")),
    unidade: v.optional(v.id("units")),
    status: v.optional(v.union(v.literal("operando"), v.literal("descarga"), v.literal("baixado"))),
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("Não autenticado");

    const user = await ctx.db.get(args.userId);
    if (!user || !user.approved || !user.active) {
      throw new Error("Acesso negado");
    }

    let materials = await ctx.db.query("materials").collect();

    // RLS: Usuários regulares só veem materiais de sua unidade
    if (user.role === "user" && user.unit) {
      materials = materials.filter((m) => m.unidade === user.unit);
    }

    // Aplicar filtros
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      materials = materials.filter(
        (m) =>
          m.patrimonio.toLowerCase().includes(searchLower) ||
          m.numeroSerie?.toLowerCase().includes(searchLower) ||
          m.descricao.toLowerCase().includes(searchLower)
      );
    }

    if (args.categoria) {
      materials = materials.filter((m) => m.categoria === args.categoria);
    }

    if (args.unidade) {
      materials = materials.filter((m) => m.unidade === args.unidade);
    }

    if (args.status) {
      materials = materials.filter((m) => m.status === args.status);
    }

    return materials;
  },
});

export const get = query({
  args: { 
    id: v.id("materials"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { id, userId }) => {
    if (!userId) throw new Error("Não autenticado");

    const material = await ctx.db.get(id);
    if (!material) return null;

    const user = await ctx.db.get(userId);
    if (!user || !user.approved || !user.active) {
      throw new Error("Acesso negado");
    }

    // RLS: Usuários regulares só veem materiais de sua unidade
    if (user.role === "user" && user.unit && material.unidade !== user.unit) {
      throw new Error("Acesso negado");
    }

    return material;
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    patrimonio: v.string(),
    numeroSerie: v.optional(v.string()),
    descricao: v.string(),
    fornecedor: v.optional(v.string()),
    local: v.string(),
    usuario: v.string(),
    dataAquisicao: v.string(),
    status: v.union(v.literal("operando"), v.literal("descarga"), v.literal("baixado")),
    unidade: v.id("units"),
    categoria: v.id("categories"),
    validade: v.optional(v.string()),
    observacoes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, observacoes, ...materialData } = args;
    if (!userId) throw new Error("Não autenticado");

    const user = await ctx.db.get(userId);
    if (!user || !user.approved || !user.active) {
      throw new Error("Acesso negado");
    }

    // Verificar se patrimônio já existe
    const existing = await ctx.db
      .query("materials")
      .withIndex("by_patrimonio", (q) => q.eq("patrimonio", args.patrimonio))
      .first();

    if (existing) {
      throw new Error("Patrimônio já cadastrado");
    }

    const now = Date.now();
    const materialId = await ctx.db.insert("materials", {
      ...materialData,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      observacoes: observacoes ?? null,
    });

    await saveAuditLog(ctx, {
      acao: "create",
      tabela: "materials",
      registroId: materialId,
      dadosAnteriores: undefined,
      dadosNovos: { ...materialData, createdBy: userId, createdAt: now, updatedAt: now },
      usuarioId: userId,
    });

    return materialId;
  },
});

export const update = mutation({
  args: {
    id: v.id("materials"),
    userId: v.id("users"),
    patrimonio: v.optional(v.string()),
    numeroSerie: v.optional(v.string()),
    descricao: v.optional(v.string()),
    fornecedor: v.optional(v.string()),
    local: v.optional(v.string()),
    usuario: v.optional(v.string()),
    dataAquisicao: v.optional(v.string()),
    status: v.optional(v.union(v.literal("operando"), v.literal("descarga"), v.literal("baixado"))),
    unidade: v.optional(v.id("units")),
    categoria: v.optional(v.id("categories")),
    validade: v.optional(v.string()),
    observacoes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, id, ...updates } = args;
    if (!userId) throw new Error("Não autenticado");

    const material = await ctx.db.get(id);
    if (!material) throw new Error("Material não encontrado");

    const user = await ctx.db.get(userId);
    if (!user || !user.approved || !user.active) {
      throw new Error("Acesso negado");
    }

    // RLS: Usuários regulares só podem editar seus próprios materiais
    if (user.role === "user" && material.createdBy !== userId) {
      throw new Error("Você só pode editar seus próprios materiais");
    }

    // Verificar patrimônio duplicado se estiver sendo alterado
    if (args.patrimonio && args.patrimonio !== material.patrimonio) {
      const patrimonio = args.patrimonio; // Garantir que não é undefined
      const existing = await ctx.db
        .query("materials")
        .withIndex("by_patrimonio", (q) => q.eq("patrimonio", patrimonio))
        .first();

      if (existing) {
        throw new Error("Patrimônio já cadastrado");
      }
    }

    const dadosAnteriores = { ...material };
    const now = Date.now();

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
      updatedBy: userId,
    });

    await saveAuditLog(ctx, {
      acao: "update",
      tabela: "materials",
      registroId: id,
      dadosAnteriores,
      dadosNovos: { ...material, ...updates, updatedAt: now, updatedBy: userId },
      usuarioId: userId,
    });
  },
});

export const remove = mutation({
  args: { 
    id: v.id("materials"),
    userId: v.id("users"),
  },
  handler: async (ctx, { id, userId }) => {
    if (!userId) throw new Error("Não autenticado");

    const material = await ctx.db.get(id);
    if (!material) throw new Error("Material não encontrado");

    const user = await ctx.db.get(userId);
    if (!user || !user.approved || !user.active) {
      throw new Error("Acesso negado");
    }

    // RLS: Usuários regulares só podem deletar seus próprios materiais
    if (user.role === "user" && material.createdBy !== userId) {
      throw new Error("Você só pode deletar seus próprios materiais");
    }

    const dadosAnteriores = { ...material };
    await ctx.db.delete(id);

    await saveAuditLog(ctx, {
      acao: "delete",
      tabela: "materials",
      registroId: id,
      dadosAnteriores,
      dadosNovos: undefined,
      usuarioId: userId,
    });
  },
});

export const removeBatch = mutation({
  args: { 
    ids: v.array(v.id("materials")),
    userId: v.id("users"),
  },
  handler: async (ctx, { ids, userId }) => {
    if (!userId) throw new Error("Não autenticado");

    const user = await ctx.db.get(userId);
    if (!user || !user.approved || !user.active) {
      throw new Error("Acesso negado");
    }

    for (const id of ids) {
      const material = await ctx.db.get(id);
      if (!material) continue;

      // RLS: Usuários regulares só podem deletar seus próprios materiais
      if (user.role === "user" && material.createdBy !== userId) {
        continue;
      }

      const dadosAnteriores = { ...material };
      await ctx.db.delete(id);

      await saveAuditLog(ctx, {
        acao: "delete",
        tabela: "materials",
        registroId: id,
        dadosAnteriores,
        dadosNovos: undefined,
        usuarioId: userId,
      });
    }
  },
});

export const getStats = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { userId }) => {
    if (!userId) throw new Error("Não autenticado");

    const user = await ctx.db.get(userId);
    if (!user || !user.approved || !user.active) {
      throw new Error("Acesso negado");
    }

    let materials = await ctx.db.query("materials").collect();

    // RLS: Usuários regulares só veem materiais de sua unidade
    if (user.role === "user" && user.unit) {
      materials = materials.filter((m) => m.unidade === user.unit);
    }

    const total = materials.length;
    const operando = materials.filter((m) => m.status === "operando").length;
    const descarga = materials.filter((m) => m.status === "descarga").length;
    const baixado = materials.filter((m) => m.status === "baixado").length;

    // Distribuição por unidade
    const unidadesMap = new Map<string, number>();
    for (const material of materials) {
      const unit = await ctx.db.get(material.unidade);
      if (unit) {
        unidadesMap.set(unit.name, (unidadesMap.get(unit.name) || 0) + 1);
      }
    }

    const unidades = Array.from(unidadesMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    return {
      total,
      operando,
      descarga,
      baixado,
      unidades,
    };
  },
});

