import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { coreApiService } from "../../../services/index.js";
import { assertCommercialMoneySavingAccess } from "../../../services/index.js";
import { UnauthorizedException } from "../../../exceptions/index.js";

const coreProxyRoute = new Hono();
const forwardedHeaders = [
  "authorization",
  "content-type",
  "user-agent",
  "idempotency-key",
  "x-ad-clicks-timestamp",
  "x-ad-clicks-signature",
] as const;

/**
 * Mobile compatibility surface for Core API operations without a dedicated
 * mobile aggregation. Core API remains responsible for authorization and DTO
 * validation; this route only forwards a fixed set of headers and the path.
 */
coreProxyRoute.all("*", async (c) => {
  const corePath = c.req.path.replace(/^\/mobile\/core(?=\/|$)/, "") || "/";
  if (
    corePath.startsWith("//") ||
    corePath.includes("\\") ||
    corePath.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    return c.json({ status: 400, code: "BAD_REQUEST", message: "Caminho inválido" }, 400);
  }
  const headers: Record<string, string> = {};

  for (const name of forwardedHeaders) {
    const value = c.req.header(name);
    if (value !== undefined) headers[name] = value;
  }

  if (/^\/groups\/[^/]+\/(?:money-saving|food-purchases)(?:\/|$)/.test(corePath)) {
    const authorization = headers.authorization;
    if (!authorization?.startsWith("Bearer ")) throw new UnauthorizedException();
    await assertCommercialMoneySavingAccess({ Authorization: authorization });
  }

  const body = ["GET", "HEAD"].includes(c.req.method.toUpperCase())
    ? undefined
    : await c.req.text();
  const response = await coreApiService.forwardRequest({
    method: c.req.method,
    url: corePath,
    params: new URL(c.req.url).searchParams,
    headers,
    data: body || undefined,
    responseType: "text",
    transformResponse: [(data) => data],
  });

  const responseHeaders: Record<string, string | string[]> = {};
  const contentType = response.headers["content-type"];
  if (typeof contentType === "string") responseHeaders["Content-Type"] = contentType;
  const setCookie = response.headers["set-cookie"];
  if (Array.isArray(setCookie)) {
    responseHeaders["Set-Cookie"] = setCookie;
  } else if (typeof setCookie === "string") {
    responseHeaders["Set-Cookie"] = setCookie;
  }

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
