import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...categoryData } = args;
    if (!userId) throw new Error("Não autenticado");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new Error("Acesso negado");
    }

    return await ctx.db.insert("categories", {
      ...categoryData,
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
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
    id: v.id("categories"),
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

