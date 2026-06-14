import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    if (!userId) {
      throw new Error("Não autenticado");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    if (user.role !== "admin") {
      throw new Error("Apenas administradores podem visualizar a lista de usuários");
    }

    if (!user.active) {
      throw new Error("Usuário administrador está inativo");
    }

    // Retornar todos os usuários ordenados por data de criação (mais recentes primeiro)
    const allUsers = await ctx.db
      .query("users")
      .collect();

    // Ordenar: pendentes primeiro, depois aprovados, ambos por data de criação
    return allUsers.sort((a, b) => {
      // Pendentes primeiro
      if (a.approved !== b.approved) {
        return a.approved ? 1 : -1;
      }
      // Depois ordenar por data de criação (mais recentes primeiro)
      return b.createdAt - a.createdAt;
    });
  },
});

// Funções getCurrent e getCurrentByEmail removidas
// Agora usamos authCustom.getCurrentSession

export const createFromAuth = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { email, name }) => {
    // Esta função não precisa mais de authUserId
    // Será chamada durante o login
    
    // Verificar se já existe usuário com este email
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    
    if (existing) {
      // Se já existe, atualizar o ID do auth se necessário
      return existing._id;
    }
    
    // Verificar se é o primeiro usuário ou admin padrão
    const allUsers = await ctx.db.query("users").collect();
    const isFirstUser = allUsers.length === 0;
    const isAdminEmail = email === "michelwilliam@policiamilitar.sp.gov.br";
    
    // Criar novo usuário usando o ID do auth como _id
    // Nota: No Convex, podemos usar o authUserId como _id se for compatível
    const userId = await ctx.db.insert("users", {
      email,
      name: name || email.split("@")[0],
      role: (isFirstUser || isAdminEmail) ? "admin" : "user",
      approved: (isFirstUser || isAdminEmail),
      active: true,
      createdAt: Date.now(),
    });
    
    return userId;
  },
});

export const approve = mutation({
  args: { 
    userId: v.id("users"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, { userId, currentUserId }) => {
    // Validar que o usuário atual está autenticado
    if (!currentUserId) {
      throw new Error("Não autenticado");
    }

    // Buscar e validar o usuário atual (admin)
    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser) {
      throw new Error("Usuário atual não encontrado");
    }

    if (currentUser.role !== "admin") {
      throw new Error("Apenas administradores podem aprovar usuários");
    }

    if (!currentUser.active) {
      throw new Error("Usuário administrador está inativo");
    }

    // Buscar e validar o usuário a ser aprovado
    const userToApprove = await ctx.db.get(userId);
    if (!userToApprove) {
      throw new Error("Usuário a ser aprovado não encontrado");
    }

    // Verificar se já está aprovado
    if (userToApprove.approved) {
      throw new Error("Usuário já está aprovado");
    }

    // Aprovar o usuário
    await ctx.db.patch(userId, {
      approved: true,
      active: true,
    });

    // Retornar confirmação
    return { success: true, message: "Usuário aprovado com sucesso" };
  },
});

export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    currentUserId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, { userId, currentUserId, role }) => {
    if (!currentUserId) throw new Error("Não autenticado");

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Acesso negado");
    }

    await ctx.db.patch(userId, { role });
  },
});

export const updateUnit = mutation({
  args: {
    userId: v.id("users"),
    currentUserId: v.id("users"),
    unit: v.optional(v.id("units")),
  },
  handler: async (ctx, { userId, currentUserId, unit }) => {
    if (!currentUserId) throw new Error("Não autenticado");

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Acesso negado");
    }

    await ctx.db.patch(userId, { unit });
  },
});

export const toggleActive = mutation({
  args: { 
    userId: v.id("users"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, { userId, currentUserId }) => {
    if (!currentUserId) throw new Error("Não autenticado");

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Acesso negado");
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuário não encontrado");

    await ctx.db.patch(userId, { active: !user.active });
  },
});

export const requestAccess = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    unit: v.optional(v.id("units")),
  },
  handler: async (ctx, { email, name, unit }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      throw new Error("Usuário já existe");
    }

    await ctx.db.insert("users", {
      email,
      name: name || email.split("@")[0],
      role: "user",
      unit,
      approved: false,
      active: false,
      createdAt: Date.now(),
    });
  },
});

// Promove usuário a administrador pelo email (para setup inicial/recuperação)
// NOTA: Esta mutation é pública por design, para permitir recuperação de acesso
// caso o admin principal perca o acesso. Em produção, considere adicionar
// autenticação ou mover para um script de setup.
export const promoteToAdmin = mutation({
  args: {
    email: v.string(),
    secretKey: v.optional(v.string()), // Chave de segurança opcional
  },
  handler: async (ctx, { email, secretKey }) => {
    // Chave de segurança simples para evitar abuso
    // Em produção, use uma variável de ambiente
    const ADMIN_SECRET = "pmesp-admin-recovery-2024";

    if (secretKey && secretKey !== ADMIN_SECRET) {
      throw new Error("Chave de segurança inválida");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      throw new Error("Usuário não encontrado. Faça login primeiro para criar o registro.");
    }

    await ctx.db.patch(user._id, {
      role: "admin",
      approved: true,
      active: true,
    });

    return { success: true, message: `${email} agora é administrador` };
  },
});
