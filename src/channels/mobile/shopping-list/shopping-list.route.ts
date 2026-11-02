import { Hono } from "hono";
import type { AppBindings } from "../../../config/env.js";
import { z } from "zod";
import { authMiddleware } from "../../../middlewares/index.js";
import { coreApiService } from "../../../services/index.js";
import {
  completeShoppingSchema,
  shoppingItemSchema,
  shoppingItemUpdateSchema,
  shoppingListSchema,
} from "../../../schemas/core-api.schema.js";

const shoppingListRoute = new Hono<AppBindings>();
shoppingListRoute.use("*", authMiddleware);

const positiveInteger = z.coerce.number().int().positive().max(2_147_483_647);
const nonNegativeInteger = z.coerce.number().int().nonnegative().max(1_000_000);
const pageSize = z.coerce.number().int().positive().max(100);
const uuid = z.string().uuid();
const listStatus = z.enum(["OPEN", "COMPLETED", "CANCELED"]);

shoppingListRoute.get("/", async (c) => {
  const stockId = positiveInteger.parse(c.req.query("stockId"));
  const page = c.req.query("page") === undefined ? undefined : nonNegativeInteger.parse(c.req.query("page"));
  const size = c.req.query("size") === undefined ? undefined : pageSize.parse(c.req.query("size"));
  const status = c.req.query("status") === undefined ? undefined : listStatus.parse(c.req.query("status"));
  return c.json(await coreApiService.listShoppingLists(stockId, c.get("authHeaders"), page, size, status));
});

shoppingListRoute.post("/", async (c) => {
  const body = shoppingListSchema.parse(await c.req.json());
  return c.json(await coreApiService.createShoppingList(body, c.get("authHeaders")), 201);
});

shoppingListRoute.get("/suggestions", async (c) => {
  const stockId = positiveInteger.parse(c.req.query("stockId"));
  return c.json(await coreApiService.shoppingSuggestions(stockId, c.get("authHeaders")));
});

shoppingListRoute.get("/:id", async (c) => {
  const id = uuid.parse(c.req.param("id"));
  return c.json(await coreApiService.getShoppingList(id, c.get("authHeaders")));
});

shoppingListRoute.delete("/:id", async (c) => {
  const id = uuid.parse(c.req.param("id"));
  await coreApiService.cancelShoppingList(id, c.get("authHeaders"));
  return c.body(null, 204);
});

shoppingListRoute.post("/:id/items", async (c) => {
  const id = uuid.parse(c.req.param("id"));
  const body = shoppingItemSchema.parse(await c.req.json());
  return c.json(await coreApiService.addShoppingItem(id, body, c.get("authHeaders")), 201);
});

shoppingListRoute.patch("/:id/items/:itemId", async (c) => {
  const id = uuid.parse(c.req.param("id"));
  const itemId = positiveInteger.parse(c.req.param("itemId"));
  const body = shoppingItemUpdateSchema.parse(await c.req.json());
  return c.json(await coreApiService.updateShoppingItem(id, itemId, body, c.get("authHeaders")));
});

shoppingListRoute.delete("/:id/items/:itemId", async (c) => {
  const id = uuid.parse(c.req.param("id"));
  const itemId = positiveInteger.parse(c.req.param("itemId"));
  await coreApiService.deleteShoppingItem(id, itemId, c.get("authHeaders"));
  return c.body(null, 204);
});

shoppingListRoute.delete("/:id/purchased-items", async (c) => {
  const id = uuid.parse(c.req.param("id"));
  await coreApiService.clearPurchasedItems(id, c.get("authHeaders"));
  return c.body(null, 204);
});

shoppingListRoute.post("/:id/complete", async (c) => {
  const id = uuid.parse(c.req.param("id"));
  const body = completeShoppingSchema.parse(await c.req.json());
  return c.json(await coreApiService.completeShoppingList(id, body, c.get("authHeaders")));
});

export { shoppingListRoute };
