import { Hono } from "hono";
import type { AppBindings } from "../../../config/env.js";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";
import { coreApiService } from "../../../services/index.js";
import { assertCommercialMoneySavingAccess } from "../../../services/index.js";
import { UnauthorizedException } from "../../../exceptions/index.js";
import { authMiddleware } from "../../../middlewares/index.js";

const coreProxyRoute = new Hono<AppBindings>();
coreProxyRoute.use("*", authMiddleware);
const forwardedHeaders = [
  "content-type",
  "user-agent",
  "idempotency-key",
  "x-ad-clicks-timestamp",
  "x-ad-clicks-signature",
] as const;
const jsonBodySchema = z.json();
const allowedMethods = new Set(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"]);

/**
 * Mobile compatibility surface for Core API operations without a dedicated
 * mobile aggregation. Core API remains responsible for authorization and DTO
 * validation; this route only forwards a fixed set of headers and the path.
 */
coreProxyRoute.all("*", async (c) => {
  const method = c.req.method.toUpperCase();
  if (!allowedMethods.has(method)) {
    return c.json({ status: 405, code: "METHOD_NOT_ALLOWED", message: "Método HTTP não permitido" }, 405);
  }

  const corePath = c.req.path.replace(/^\/mobile\/core(?=\/|$)/, "") || "/";
  const requestUrl = new URL(c.req.url);
  if (
    corePath.startsWith("//") ||
    corePath.includes("\\") ||
    corePath.length > 1_024 ||
    /%(?:2e|2f|5c|00)/i.test(corePath) ||
    corePath.split("/").some((segment) => segment === "." || segment === "..") ||
    requestUrl.search.length > 2_048
  ) {
    return c.json({ status: 400, code: "BAD_REQUEST", message: "Caminho inválido" }, 400);
  }
  const headers: Record<string, string> = {
    Authorization: c.get("authHeaders").Authorization,
  };

  for (const name of forwardedHeaders) {
    const value = c.req.header(name);
    if (value !== undefined) headers[name] = value;
  }

  if (/^\/groups\/[^/]+\/(?:money-saving|food-purchases)(?:\/|$)/.test(corePath)) {
    const authorization = headers.Authorization;
    if (!authorization?.startsWith("Bearer ")) throw new UnauthorizedException();
    await assertCommercialMoneySavingAccess({ Authorization: authorization });
  }

  const rawBody = ["GET", "HEAD"].includes(method) ? "" : await c.req.text();
  let body: string | undefined;
  if (rawBody.length > 0) {
    const contentType = c.req.header("Content-Type")?.split(";", 1)[0]?.trim().toLowerCase();
    if (contentType !== "application/json") {
      return c.json({ status: 415, code: "UNSUPPORTED_MEDIA_TYPE", message: "Envie um corpo application/json" }, 415);
    }
    let parsedBody: unknown;
    try {
      parsedBody = jsonBodySchema.parse(JSON.parse(rawBody));
    } catch {
      return c.json({ status: 400, code: "BAD_REQUEST", message: "Corpo JSON inválido" }, 400);
    }
    body = JSON.stringify(parsedBody);
  }
  const response = await coreApiService.forwardRequest({
    method,
    url: corePath,
    params: requestUrl.searchParams,
    headers,
    data: body || undefined,
    responseType: "text",
    transformResponse: [(data) => data],
  });

  const responseHeaders: Record<string, string | string[]> = {};
  const contentType = response.headers["content-type"];
  if (typeof contentType === "string") responseHeaders["Content-Type"] = contentType;

  if (response.status === 204 || response.status === 205 || response.status === 304) {
    return c.body(null, response.status as ContentfulStatusCode, responseHeaders);
  }

  return c.body(
    response.data == null ? "" : String(response.data),
    response.status as ContentfulStatusCode,
    responseHeaders,
  );
});

export { coreProxyRoute };
