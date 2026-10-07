import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import { authService } from "../../../services/index.js";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyResetCodeSchema,
} from "../../../schemas/index.js";

const authRoute = new Hono();

authRoute.post("/forgot-password", async (c) => {
  const body = forgotPasswordSchema.parse(await c.req.json());
  await authService.requestPasswordRecovery(body);
  return c.body(null, 204);
});

authRoute.post("/reset-password", async (c) => {
  const body = resetPasswordSchema.parse(await c.req.json());
  await authService.resetPassword(body);
  return c.body(null, 204);
});

authRoute.post("/verify-reset-code", async (c) => {
  const body = verifyResetCodeSchema.parse(await c.req.json());
  await authService.verifyPasswordRecoveryCode(body);
  return c.body(null, 204);
});

// rota de login para web
authRoute.post("/login", async (c) => {
  const body = await c.req.json();
  const { rememberMe, ...validData } = loginSchema.parse(body);
  const result = await authService.login(validData);
  const persistentCookie = rememberMe ? { maxAge: 30 * 24 * 60 * 60 } : {};

  setCookie(c, "accessToken", result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 15 * 60, // 15 minutos
    path: "/",
  });
  setCookie(c, "refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    ...persistentCookie,
    path: "/"
  });
  setCookie(c, "rememberMe", String(rememberMe), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    ...persistentCookie,
    path: "/",
  });

  // The current web client keeps these fields in its session state. Cookies remain
  // the transport used by protected requests, while returning the canonical core
  // response keeps the BFF contract aligned with that client.
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
  const rememberMe = getCookie(c, "rememberMe") === "true";
  const persistentCookie = rememberMe ? { maxAge: 30 * 24 * 60 * 60 } : {};
  const result = await authService.refreshToken(validData.refreshToken, {
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });
  setCookie(c, "accessToken", result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 15 * 60,
    path: "/",
  });
  setCookie(c, "refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    ...persistentCookie,
    path: "/",
  });
  setCookie(c, "rememberMe", String(rememberMe), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    ...persistentCookie,
    path: "/",
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
  deleteCookie(c, "accessToken", { path: "/" });
  deleteCookie(c, "refreshToken", { path: "/" });
  deleteCookie(c, "rememberMe", { path: "/" });
  return c.body(null, 204);
});

export { authRoute };
