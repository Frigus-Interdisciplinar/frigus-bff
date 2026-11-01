import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type { MiddlewareHandler } from "hono";

declare module "hono" {
  interface ContextVariableMap {
    correlationId: string;
  }
}

const requestContext = new AsyncLocalStorage<string>();
const correlationIdPattern = /^[A-Za-z0-9._:-]{1,128}$/;

export const requestContextMiddleware: MiddlewareHandler = async (c, next) => {
  const candidate = c.req.header("X-Correlation-ID") ?? c.req.header("X-Request-ID");
  const correlationId = candidate && correlationIdPattern.test(candidate)
    ? candidate
    : randomUUID();

  c.set("correlationId", correlationId);
  c.header("X-Correlation-ID", correlationId);
  await requestContext.run(correlationId, next);
};

export function getCurrentCorrelationId(): string | undefined {
  return requestContext.getStore();
}
