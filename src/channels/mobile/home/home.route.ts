import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware } from "../../../middlewares/index.js";
import { coreApiService, profileService } from "../../../services/index.js";

const homeRoute = new Hono();
const uuid = z.string().uuid("Identificador de grupo inválido");
const notificationSizeSchema = z.coerce.number().int().positive().max(50);

homeRoute.use("*", authMiddleware);

/** Screen-ready bootstrap shared by domestic and commercial home screens. */
homeRoute.get("/", async (c) => {
  const rawGroupId = c.req.query("groupId");
  const groupId = rawGroupId === undefined ? undefined : uuid.parse(rawGroupId);
  const headers = c.get("authHeaders");
  const [user, context, inventorySummary] = await Promise.all([
    profileService.getProfile({ headers }),
    coreApiService.getActiveContext(headers, groupId),
    coreApiService.getStockSummary(headers, groupId),
  ]);

  const requestedSize = c.req.query("notificationSize");
  const notificationSize = requestedSize === undefined ? 5 : notificationSizeSchema.parse(requestedSize);
  const firstStockId = context.stocks[0]?.id;
  const [notifications, unread, recipes] = await Promise.all([
    coreApiService.listNotifications(headers, 0, notificationSize),
    coreApiService.unreadCount(headers),
    coreApiService.recipeSuggestions(headers, firstStockId, 5),
  ]);

  return c.json({
    user,
    groupId: context.groupId,
    stocks: context.stocks,
    inventorySummary,
    notifications: notifications.content,
    unreadNotificationCount: unread.count,
    recipeSuggestions: recipes,
  });
});

export { homeRoute };
