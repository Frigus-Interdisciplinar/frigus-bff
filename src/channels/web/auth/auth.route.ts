import { Hono } from "hono";
import { authService } from "../../../services/index.js";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
} from "../../../schemas/index.js";

const authRoute = new Hono();

// rota de login para web
authRoute.post("/login", async (c) => {
  const body = await c.req.json();
  const validData = loginSchema.parse(body);
  const result = await authService.login(validData);
  return c.json(result);
});

// rota de registro para web
authRoute.post("/register", async (c) => {
  const body = await c.req.json();
  const validData = registerSchema.parse(body);
  const result = await authService.register(validData);
  return c.json(result, 201);
});

// rota de refresh token
authRoute.post("/refresh", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const validData = refreshSchema.parse(body);
  const cookieHeader = c.req.header("Cookie");
  const result = await authService.refreshToken(validData.refreshToken, {
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });
  return c.json(result);
});

// rota de logout
authRoute.post("/logout", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const validData = refreshSchema.parse(body);
  const cookieHeader = c.req.header("Cookie");
  await authService.logout(validData.refreshToken, {
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });
  return c.body(null, 204);
});

export { authRoute };
