import { Hono } from "hono";
import { coreApiService } from "../../../services/index.js";
import { authMiddleware } from "../../../middlewares/index.js";

const planRoute = new Hono();
planRoute.get("/", async (c) => c.json(await coreApiService.listPlans()));
planRoute.get("/catalog/products", async (c) => {
  const page = c.req.query("page");
  const size = c.req.query("size");
  return c.json(await coreApiService.listProducts(page ? Number(page) : undefined, size ? Number(size) : undefined));
});
planRoute.get("/subscription", authMiddleware, async (c) => c.json(await coreApiService.getMySubscription(c.get("authHeaders"))));
planRoute.post("/subscription/cancel", authMiddleware, async (c) => c.json(await coreApiService.cancelMySubscription(c.get("authHeaders"))));
planRoute.post("/subscription/reactivate", authMiddleware, async (c) => c.json(await coreApiService.reactivateMySubscription(c.get("authHeaders"))));

export { planRoute };
