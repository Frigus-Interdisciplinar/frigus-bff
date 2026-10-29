import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware } from "../../../middlewares/index.js";
import { coreApiService } from "../../../services/index.js";
import {
  completeShoppingSchema,
  shoppingItemSchema,
  shoppingItemUpdateSchema,
  shoppingListSchema,
} from "../../../schemas/core-api.schema.js";

const shoppingListRoute = new Hono();
shoppingListRoute.use("*", authMiddleware);

const positiveInteger = z.coerce.number().int().positive();
const nonNegativeInteger = z.coerce.number().int().nonnegative();
const uuid = z.string().uuid();

shoppingListRoute.get("/", async (c) => {
  const stockId = positiveInteger.parse(c.req.query("stockId"));
  const page = c.req.query("page") === undefined ? undefined : nonNegativeInteger.parse(c.req.query("page"));
  const size = c.req.query("size") === undefined ? undefined : positiveInteger.parse(c.req.query("size"));
  return c.json(await coreApiService.listShoppingLists(stockId, c.get("authHeaders"), page, size, c.req.query("status")));
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
