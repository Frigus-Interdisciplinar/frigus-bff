import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { UnauthorizedException } from "../exceptions/index.js";

declare module "hono" {
  interface ContextVariableMap {
    token: string;
    authHeaders: {
      Authorization: string;
    };
  }
}

// Extract the web session cookie and forward only its access token to the Core API.
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const cookieToken = getCookie(c, "accessToken");

  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (cookieToken) {
    token = cookieToken.trim();
  }

  if (!token) {
    throw new UnauthorizedException(
      "Token de autenticacao nao fornecido",
      "Voce precisa estar autenticado para acessar este recurso",
    );
  }

  // disponibiliza o token e os headers prontos para repasse aos servicos da core-api
  c.set("token", token);
  c.set("authHeaders", {
    Authorization: `Bearer ${token}`,
  });

  await next();
};
