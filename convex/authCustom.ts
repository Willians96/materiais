import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Autenticação simples por email e senha (como no sistema original)
// Senhas armazenadas em texto plano para simplicidade - em produção usar bcrypt

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    // Buscar usuário por email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      throw new Error("Email ou senha inválidos");
    }

    if (!user.approved) {
      throw new Error("Sua solicitação de acesso ainda não foi aprovada. Aguarde o administrador.");
    }

    if (!user.active) {
      throw new Error("Usuário inativo. Contate o administrador.");
    }

    // Verificar senha (em produção, usar hash bcrypt)
    if (user.password !== password) {
      throw new Error("Email ou senha inválidos");
    }

    // Atualizar lastLogin e loginCount
    await ctx.db.patch(user._id, {
      lastLogin: Date.now(),
      loginCount: (user.loginCount || 0) + 1,
    });

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },
});

export const getCurrentSession = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { userId }) => {
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    if (!user.active || !user.approved) return null;

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      unit: user.unit,
    };
  },
});

// Manter syncClerkUser para compatibilidade, mas não criar usuário automaticamente
export const syncClerkUser = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (user) {
      return {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        approved: user.approved,
        active: user.active,
      };
    }

    return null;
  },
});
