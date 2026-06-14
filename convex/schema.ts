import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    password: v.optional(v.string()), // Hash da senha (opcional para compatibilidade)
    role: v.union(v.literal("admin"), v.literal("user")),
    unit: v.optional(v.id("units")),
    approved: v.boolean(),
    active: v.boolean(),
    createdAt: v.number(),
    // Novos campos
    lastLogin: v.optional(v.number()), // Timestamp do último login
    loginCount: v.number(),            // Contador de logins (default 0 via código)
  })
    .index("by_email", ["email"])
    .index("by_approved", ["approved"]),

  materials: defineTable({
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
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Novos campos
    updatedBy: v.optional(v.id("users")), // Quem fez a última alteração
    observacoes: v.optional(v.string()),   // Observações gerais
  })
    .index("by_patrimonio", ["patrimonio"])
    .index("by_unidade", ["unidade"])
    .index("by_categoria", ["categoria"])
    .index("by_status", ["status"])
    .index("by_createdBy", ["createdBy"]),

  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_active", ["active"]),

  units: defineTable({
    name: v.string(),
    code: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_active", ["active"]),

  // Tabela de auditoria
  auditLog: defineTable({
    acao: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("delete")
    ),
    tabela: v.string(),                          // Nome da tabela afetada
    registroId: v.string(),                     // ID do registro (genérico, não usa v.id())
    dadosAnteriores: v.optional(v.any()),       // Estado anterior (null em create)
    dadosNovos: v.optional(v.any()),            // Estado novo (null em delete)
    usuarioId: v.id("users"),                   // Quem realizou a ação
    ip: v.optional(v.string()),                 // Endereço IP do cliente
    createdAt: v.number(),                      // Timestamp da ação
  })
    .index("by_tabela", ["tabela"])
    .index("by_usuario", ["usuarioId"])
    .index("by_data", ["createdAt"])
    .index("by_tabela_registro", ["tabela", "registroId"]),
});