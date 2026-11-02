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
  const bearerToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const token = bearerToken ?? cookieToken?.trim();

  if (!token || token.length > 8_192 || /[\s\u0000-\u001f\u007f]/.test(token)) {
    throw new UnauthorizedException(
      "Token de autenticacao nao fornecido",
      "Voce precisa estar autenticado para acessar este recurso",
    );
  }

  c.set("token", token);
  c.set("authHeaders", {
    Authorization: `Bearer ${token}`,
  });

  await next();
};
