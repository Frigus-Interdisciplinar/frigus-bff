import { Hono } from "hono";
import type { AppBindings } from "../../../config/env.js";
import { z } from "zod";
import { coreApiService } from "../../../services/index.js";
import { authMiddleware } from "../../../middlewares/index.js";

const route = new Hono<AppBindings>();
const uuid = z.string().uuid("Identificador inválido");
const positiveInteger = z.coerce.number().int().positive();
const pageSize = z.coerce.number().int().positive().max(100);

route.use("*", authMiddleware);
route.get("/active", async (c) => {
  const page = c.req.query("page") === undefined ? undefined : z.coerce.number().int().nonnegative().max(1_000_000).parse(c.req.query("page"));
  const size = c.req.query("size") === undefined ? undefined : pageSize.parse(c.req.query("size"));
  return c.json(await coreApiService.listActiveAdvertisements(c.get("authHeaders"), page, size));
});
route.post("/:id/impressions", async (c) => {
  await coreApiService.recordAdvertisementEvent(uuid.parse(c.req.param("id")), "impressions", c.get("authHeaders"));
  return c.body(null, 204);
});
route.post("/:id/clicks", async (c) => {
  await coreApiService.recordAdvertisementEvent(uuid.parse(c.req.param("id")), "clicks", c.get("authHeaders"));
  return c.body(null, 204);
});

export { route as advertisementsRoute };
