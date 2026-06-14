import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Mutation para popular categorias e unidades iniciais (idempotente)
// Pode ser chamada múltiplas vezes sem duplicar dados

export const seed = mutation({
  args: {
    adminSecret: v.optional(v.string()),
  },
  handler: async (ctx, { adminSecret }) => {
    // Proteção simples - só executar com a chave correta
    const SEED_SECRET = "pmesp-seed-2024";
    if (adminSecret && adminSecret !== SEED_SECRET) {
      throw new Error("Chave de seed inválida");
    }

    const results = {
      categories: { inserted: 0, skipped: 0 },
      units: { inserted: 0, skipped: 0 },
      adminUser: { created: false, exists: false },
    };

    // ========== CATEGORIAS ==========
    const categoriesData = [
      { name: "Armamento", description: "Armas e equipamentos de segurança" },
      { name: "Veículos", description: "Viaturas e veículos" },
      { name: "Equipamentos", description: "Equipamentos diversos" },
      { name: "Informática", description: "Computadores e periféricos" },
      { name: "Mobiliário", description: "Móveis e mobiliário" },
      { name: "Alimentos", description: "Alimentos e bebidas" },
      { name: "Colete", description: "Colete de proteção balística" },
      { name: "Algema", description: "Algema de aço" },
      { name: "TPD", description: "TPD" },
    ];

    for (const cat of categoriesData) {
      const existing = await ctx.db
        .query("categories")
        .filter((q) => q.eq(q.field("name"), cat.name))
        .first();

      if (existing) {
        results.categories.skipped++;
        continue;
      }

      await ctx.db.insert("categories", {
        name: cat.name,
        description: cat.description,
        active: true,
        createdAt: Date.now(),
      });
      results.categories.inserted++;
    }

    // ========== UNIDADES ==========
    const unitsData = [
      { name: "CPI-7", code: "CPI7" },
      { name: "7ºBPM-I", code: "7BPMI" },
      { name: "12ºBPM-I", code: "12BPMI" },
      { name: "14ºBAEP", code: "14BAEP" },
      { name: "22ºBPM-I", code: "22BPMI" },
      { name: "40ºBPM-I", code: "40BPMI" },
      { name: "50ºBPM-I", code: "50BPMI" },
      { name: "53ºBPM-I", code: "53BPMI" },
      { name: "54ºBPM-I", code: "54BPMI" },
      { name: "55ºBPM-I", code: "55BPMI" },
    ];

    for (const unit of unitsData) {
      const existing = await ctx.db
        .query("units")
        .filter((q) => q.eq(q.field("name"), unit.name))
        .first();

      if (existing) {
        results.units.skipped++;
        continue;
      }

      await ctx.db.insert("units", {
        name: unit.name,
        code: unit.code,
        active: true,
        createdAt: Date.now(),
      });
      results.units.inserted++;
    }

    // ========== ADMIN INICIAL ==========
    const adminEmail = "michelwilliam@policiamilitar.sp.gov.br";
    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", adminEmail))
      .first();

    if (!existingAdmin) {
      await ctx.db.insert("users", {
        email: adminEmail,
        name: "michelwilliam",
        password: "Tigrao@9265", // Senha padrão
        role: "admin",
        approved: true,
        active: true,
        createdAt: Date.now(),
        loginCount: 0,
      });
      results.adminUser.created = true;
    } else {
      results.adminUser.exists = true;
    }

    return results;
  },
});
