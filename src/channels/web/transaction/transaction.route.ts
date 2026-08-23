import { Hono } from "hono";
import { transactionService } from "../../../services/index.js";
import { authMiddleware } from "../../../middlewares/index.js";
import { checkoutSchema } from "../../../schemas/index.js";

const transactionRoute = new Hono();

// todas as rotas de transacao exigem autenticacao
transactionRoute.use("*", authMiddleware);

// checkout de assinatura de plano
transactionRoute.post("/checkout", async (c) => {
  const body = await c.req.json();
  const validData = checkoutSchema.parse(body);
  const authHeaders = c.get("authHeaders");
  const idempotencyKey = c.req.header("Idempotency-Key");

  const result = await transactionService.checkout(validData, idempotencyKey, {
    headers: authHeaders,
  });
  return c.json(result);
});

// listagem de transacoes do usuario logado
transactionRoute.get("/", async (c) => {
  const page = c.req.query("page");
  const size = c.req.query("size");
  const sort = c.req.query("sort");
  const authHeaders = c.get("authHeaders");

  const result = await transactionService.listTransactions(
    {
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
      sort,
    },
    {
      headers: authHeaders,
    },
  );
  return c.json(result);
});

// buscar transacao por id
transactionRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const authHeaders = c.get("authHeaders");

  const result = await transactionService.getTransactionById(id, {
    headers: authHeaders,
  });
  return c.json(result);
});

// cancelar transacao
transactionRoute.post("/:id/cancel", async (c) => {
  const id = c.req.param("id");
  const authHeaders = c.get("authHeaders");

  const result = await transactionService.cancelTransaction(id, {
    headers: authHeaders,
  });
  return c.json(result);
});

export { transactionRoute };
