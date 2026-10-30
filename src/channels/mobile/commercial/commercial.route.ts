import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware } from "../../../middlewares/index.js";
import { coreApiService, assertCommercialMoneySavingAccess } from "../../../services/index.js";
import {
  foodPurchaseCreateSchema,
  foodPurchasePathSchema,
  foodPurchaseUpdateSchema,
  moneySavingEventsQuerySchema,
  moneySavingPathSchema,
  moneySavingRangeSchema,
} from "../../../schemas/money-saving.schema.js";
import { BadRequestException } from "../../../exceptions/index.js";

const route = new Hono();
const idempotencyKeySchema = z.string().trim().min(1).max(160);

route.use("*", authMiddleware);

route.get("/groups/:groupId/money-saving/summary", async (c) => {
  const { groupId } = moneySavingPathSchema.parse({ groupId: c.req.param("groupId") });
  const range = moneySavingRangeSchema.safeParse({ from: c.req.query("from"), to: c.req.query("to") });
  if (!range.success) throw new BadRequestException("Intervalo inválido", "Informe as datas from e to no formato AAAA-MM-DD");
  const headers = c.get("authHeaders");
  await assertCommercialMoneySavingAccess(headers);
  return c.json(await coreApiService.getMoneySavingSummary(groupId, range.data.from, range.data.to, headers));
});

route.get("/groups/:groupId/money-saving/events", async (c) => {
  const { groupId } = moneySavingPathSchema.parse({ groupId: c.req.param("groupId") });
  const query = moneySavingEventsQuerySchema.safeParse(c.req.query());
  if (!query.success) throw new BadRequestException("Filtros inválidos", "Confira o período, a categoria, o tipo e a paginação");
  const headers = c.get("authHeaders");
  await assertCommercialMoneySavingAccess(headers);
  return c.json(await coreApiService.getMoneySavingEvents(groupId, query.data, headers));
});

route.post("/groups/:groupId/food-purchases", async (c) => {
  const { groupId } = moneySavingPathSchema.parse({ groupId: c.req.param("groupId") });
  const body = foodPurchaseCreateSchema.parse(await c.req.json());
  const idempotencyKey = idempotencyKeySchema.safeParse(c.req.header("Idempotency-Key"));
  if (!idempotencyKey.success) throw new BadRequestException("Chave de idempotência obrigatória", "Envie o cabeçalho Idempotency-Key");
  const headers = c.get("authHeaders");
  await assertCommercialMoneySavingAccess(headers);
  return c.json(await coreApiService.createFoodPurchase(groupId, body, idempotencyKey.data, headers), 201);
});

route.get("/groups/:groupId/food-purchases/:purchaseId", async (c) => {
  const { groupId, purchaseId } = foodPurchasePathSchema.parse({ groupId: c.req.param("groupId"), purchaseId: c.req.param("purchaseId") });
  const headers = c.get("authHeaders");
  await assertCommercialMoneySavingAccess(headers);
  return c.json(await coreApiService.getFoodPurchase(groupId, purchaseId, headers));
});

route.put("/groups/:groupId/food-purchases/:purchaseId", async (c) => {
  const { groupId, purchaseId } = foodPurchasePathSchema.parse({ groupId: c.req.param("groupId"), purchaseId: c.req.param("purchaseId") });
  const body = foodPurchaseUpdateSchema.parse(await c.req.json());
  const headers = c.get("authHeaders");
  await assertCommercialMoneySavingAccess(headers);
  return c.json(await coreApiService.updateFoodPurchase(groupId, purchaseId, body, headers));
});

route.delete("/groups/:groupId/food-purchases/:purchaseId", async (c) => {
  const { groupId, purchaseId } = foodPurchasePathSchema.parse({ groupId: c.req.param("groupId"), purchaseId: c.req.param("purchaseId") });
  const headers = c.get("authHeaders");
  await assertCommercialMoneySavingAccess(headers);
  await coreApiService.deleteFoodPurchase(groupId, purchaseId, headers);
  return c.body(null, 204);
});

export { route as commercialRoute };
