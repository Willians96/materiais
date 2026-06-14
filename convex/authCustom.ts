import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Clerk authentication integration
// Uses Clerk for auth, but keeps approval workflow in our database

/**
 * Sync Clerk user to our database.
 * This is called after Clerk authentication succeeds.
 * Creates user record if doesn't exist (with approved=false for new users).
 */
export const syncClerkUser = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { clerkUserId, email, name }) => {
    // Buscar usuário por clerkUserId ou email
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    // Se não encontrou por clerkUserId, tentar por email
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
    }

    // Se usuário existe, apenas atualizar clerkUserId se necessário
    if (user) {
      if (user.clerkUserId !== clerkUserId) {
        await ctx.db.patch(user._id, { clerkUserId });
      }
      return {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        approved: user.approved,
        active: user.active,
      };
    }

    // Criar novo usuário
    const allUsers = await ctx.db.query("users").collect();
    const isFirstUser = allUsers.length === 0;
    const isAdminEmail = email === "michelwilliam@policiamilitar.sp.gov.br";

    const userId = await ctx.db.insert("users", {
      email,
      name: name || email.split("@")[0],
      clerkUserId,
      role: (isFirstUser || isAdminEmail) ? "admin" : "user",
      approved: (isFirstUser || isAdminEmail), // Admin padrão já aprovado
      active: (isFirstUser || isAdminEmail),
      createdAt: Date.now(),
    });

    const newUser = await ctx.db.get(userId);
    if (!newUser) throw new Error("Erro ao criar usuário");

    return {
      userId: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      approved: newUser.approved,
      active: newUser.active,
    };
  },
});

/**
 * Get current session by Convex user ID.
 * Verifies user is approved and active.
 */
export const getCurrentSession = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { userId }) => {
    try {
      if (!userId) return null;

      const user = await ctx.db.get(userId);
      if (!user) {
        return null;
      }

      if (!user.active || !user.approved) {
        return null;
      }

      return {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        clerkUserId: user.clerkUserId,
      };
    } catch (error) {
      console.error("Erro em getCurrentSession:", error);
      return null;
    }
  },
});

/**
 * Get user by Clerk user ID (for frontend Clerk integration).
 */
export const getUserByClerkId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, { clerkUserId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) return null;

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      approved: user.approved,
      active: user.active,
    };
  },
});