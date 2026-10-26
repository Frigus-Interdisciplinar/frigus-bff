import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware } from "../../../middlewares/index.js";
import { coreApiService } from "../../../services/index.js";

const notificationsRoute = new Hono();
notificationsRoute.use("*", authMiddleware);
const positiveInteger = z.coerce.number().int().positive();
const nonNegativeInteger = z.coerce.number().int().nonnegative();
const uuid = z.string().uuid();

notificationsRoute.get("/", async (c) => {
  const page = c.req.query("page") === undefined ? 0 : nonNegativeInteger.parse(c.req.query("page"));
  const size = c.req.query("size") === undefined ? 30 : positiveInteger.parse(c.req.query("size"));
  const unreadOnly = c.req.query("unreadOnly") === "true";
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
