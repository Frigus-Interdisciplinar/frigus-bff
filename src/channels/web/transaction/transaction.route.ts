import { Hono } from "hono";
import type { AppBindings } from "../../../config/env.js";
import { transactionService } from "../../../services/index.js";
import { authMiddleware } from "../../../middlewares/index.js";
import { checkoutSchema } from "../../../schemas/index.js";
import { z } from "zod";

const transactionRoute = new Hono<AppBindings>();
const uuidSchema = z.string().uuid();
const pagingSchema = z.object({
  page: z.coerce.number().int().nonnegative().max(1_000_000).optional(),
  size: z.coerce.number().int().positive().max(100).optional(),
  sort: z.string().trim().min(1).max(120).regex(/^[A-Za-z0-9_,.:-]+$/).optional(),
});

transactionRoute.use("*", authMiddleware);

transactionRoute.post("/checkout", async (c) => {
  const body = await c.req.json();
  const validData = checkoutSchema.parse(body);
  const authHeaders = c.get("authHeaders");
  const idempotencyKey = z.string().regex(/^[A-Za-z0-9:_-]{1,128}$/).optional().parse(c.req.header("Idempotency-Key"));

  const result = await transactionService.checkout(validData, idempotencyKey, {
    headers: authHeaders,
  });
  return c.json(result);
});

transactionRoute.get("/", async (c) => {
  const { page, size, sort } = pagingSchema.parse(c.req.query());
  const authHeaders = c.get("authHeaders");

  const result = await transactionService.listTransactions(
    {
      page,
      size,
      sort,
    },
    {
      headers: authHeaders,
    },
  );
  return c.json(result);
});

transactionRoute.get("/:id", async (c) => {
  const id = uuidSchema.parse(c.req.param("id"));
  const authHeaders = c.get("authHeaders");

  const result = await transactionService.getTransactionById(id, {
    headers: authHeaders,
  });
  return c.json(result);
});

transactionRoute.post("/:id/cancel", async (c) => {
  const id = uuidSchema.parse(c.req.param("id"));
  const authHeaders = c.get("authHeaders");

  const result = await transactionService.cancelTransaction(id, {
    headers: authHeaders,
  });
  return c.json(result);
});

export { transactionRoute };
