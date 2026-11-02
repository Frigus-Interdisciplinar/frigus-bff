import { Hono } from "hono";
import type { AppBindings } from "../../../config/env.js";
import { z } from "zod";
import { authMiddleware } from "../../../middlewares/index.js";
import { coreApiService } from "../../../services/index.js";

const notificationsRoute = new Hono<AppBindings>();
notificationsRoute.use("*", authMiddleware);
const positiveInteger = z.coerce.number().int().positive().max(2_147_483_647);
const nonNegativeInteger = z.coerce.number().int().nonnegative().max(1_000_000);
const pageSize = z.coerce.number().int().positive().max(100);
const uuid = z.string().uuid();
const unreadOnlySchema = z.enum(["true", "false"]).default("false").transform((value) => value === "true");

notificationsRoute.get("/", async (c) => {
  const page = c.req.query("page") === undefined ? 0 : nonNegativeInteger.parse(c.req.query("page"));
  const size = c.req.query("size") === undefined ? 30 : pageSize.parse(c.req.query("size"));
  const unreadOnly = unreadOnlySchema.parse(c.req.query("unreadOnly"));
  const headers = c.get("authHeaders");
  const [notifications, unread] = await Promise.all([
    coreApiService.listNotifications(headers, page, size, unreadOnly),
    coreApiService.unreadCount(headers),
  ]);
  return c.json({ ...notifications, unreadCount: unread.count });
});

notificationsRoute.patch("/:id/read", async (c) =>
  c.json(await coreApiService.markNotificationRead(uuid.parse(c.req.param("id")), c.get("authHeaders"))));

notificationsRoute.patch("/read-all", async (c) => {
  await coreApiService.markAllNotificationsRead(c.get("authHeaders"));
  return c.body(null, 204);
});

notificationsRoute.delete("/", async (c) => {
  await coreApiService.clearNotifications(c.get("authHeaders"));
  return c.body(null, 204);
});

export { notificationsRoute };
