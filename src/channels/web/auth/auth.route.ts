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
    path: "/web",
  });
  setCookie(c, "refreshToken", result.refreshToken, {
    httpOnly: true,
    ...cookiePolicy,
    ...persistentCookie,
    path: "/web/auth"
  });
  setCookie(c, "rememberMe", String(rememberMe), {
    httpOnly: true,
    ...cookiePolicy,
    ...persistentCookie,
    path: "/web/auth",
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
    path: "/web",
  });
  setCookie(c, "refreshToken", result.refreshToken, {
    httpOnly: true,
    ...cookiePolicy,
    ...persistentCookie,
    path: "/web/auth",
  });
  setCookie(c, "rememberMe", String(rememberMe), {
    httpOnly: true,
    ...cookiePolicy,
    ...persistentCookie,
    path: "/web/auth",
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
    path: "/web",
  });
  setCookie(c, "refreshToken", result.refreshToken, {
    httpOnly: true,
    ...cookiePolicy,
    ...persistentCookie,
    path: "/web/auth",
  });
  setCookie(c, "rememberMe", String(rememberMe), {
    httpOnly: true,
    ...cookiePolicy,
    ...persistentCookie,
    path: "/web/auth",
  });
  return c.json({ user: result.user });
});

authRoute.post("/logout", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const validData = refreshSchema.parse(body);
  const refreshToken = validData.refreshToken ?? getCookie(c, "refreshToken");
  await authService.logout(refreshToken);
  const cookiePolicy = sessionCookiePolicy(c.req.raw);
  deleteCookie(c, "accessToken", { path: "/web", ...cookiePolicy });
  deleteCookie(c, "refreshToken", { path: "/web/auth", ...cookiePolicy });
  deleteCookie(c, "rememberMe", { path: "/web/auth", ...cookiePolicy });
  return c.body(null, 204);
});

export { authRoute };
