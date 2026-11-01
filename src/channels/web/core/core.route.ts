import { Hono } from "hono";
import type { AppBindings } from "../../../config/env.js";
import { z } from "zod";
import { coreApiService } from "../../../services/index.js";
import { messageAttachmentService, profileService } from "../../../services/index.js";
import { authMiddleware } from "../../../middlewares/index.js";

const uuid = z.string().uuid("Identificador inválido");
const positiveInteger = z.coerce.number().int().positive();
const nonNegativeInteger = z.coerce.number().int().nonnegative();
const pageSize = z.coerce.number().int().positive().max(100);
const paging = (c: { req: { query(name: string): string | undefined } }) => ({
  page: c.req.query("page") === undefined ? undefined : nonNegativeInteger.max(1_000_000).parse(c.req.query("page")),
  size: c.req.query("size") === undefined ? undefined : pageSize.parse(c.req.query("size")),
});

import { groupCreateSchema, groupUpdateSchema, stockSchema, stockProductCreateSchema, stockProductUpdateSchema, movementSchema, discardSchema, groupConversationSchema, privateConversationSchema, messageSchema, attachmentUploadSchema, reactionSchema, groupProductSchema, shoppingListSchema, shoppingItemSchema, shoppingItemUpdateSchema, completeShoppingSchema, invitationSchema, preferencesSchema, expenseSchema, checkoutSchema, aiRecipeChatSchema, httpsUrl, advertisementSchema, advertisementStatusSchema } from "../../../schemas/core-api.schema.js";

/** Contracts backed by existing core-api endpoints. */
const coreRoute = new Hono<AppBindings>();
coreRoute.use("*", authMiddleware);

