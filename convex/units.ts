import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("units")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    code: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...unitData } = args;
    if (!userId) throw new Error("Não autenticado");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new Error("Acesso negado");
    }

    return await ctx.db.insert("units", {
      ...unitData,
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("units"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, id, ...updates } = args;
    if (!userId) throw new Error("Não autenticado");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new Error("Acesso negado");
    }

    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { 
    id: v.id("units"),
    userId: v.id("users"),
  },
  handler: async (ctx, { id, userId }) => {
    if (!userId) throw new Error("Não autenticado");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new Error("Acesso negado");
    }

    await ctx.db.patch(id, { active: false });
  },
});

export const getMaterialCount = query({
  args: { unitId: v.id("units") },
  handler: async (ctx, { unitId }) => {
    const materials = await ctx.db
      .query("materials")
      .withIndex("by_unidade", (q) => q.eq("unidade", unitId))
      .collect();

    return materials.length;
  },
});

export const initializeDefaults = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    if (!userId) throw new Error("Não autenticado");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new Error("Acesso negado");
    }

    // Verificar se já existe
    const existing = await ctx.db.query("units").first();
    if (existing) {
      throw new Error("Unidades já inicializadas");
    }

    const defaultUnits = [
      { name: "CPI-7", code: "CPI-7" },
      { name: "7ºBPM-I", code: "7ºBPM-I" },
      { name: "12ºBPM-I", code: "12ºBPM-I" },
      { name: "14ºBAEP", code: "14ºBAEP" },
      { name: "22ºBPM-I", code: "22ºBPM-I" },
      { name: "40ºBPM-I", code: "40ºBPM-I" },
      { name: "50ºBPM-I", code: "50ºBPM-I" },
      { name: "53ºBPM-I", code: "53ºBPM-I" },
      { name: "54ºBPM-I", code: "54ºBPM-I" },
      { name: "55ºBPM-I", code: "55ºBPM-I" },
    ];

    const unitIds: string[] = [];
    for (const unit of defaultUnits) {
      const id = await ctx.db.insert("units", {
        ...unit,
        active: true,
        createdAt: Date.now(),
      });
      unitIds.push(id);
    }

    // Criar categorias padrão
    const defaultCategories = [
      { name: "Armamento", description: "Armas e equipamentos de segurança" },
      { name: "Munição", description: "Munições diversas" },
      { name: "Veículos", description: "Viaturas e veículos" },
      { name: "Equipamentos", description: "Equipamentos diversos" },
      { name: "Informática", description: "Computadores e periféricos" },
      { name: "Mobiliário", description: "Móveis e mobiliário" },
      { name: "Alimentos", description: "Alimentos e bebidas" },
    ];

    for (const category of defaultCategories) {
      await ctx.db.insert("categories", {
        ...category,
        active: true,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

