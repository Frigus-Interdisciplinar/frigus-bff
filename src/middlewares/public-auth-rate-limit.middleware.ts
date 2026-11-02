import { getConnInfo } from "@hono/node-server/conninfo";
import { isIP } from "node:net";
import type { Context, MiddlewareHandler } from "hono";
import { env } from "../config/env.js";
import { AppException } from "../exceptions/index.js";

type WindowEntry = { startedAt: number; count: number };

const windowMs = 15 * 60 * 1_000;
const maximumRequests = 10;
const maximumKeys = 10_000;
const windows = new Map<string, WindowEntry>();
let requestCount = 0;

function clientAddress(c: Context): string {
  try {
    const remoteAddress = getConnInfo(c).remote.address;
    if (env.TRUST_PROXY) {
      const forwardedAddress = c.req.header("X-Forwarded-For")?.split(",")[0]?.trim();
      if (forwardedAddress && isIP(forwardedAddress)) return forwardedAddress;
    }
    return remoteAddress ?? "unknown";
  } catch {
    return "unknown";
  }
}

function trimExpiredWindows(now: number): void {
  for (const [key, entry] of windows) {
    if (now - entry.startedAt >= windowMs) windows.delete(key);
  }
}

export const publicAuthRateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const now = Date.now();
  let key = `${clientAddress(c)}:${c.req.method}:${c.req.path}`;
  if (windows.size >= maximumKeys - 1 && !windows.has(key)) key = "overflow";

  let entry = windows.get(key);
  if (!entry || now - entry.startedAt >= windowMs) {
    if (windows.size >= maximumKeys - 1) trimExpiredWindows(now);
    entry = { startedAt: now, count: 0 };
    windows.set(key, entry);
  }

  requestCount += 1;
  if (requestCount % 256 === 0) trimExpiredWindows(now);

  if (entry.count >= maximumRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - entry.startedAt)) / 1_000));
    c.header("Retry-After", String(retryAfterSeconds));
    throw new AppException({
      status: 429,
      code: "RATE_LIMITED",
      message: "Limite de requisições de autenticação excedido",
      displayMessage: "Muitas tentativas. Aguarde antes de tentar novamente.",
    });
  }

  entry.count += 1;
  await next();
};
