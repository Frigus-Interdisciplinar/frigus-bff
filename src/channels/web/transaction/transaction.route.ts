import { Hono } from "hono";
import { transactionService } from "../../../services/index.js";
import { checkoutSchema } from "../../../schemas/index.js";

const transactionRoute = new Hono();

// checkout de assinatura de plano
transactionRoute.post("/checkout", async (c) => {
  const body = await c.req.json();
  const validData = checkoutSchema.parse(body);
  const authHeader = c.req.header("Authorization");
  const cookieHeader = c.req.header("Cookie");
  const idempotencyKey = c.req.header("Idempotency-Key");

  const result = await transactionService.checkout(validData, idempotencyKey, {
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });
  return c.json(result);
});

// listagem de transacoes do usuario logado
transactionRoute.get("/", async (c) => {
  const page = c.req.query("page");
  const size = c.req.query("size");
  const sort = c.req.query("sort");
  const authHeader = c.req.header("Authorization");
  const cookieHeader = c.req.header("Cookie");

  const result = await transactionService.listTransactions(
    {
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
      sort,
    },
    {
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    },
  );
  return c.json(result);
});

// buscar transacao por id
transactionRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const authHeader = c.req.header("Authorization");
  const cookieHeader = c.req.header("Cookie");

  const result = await transactionService.getTransactionById(id, {
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });
  return c.json(result);
});

// cancelar transacao
transactionRoute.post("/:id/cancel", async (c) => {
  const id = c.req.param("id");
  const authHeader = c.req.header("Authorization");
  const cookieHeader = c.req.header("Cookie");

  const result = await transactionService.cancelTransaction(id, {
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });
  return c.json(result);
});

export { transactionRoute };
