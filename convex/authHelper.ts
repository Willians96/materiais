// Helper para autenticação customizada
// Substitui getAuthUserId do Convex Auth

import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Tipo para userId opcional
export type AuthUserId = Id<"users"> | undefined;

// Validador para userId
export const userIdValidator = v.optional(v.id("users"));

