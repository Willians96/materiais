import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// Convex Auth temporariamente desabilitado devido a erro de compatibilidade
// TODO: Implementar autenticação customizada ou corrigir Convex Auth
// import { convexAuth } from "@convex-dev/auth/server";
// convexAuth(http);

// Rota básica para manter o http router funcionando
const testRoute = httpAction(async (_ctx, _request: Request) => {
  return new Response("OK", { status: 200 });
});

http.route({
  path: "/",
  method: "GET",
  handler: testRoute,
});

export default http;
