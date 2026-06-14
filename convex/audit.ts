/**
 * Helper para salvar logs de auditoria em mutations do Convex.
 * Importar e chamar dentro de qualquer mutation.
 *
 * @param ctx      - Convex mutation context (ctx da função mutation)
 * @param args     - Dados do log de auditoria
 * @param args.acao               - Tipo de ação (create/update/delete)
 * @param args.tabela             - Nome da tabela afetada
 * @param args.registroId        - ID do registro (como string)
 * @param args.dadosAnteriores   - Estado anterior (null/undefined para create)
 * @param args.dadosNovos        - Estado novo (null/undefined para delete)
 * @param args.usuarioId         - ID do usuário que executou a ação
 * @param args.ip                - IP do cliente (opcional)
 */
export async function saveAuditLog(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  args: {
    acao: "create" | "update" | "delete";
    tabela: "materials" | "categories" | "units" | "users";
    registroId: string;
    dadosAnteriores?: unknown;
    dadosNovos?: unknown;
    usuarioId: string;
    ip?: string;
  }
) {
  await ctx.db.insert("auditLog", {
    acao: args.acao,
    tabela: args.tabela,
    registroId: args.registroId,
    dadosAnteriores: args.dadosAnteriores ?? null,
    dadosNovos: args.dadosNovos ?? null,
    usuarioId: args.usuarioId,
    ip: args.ip ?? null,
    createdAt: Date.now(),
  });
}