coreRoute.get("/plans", async (c) => c.json(await coreApiService.listPlans()));
coreRoute.get("/advertisements/mine", async (c) => { const { page, size } = paging(c); return c.json(await coreApiService.listMyAdvertisements(c.get("authHeaders"), page, size)); });
coreRoute.get("/advertisements/active", async (c) => { const { page, size } = paging(c); return c.json(await coreApiService.listActiveAdvertisements(c.get("authHeaders"), page, size)); });
coreRoute.post("/advertisements", async (c) => c.json(await coreApiService.createAdvertisement(advertisementSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.put("/advertisements/:id", async (c) => c.json(await coreApiService.updateAdvertisement(uuid.parse(c.req.param("id")), advertisementSchema.parse(await c.req.json()), c.get("authHeaders"))));
coreRoute.patch("/advertisements/:id/status", async (c) => c.json(await coreApiService.updateAdvertisementStatus(uuid.parse(c.req.param("id")), advertisementStatusSchema.parse(await c.req.json()).status, c.get("authHeaders"))));
coreRoute.post("/advertisements/:id/impressions", async (c) => { await coreApiService.recordAdvertisementEvent(uuid.parse(c.req.param("id")), "impressions", c.get("authHeaders")); return c.body(null, 204); });
coreRoute.post("/advertisements/:id/clicks", async (c) => { await coreApiService.recordAdvertisementEvent(uuid.parse(c.req.param("id")), "clicks", c.get("authHeaders")); return c.body(null, 204); });
coreRoute.post("/transactions/checkout", async (c) => c.json(await coreApiService.checkout(checkoutSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.get("/transactions/:id", async (c) => c.json(await coreApiService.getTransaction(uuid.parse(c.req.param("id")), c.get("authHeaders"))));

coreRoute.get("/inventory/active-context", async (c) => {
  const rawGroupId = c.req.query("groupId");
  const groupId = rawGroupId === undefined ? undefined : uuid.parse(rawGroupId);
  return c.json(await coreApiService.getActiveContext(c.get("authHeaders"), groupId));
});
coreRoute.get("/inventory/summary", async (c) => {
  const rawGroupId = c.req.query("groupId");
  const groupId = rawGroupId === undefined ? undefined : uuid.parse(rawGroupId);
  return c.json(await coreApiService.getStockSummary(c.get("authHeaders"), groupId));
});

coreRoute.get("/groups", async (c) => c.json(await coreApiService.listGroups(c.get("authHeaders"))));
coreRoute.get("/groups/:id", async (c) => c.json(await coreApiService.getGroup(uuid.parse(c.req.param("id")), c.get("authHeaders"))));
coreRoute.post("/groups", async (c) => c.json(await coreApiService.createGroup(groupCreateSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.put("/groups/:id", async (c) => c.json(await coreApiService.updateGroup(uuid.parse(c.req.param("id")), groupUpdateSchema.parse(await c.req.json()), c.get("authHeaders"))));
coreRoute.post("/groups/:id/members", async (c) => c.json(await coreApiService.addGroupMember(uuid.parse(c.req.param("id")), z.object({ userId: uuid }).parse(await c.req.json()), c.get("authHeaders"))));
coreRoute.get("/groups/:id/products", async (c) => c.json(await coreApiService.listGroupProducts(uuid.parse(c.req.param("id")), c.get("authHeaders"))));
coreRoute.post("/groups/:id/products", async (c) => c.json(await coreApiService.createGroupProduct(uuid.parse(c.req.param("id")), groupProductSchema.parse(await c.req.json()), c.get("authHeaders")), 201));

coreRoute.get("/shopping-lists", async (c) => { const { page, size } = paging(c); const stockId = positiveInteger.parse(c.req.query("stockId")); const status = c.req.query("status") === undefined ? undefined : z.enum(["OPEN", "COMPLETED", "CANCELED"]).parse(c.req.query("status")); return c.json(await coreApiService.listShoppingLists(stockId, c.get("authHeaders"), page, size, status)); });
coreRoute.post("/shopping-lists", async (c) => c.json(await coreApiService.createShoppingList(shoppingListSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.get("/shopping-lists/suggestions", async (c) => c.json(await coreApiService.shoppingSuggestions(positiveInteger.parse(c.req.query("stockId")), c.get("authHeaders"))));
coreRoute.get("/shopping-lists/:id", async (c) => c.json(await coreApiService.getShoppingList(uuid.parse(c.req.param("id")), c.get("authHeaders"))));
coreRoute.delete("/shopping-lists/:id", async (c) => { await coreApiService.cancelShoppingList(uuid.parse(c.req.param("id")), c.get("authHeaders")); return c.body(null, 204); });
coreRoute.post("/shopping-lists/:id/items", async (c) => c.json(await coreApiService.addShoppingItem(uuid.parse(c.req.param("id")), shoppingItemSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.patch("/shopping-lists/:id/items/:itemId", async (c) => c.json(await coreApiService.updateShoppingItem(uuid.parse(c.req.param("id")), positiveInteger.parse(c.req.param("itemId")), shoppingItemUpdateSchema.parse(await c.req.json()), c.get("authHeaders"))));
coreRoute.delete("/shopping-lists/:id/items/:itemId", async (c) => { await coreApiService.deleteShoppingItem(uuid.parse(c.req.param("id")), positiveInteger.parse(c.req.param("itemId")), c.get("authHeaders")); return c.body(null, 204); });
coreRoute.delete("/shopping-lists/:id/purchased-items", async (c) => { await coreApiService.clearPurchasedItems(uuid.parse(c.req.param("id")), c.get("authHeaders")); return c.body(null, 204); });
coreRoute.post("/shopping-lists/:id/complete", async (c) => c.json(await coreApiService.completeShoppingList(uuid.parse(c.req.param("id")), completeShoppingSchema.parse(await c.req.json()), c.get("authHeaders"))));

coreRoute.get("/recipes", async (c) => { const { page, size } = paging(c); const name = c.req.query("name") === undefined ? undefined : z.string().trim().min(1).max(120).parse(c.req.query("name")); return c.json(await coreApiService.listRecipes(c.get("authHeaders"), page, size, name)); });
coreRoute.get("/recipes/favorites", async (c) => { const { page, size } = paging(c); return c.json(await coreApiService.listFavoriteRecipes(c.get("authHeaders"), page, size)); });
coreRoute.get("/recipes/suggestions", async (c) => c.json(await coreApiService.recipeSuggestions(c.get("authHeaders"), c.req.query("stockId") ? positiveInteger.parse(c.req.query("stockId")) : undefined, c.req.query("limit") ? positiveInteger.parse(c.req.query("limit")) : undefined)));
coreRoute.post("/ai/recipes/chat", async (c) => c.json(await coreApiService.chatWithRecipeAi(aiRecipeChatSchema.parse(await c.req.json()), c.get("authHeaders"))));
coreRoute.get("/ai/recipes/suggestions/:stockId", async (c) => c.json(await coreApiService.recipeAiSuggestions(positiveInteger.parse(c.req.param("stockId")), c.get("authHeaders"))));
coreRoute.get("/recipes/:id", async (c) => c.json(await coreApiService.getRecipe(positiveInteger.parse(c.req.param("id")), c.get("authHeaders"))));
coreRoute.put("/recipes/:id/favorite", async (c) => { await coreApiService.favoriteRecipe(positiveInteger.parse(c.req.param("id")), true, c.get("authHeaders")); return c.body(null, 204); });
coreRoute.delete("/recipes/:id/favorite", async (c) => { await coreApiService.favoriteRecipe(positiveInteger.parse(c.req.param("id")), false, c.get("authHeaders")); return c.body(null, 204); });

coreRoute.get("/notifications", async (c) => { const { page, size } = paging(c); return c.json(await coreApiService.listNotifications(c.get("authHeaders"), page, size)); });
coreRoute.get("/notifications/unread", async (c) => { const { page, size } = paging(c); return c.json(await coreApiService.listNotifications(c.get("authHeaders"), page, size, true)); });
coreRoute.get("/notifications/unread-count", async (c) => c.json(await coreApiService.unreadCount(c.get("authHeaders"))));
coreRoute.patch("/notifications/:id/read", async (c) => c.json(await coreApiService.markNotificationRead(uuid.parse(c.req.param("id")), c.get("authHeaders"))));
coreRoute.patch("/notifications/read-all", async (c) => { await coreApiService.markAllNotificationsRead(c.get("authHeaders")); return c.body(null, 204); });
coreRoute.delete("/notifications", async (c) => { await coreApiService.clearNotifications(c.get("authHeaders")); return c.body(null, 204); });
coreRoute.get("/preferences", async (c) => c.json(await coreApiService.getPreferences(c.get("authHeaders"))));
coreRoute.put("/preferences", async (c) => c.json(await coreApiService.updatePreferences(preferencesSchema.parse(await c.req.json()), c.get("authHeaders"))));

coreRoute.get("/groups/:id/invitations", async (c) => c.json(await coreApiService.listInvitations(uuid.parse(c.req.param("id")), c.get("authHeaders"))));
coreRoute.post("/groups/:id/invitations", async (c) => c.json(await coreApiService.createInvitation(uuid.parse(c.req.param("id")), invitationSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.patch("/groups/:groupId/members/:userId/role", async (c) => c.json(await coreApiService.setMemberRole(uuid.parse(c.req.param("groupId")), uuid.parse(c.req.param("userId")), z.object({ memberRole: z.enum(["OWNER", "EDITOR", "VIEWER"]) }).parse(await c.req.json()), c.get("authHeaders"))));

coreRoute.get("/commercial/groups/:groupId/expenses", async (c) => { const { page, size } = paging(c); return c.json(await coreApiService.listExpenses(uuid.parse(c.req.param("groupId")), c.get("authHeaders"), page, size)); });
coreRoute.post("/commercial/groups/:groupId/expenses", async (c) => c.json(await coreApiService.createExpense(uuid.parse(c.req.param("groupId")), expenseSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.get("/commercial/groups/:groupId/reports/monthly", async (c) => c.json(await coreApiService.monthlyReport(uuid.parse(c.req.param("groupId")), z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).parse(c.req.query("month")), c.get("authHeaders"))));
coreRoute.get("/commercial/groups/:groupId/employees", async (c) => c.json(await coreApiService.listEmployees(uuid.parse(c.req.param("groupId")), c.get("authHeaders"))));
coreRoute.post("/commercial/groups/:groupId/employees/invitations", async (c) => c.json(await coreApiService.inviteEmployee(uuid.parse(c.req.param("groupId")), invitationSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.delete("/groups/:id/members/:userId", async (c) => { await coreApiService.removeGroupMember(uuid.parse(c.req.param("id")), uuid.parse(c.req.param("userId")), c.get("authHeaders")); return c.body(null, 204); });

coreRoute.get("/inventory/groups/:groupId/stocks", async (c) => { const { page, size } = paging(c); return c.json(await coreApiService.listStocks(uuid.parse(c.req.param("groupId")), c.get("authHeaders"), page, size)); });
coreRoute.post("/inventory/stocks", async (c) => c.json(await coreApiService.createStock(stockSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.put("/inventory/stocks/:id", async (c) => c.json(await coreApiService.updateStock(String(positiveInteger.parse(c.req.param("id"))), stockSchema.parse(await c.req.json()), c.get("authHeaders"))));
coreRoute.get("/inventory/stocks/:stockId/products", async (c) => { const { page, size } = paging(c); return c.json(await coreApiService.listStockProducts(String(positiveInteger.parse(c.req.param("stockId"))), c.get("authHeaders"), page, size)); });
coreRoute.post("/inventory/stock-products", async (c) => c.json(await coreApiService.createStockProduct(stockProductCreateSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.get("/inventory/stock-products/:id", async (c) => c.json(await coreApiService.getStockProduct(String(positiveInteger.parse(c.req.param("id"))), c.get("authHeaders"))));
coreRoute.put("/inventory/stock-products/:id", async (c) => c.json(await coreApiService.updateStockProduct(String(positiveInteger.parse(c.req.param("id"))), stockProductUpdateSchema.parse(await c.req.json()), c.get("authHeaders"))));
coreRoute.delete("/inventory/stock-products/:id", async (c) => { await coreApiService.deleteStockProduct(String(positiveInteger.parse(c.req.param("id"))), c.get("authHeaders")); return c.body(null, 204); });
coreRoute.get("/inventory/stock-products/:id/movements", async (c) => { const { page, size } = paging(c); return c.json(await coreApiService.listMovements(String(positiveInteger.parse(c.req.param("id"))), c.get("authHeaders"), page, size)); });
coreRoute.post("/inventory/stock-products/:id/movements", async (c) => c.json(await coreApiService.createMovement(String(positiveInteger.parse(c.req.param("id"))), movementSchema.parse(await c.req.json()), c.get("authHeaders")), 201));

coreRoute.get("/discards", async (c) => { const { page, size } = paging(c); return c.json(await coreApiService.listDiscards(c.get("authHeaders"), page, size)); });
coreRoute.post("/discards", async (c) => c.json(await coreApiService.createDiscard(discardSchema.parse(await c.req.json()), c.get("authHeaders")), 201));

coreRoute.get("/chat/conversations", async (c) => c.json(await coreApiService.listConversations(c.get("authHeaders"))));
coreRoute.get("/chat/conversations/:id", async (c) => c.json(await coreApiService.getConversation(uuid.parse(c.req.param("id")), c.get("authHeaders"))));
coreRoute.post("/chat/conversations/group", async (c) => c.json(await coreApiService.createGroupConversation(groupConversationSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.post("/chat/conversations/private", async (c) => c.json(await coreApiService.createPrivateConversation(privateConversationSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.get("/chat/conversations/:id/messages", async (c) => { const { page, size } = paging(c); const result = await coreApiService.listMessages(uuid.parse(c.req.param("id")), c.get("authHeaders"), page, size, c.req.query("q")); return c.json(await messageAttachmentService.signPage(result)); });
coreRoute.post("/chat/conversations/:id/messages", async (c) => { const result = await coreApiService.sendMessage(uuid.parse(c.req.param("id")), messageSchema.parse(await c.req.json()), c.get("authHeaders")); return c.json(await messageAttachmentService.signMessageAttachments(result), 201); });
coreRoute.post("/chat/conversations/:id/attachments/upload-ticket", async (c) => { const id = uuid.parse(c.req.param("id")); const headers = c.get("authHeaders"); const [, user] = await Promise.all([coreApiService.getConversation(id, headers), profileService.getProfile({ headers })]); const input = attachmentUploadSchema.parse(await c.req.json()); return c.json(await messageAttachmentService.createUpload(user.id, id, input.fileName, input.mimeType)); });
coreRoute.get("/chat/conversations/:id/messages/:messageId/reactions", async (c) => c.json(await coreApiService.listMessageReactions(uuid.parse(c.req.param("id")), positiveInteger.parse(c.req.param("messageId")), c.get("authHeaders"))));
coreRoute.put("/chat/conversations/:id/messages/:messageId/reactions", async (c) => c.json(await coreApiService.addMessageReaction(uuid.parse(c.req.param("id")), positiveInteger.parse(c.req.param("messageId")), reactionSchema.parse(await c.req.json()), c.get("authHeaders"))));
coreRoute.delete("/chat/conversations/:id/messages/:messageId/reactions", async (c) => c.json(await coreApiService.removeMessageReaction(uuid.parse(c.req.param("id")), positiveInteger.parse(c.req.param("messageId")), reactionSchema.parse({ emoji: c.req.query("emoji") }).emoji, c.get("authHeaders"))));

export { coreRoute };
