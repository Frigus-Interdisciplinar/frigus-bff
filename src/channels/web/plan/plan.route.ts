import { Hono } from "hono";
import type { AppBindings } from "../../../config/env.js";
import { z } from "zod";
import { coreApiService } from "../../../services/index.js";
import { authMiddleware } from "../../../middlewares/index.js";

const planRoute = new Hono<AppBindings>();
const paginationSchema = z.object({
  page: z.coerce.number().int().nonnegative().max(1_000_000).optional(),
  size: z.coerce.number().int().positive().max(100).optional(),
});
planRoute.get("/", async (c) => c.json(await coreApiService.listPlans()));
planRoute.get("/catalog/products", async (c) => {
  const { page, size } = paginationSchema.parse(c.req.query());
  return c.json(await coreApiService.listProducts(page, size));
});
planRoute.get("/subscription", authMiddleware, async (c) => c.json(await coreApiService.getMySubscription(c.get("authHeaders"))));
planRoute.post("/subscription/cancel", authMiddleware, async (c) => c.json(await coreApiService.cancelMySubscription(c.get("authHeaders"))));
planRoute.post("/subscription/reactivate", authMiddleware, async (c) => c.json(await coreApiService.reactivateMySubscription(c.get("authHeaders"))));

export { planRoute };
