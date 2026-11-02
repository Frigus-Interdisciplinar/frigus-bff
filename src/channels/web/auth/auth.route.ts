import { Hono } from "hono";
import type { AppBindings } from "../../../config/env.js";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import { env } from "../../../config/env.js";
import { authService } from "../../../services/index.js";
import {
  forgotPasswordSchema,
  googleLoginSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyResetCodeSchema,
} from "../../../schemas/index.js";

const authRoute = new Hono<AppBindings>();
// The web app may reach the BFF through a reverse-proxy prefix such as /api.
// Root-scoped cookies remain available after that prefix is rewritten upstream.
const WEB_SESSION_COOKIE_PATH = "/";

function sessionCookiePolicy(request: Request) {
  const origin = request.headers.get("Origin");
  let crossSite = false;

  if (origin) {
    try {
      const originUrl = new URL(origin);
      const requestUrl = new URL(request.url);
      const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
      const bothLocal =
        localHosts.has(originUrl.hostname) && localHosts.has(requestUrl.hostname);
      crossSite =
        originUrl.protocol !== requestUrl.protocol ||
        (originUrl.hostname !== requestUrl.hostname && !bothLocal);
    } catch {
      // The Origin middleware rejects invalid or untrusted origins separately.
    }
  }

  // Hosted web and BFF services use different sites, so their session cookies
  // must be SameSite=None and Secure even if NODE_ENV was not set by the host.
  const crossSiteCookies = env.NODE_ENV === "production" || crossSite;
  return {
    secure: crossSiteCookies,
    sameSite: crossSiteCookies ? "None" as const : "Lax" as const,
  };
}

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

authRoute.post("/login", async (c) => {
  const body = await c.req.json();
  const { rememberMe, ...validData } = loginSchema.parse(body);
  const userAgent = c.req.header("User-Agent");
  const result = await authService.login(
    validData,
    userAgent ? { headers: { "User-Agent": userAgent } } : undefined,
  );
  const persistentCookie = rememberMe ? { maxAge: 30 * 24 * 60 * 60 } : {};
  const cookiePolicy = sessionCookiePolicy(c.req.raw);

  setCookie(c, "accessToken", result.accessToken, {
    httpOnly: true,
    ...cookiePolicy,
    maxAge: 15 * 60, // 15 minutos
    path: WEB_SESSION_COOKIE_PATH,
  });
  setCookie(c, "refreshToken", result.refreshToken, {
    httpOnly: true,
    ...cookiePolicy,
    ...persistentCookie,
    path: WEB_SESSION_COOKIE_PATH,
  });
  setCookie(c, "rememberMe", String(rememberMe), {
    httpOnly: true,
    ...cookiePolicy,
    ...persistentCookie,
    path: WEB_SESSION_COOKIE_PATH,
  });

  return c.json({ user: result.user });
});

authRoute.post("/google", async (c) => {
  const { idToken, rememberMe } = googleLoginSchema.parse(await c.req.json());
  const userAgent = c.req.header("User-Agent");
  const result = await authService.loginWithGoogle(
    { idToken },
    userAgent ? { headers: { "User-Agent": userAgent } } : undefined,
  );
  const persistentCookie = rememberMe ? { maxAge: 30 * 24 * 60 * 60 } : {};
  const cookiePolicy = sessionCookiePolicy(c.req.raw);

  setCookie(c, "accessToken", result.accessToken, {
    httpOnly: true,
    ...cookiePolicy,
    maxAge: 15 * 60,
    path: WEB_SESSION_COOKIE_PATH,
  });
  setCookie(c, "refreshToken", result.refreshToken, {
    httpOnly: true,
    ...cookiePolicy,
    ...persistentCookie,
    path: WEB_SESSION_COOKIE_PATH,
  });
  setCookie(c, "rememberMe", String(rememberMe), {
    httpOnly: true,
    ...cookiePolicy,
    ...persistentCookie,
    path: WEB_SESSION_COOKIE_PATH,
  });

  return c.json({ user: result.user });
});

authRoute.post("/register", async (c) => {
  const body = await c.req.json();
  const validData = registerSchema.parse(body);
  const result = await authService.register(validData);
  return c.json(result, 201);
});

authRoute.post("/refresh", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const validData = refreshSchema.parse(body);
  const rememberMe = getCookie(c, "rememberMe") === "true";
  const persistentCookie = rememberMe ? { maxAge: 30 * 24 * 60 * 60 } : {};
  const refreshToken = validData.refreshToken ?? getCookie(c, "refreshToken");
  const userAgent = c.req.header("User-Agent");
  const result = await authService.refreshToken(
    refreshToken,
    userAgent ? { headers: { "User-Agent": userAgent } } : undefined,
  );
  const cookiePolicy = sessionCookiePolicy(c.req.raw);
  setCookie(c, "accessToken", result.accessToken, {
    httpOnly: true,
    ...cookiePolicy,
    maxAge: 15 * 60,
    path: WEB_SESSION_COOKIE_PATH,
  });
  setCookie(c, "refreshToken", result.refreshToken, {
    httpOnly: true,
    ...cookiePolicy,
    ...persistentCookie,
    path: WEB_SESSION_COOKIE_PATH,
  });
  setCookie(c, "rememberMe", String(rememberMe), {
    httpOnly: true,
    ...cookiePolicy,
    ...persistentCookie,
    path: WEB_SESSION_COOKIE_PATH,
  });
  return c.json({ user: result.user });
});

authRoute.post("/logout", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const validData = refreshSchema.parse(body);
  const refreshToken = validData.refreshToken ?? getCookie(c, "refreshToken");
  const cookiePolicy = sessionCookiePolicy(c.req.raw);

  try {
    await authService.logout(refreshToken);
  } catch (error) {
    console.error("[Auth] Logout token revocation failed", {
      correlationId: c.get("correlationId"),
      name: error instanceof Error ? error.name : "UnknownError",
    });
  } finally {
    deleteCookie(c, "accessToken", { path: WEB_SESSION_COOKIE_PATH, ...cookiePolicy });
    deleteCookie(c, "refreshToken", { path: WEB_SESSION_COOKIE_PATH, ...cookiePolicy });
    deleteCookie(c, "rememberMe", { path: WEB_SESSION_COOKIE_PATH, ...cookiePolicy });
  }

  return c.body(null, 204);
});

export { authRoute };
