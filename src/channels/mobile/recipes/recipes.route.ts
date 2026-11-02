import { Hono } from "hono";
import type { AppBindings } from "../../../config/env.js";
import { z } from "zod";
import { authMiddleware } from "../../../middlewares/index.js";
import { coreApiService } from "../../../services/index.js";
import { aiRecipeChatSchema } from "../../../schemas/core-api.schema.js";

const recipesRoute = new Hono<AppBindings>();
recipesRoute.use("*", authMiddleware);
const positiveInteger = z.coerce.number().int().positive().max(2_147_483_647);
const nonNegativeInteger = z.coerce.number().int().nonnegative().max(1_000_000);
const pageSize = z.coerce.number().int().positive().max(100);

recipesRoute.get("/", async (c) => {
  const page = c.req.query("page") === undefined ? 0 : nonNegativeInteger.parse(c.req.query("page"));
  const size = c.req.query("size") === undefined ? 20 : pageSize.parse(c.req.query("size"));
  const name = c.req.query("q") === undefined
    ? undefined
    : z.string().trim().min(1).max(120).parse(c.req.query("q"));
  return c.json(await coreApiService.listRecipes(c.get("authHeaders"), page, size, name));
});

recipesRoute.get("/favorites", async (c) => {
  const page = c.req.query("page") === undefined ? 0 : nonNegativeInteger.parse(c.req.query("page"));
  const size = c.req.query("size") === undefined ? 20 : pageSize.parse(c.req.query("size"));
  return c.json(await coreApiService.listFavoriteRecipes(c.get("authHeaders"), page, size));
});

recipesRoute.get("/suggestions", async (c) => {
  const stockId = c.req.query("stockId") === undefined ? undefined : positiveInteger.parse(c.req.query("stockId"));
  const limit = c.req.query("limit") === undefined ? 10 : positiveInteger.parse(c.req.query("limit"));
  return c.json(await coreApiService.recipeSuggestions(c.get("authHeaders"), stockId, limit));
});

recipesRoute.get("/ai/suggestions/:stockId", async (c) =>
  c.json(await coreApiService.recipeAiSuggestions(positiveInteger.parse(c.req.param("stockId")), c.get("authHeaders"))));

recipesRoute.post("/ai/chat", async (c) => {
  const body = aiRecipeChatSchema.parse(await c.req.json());
  return c.json(await coreApiService.chatWithRecipeAi(body, c.get("authHeaders")));
});

recipesRoute.put("/:id/favorite", async (c) => {
  await coreApiService.favoriteRecipe(positiveInteger.parse(c.req.param("id")), true, c.get("authHeaders"));
  return c.body(null, 204);
});

recipesRoute.delete("/:id/favorite", async (c) => {
  await coreApiService.favoriteRecipe(positiveInteger.parse(c.req.param("id")), false, c.get("authHeaders"));
  return c.body(null, 204);
});

recipesRoute.get("/:id", async (c) => {
  const id = positiveInteger.parse(c.req.param("id"));
  const stockId = c.req.query("stockId") === undefined
    ? undefined
    : positiveInteger.parse(c.req.query("stockId"));
  const headers = c.get("authHeaders");
  const [recipe, availability] = await Promise.all([
    coreApiService.getRecipe(id, headers),
    stockId === undefined ? Promise.resolve(undefined) : coreApiService.getRecipeAvailability(id, headers, stockId),
  ]);
  return c.json({ ...recipe, ...(availability === undefined ? {} : { availability }) });
});

export { recipesRoute };
