import { Hono } from "hono";
import { z } from "zod";
import { coreApiService } from "../../../services/index.js";
import { messageAttachmentService, profileService } from "../../../services/index.js";
import { authMiddleware } from "../../../middlewares/index.js";

const uuid = z.string().uuid("Identificador inválido");
const positiveInteger = z.coerce.number().int().positive();
const nonNegativeInteger = z.coerce.number().int().nonnegative();
const paging = (c: { req: { query(name: string): string | undefined } }) => ({
  page: c.req.query("page") === undefined ? undefined : nonNegativeInteger.parse(c.req.query("page")),
  size: c.req.query("size") === undefined ? undefined : positiveInteger.parse(c.req.query("size")),
});

const groupCreateSchema = z.object({ name: z.string().min(1), bannerPicture: z.string().url().optional() });
const groupUpdateSchema = groupCreateSchema.partial();
const stockSchema = z.object({ groupId: uuid, name: z.string().min(1) });
const stockProductCreateSchema = z.object({ productId: positiveInteger, stockId: positiveInteger, quantity: nonNegativeInteger, minimalQuantity: nonNegativeInteger.optional(), expireDate: z.string().date() });
const stockProductUpdateSchema = z.object({ minimalQuantity: nonNegativeInteger.optional(), expireDate: z.string().date() });
const movementSchema = z.object({ movementType: z.enum(["IN", "OUT", "ADJUSTMENT"]), quantity: nonNegativeInteger });
const discardSchema = z.object({ stockProductId: positiveInteger, quantity: positiveInteger, reason: z.string().max(2000).optional() });
const groupConversationSchema = z.object({ groupId: uuid, name: z.string().min(1), participantUserIds: z.array(uuid).optional() });
const privateConversationSchema = z.object({ targetUserId: uuid });
const messageSchema = z.object({ content: z.string().optional(), messageType: z.enum(["TEXT", "IMAGE", "SYSTEM"]).optional(), relatedShoppingListProductId: positiveInteger.optional(), attachments: z.array(z.object({ fileUrl: z.string().min(1), fileName: z.string().min(1).max(255), mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]), fileSize: positiveInteger })).max(5).optional() }).refine((value) => Boolean(value.content?.trim()) || Boolean(value.attachments?.length), "Envie uma mensagem ou anexo.");
const attachmentUploadSchema = z.object({ fileName: z.string().min(1).max(255), mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]), fileSize: positiveInteger.max(10 * 1024 * 1024) });
const reactionSchema = z.object({ emoji: z.enum(["👍", "❤️", "😂", "😮", "😢", "🙏"]) });
const groupProductSchema = z.object({ name: z.string().min(1).max(255), category: z.enum(["FRUIT", "VEGETABLE", "DAIRY", "GRAIN", "MEAT", "BEVERAGE", "CLEANING", "PERSONAL_HYGIENE"]), storagePlace: z.enum(["FRIDGE", "FREEZER", "PANTRY", "CABINET", "SHELF"]), unitPrice: z.number().positive(), unitOfMeasure: z.enum(["KILOGRAM", "GRAM", "LITER", "MILLILITER", "UNIT", "DOZEN", "PACKAGE"]), brand: z.string().max(120).optional() });
const shoppingListSchema = z.object({ stockId: positiveInteger, name: z.string().min(1).max(255), date: z.string().date().optional() });
const shoppingItemSchema = z.object({ productId: positiveInteger, quantity: positiveInteger });
const shoppingItemUpdateSchema = z.object({ quantity: positiveInteger.optional(), status: z.enum(["PENDING", "PURCHASE", "PURCHASED", "REMOVED"]).optional(), purchasedUnitPrice: z.number().nonnegative().optional() });
const completeShoppingSchema = z.object({ supplier: z.string().max(255).optional() });
const invitationSchema = z.object({ email: z.string().email(), name: z.string().max(255).optional(), memberRole: z.enum(["OWNER", "EDITOR", "VIEWER"]) });
const preferencesSchema = z.object({ expirationAlertsEnabled: z.boolean(), lowStockAlertsEnabled: z.boolean(), shoppingRemindersEnabled: z.boolean(), weeklySummaryEnabled: z.boolean(), theme: z.enum(["LIGHT", "DARK", "SYSTEM"]) });
const expenseSchema = z.object({ description: z.string().min(1).max(255), category: z.string().min(1).max(120), amount: z.number().positive(), expenseDate: z.string().date(), supplier: z.string().max(255).optional() });
const checkoutSchema = z.object({ planCode: z.string().min(1).max(20), paymentMethod: z.enum(["PIX", "BOLETO", "CREDIT_CARD"]).optional(), fakeCardLast4: z.string().regex(/^\d{4}$/).optional(), fakePixKey: z.string().min(10).max(150).optional() });
const httpsUrl = z.string().max(2048).url().refine((value) => new URL(value).protocol === "https:", "Use uma URL HTTPS pública");
const advertisementSchema = z.object({
  name: z.string().trim().min(1).max(120),
  productName: z.string().trim().min(1).max(160),
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(2000),
  imageUrl: httpsUrl,
  destinationUrl: httpsUrl.optional().or(z.literal("")),
  price: z.number().nonnegative().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});
const advertisementStatusSchema = z.object({ status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]) });

/** Contracts backed by existing core-api endpoints. */
const coreRoute = new Hono();
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

coreRoute.get("/inventory/active-context", async (c) => c.json(await coreApiService.getActiveContext(c.get("authHeaders"), c.req.query("groupId"))));
coreRoute.get("/inventory/summary", async (c) => c.json(await coreApiService.getStockSummary(c.get("authHeaders"), c.req.query("groupId"))));

coreRoute.get("/groups", async (c) => c.json(await coreApiService.listGroups(c.get("authHeaders"))));
coreRoute.get("/groups/:id", async (c) => c.json(await coreApiService.getGroup(uuid.parse(c.req.param("id")), c.get("authHeaders"))));
coreRoute.post("/groups", async (c) => c.json(await coreApiService.createGroup(groupCreateSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.put("/groups/:id", async (c) => c.json(await coreApiService.updateGroup(uuid.parse(c.req.param("id")), groupUpdateSchema.parse(await c.req.json()), c.get("authHeaders"))));
coreRoute.post("/groups/:id/members", async (c) => c.json(await coreApiService.addGroupMember(uuid.parse(c.req.param("id")), z.object({ userId: uuid }).parse(await c.req.json()), c.get("authHeaders"))));
coreRoute.get("/groups/:id/products", async (c) => c.json(await coreApiService.listGroupProducts(uuid.parse(c.req.param("id")), c.get("authHeaders"))));
coreRoute.post("/groups/:id/products", async (c) => c.json(await coreApiService.createGroupProduct(uuid.parse(c.req.param("id")), groupProductSchema.parse(await c.req.json()), c.get("authHeaders")), 201));

coreRoute.get("/shopping-lists", async (c) => { const { page, size } = paging(c); const stockId = positiveInteger.parse(c.req.query("stockId")); return c.json(await coreApiService.listShoppingLists(stockId, c.get("authHeaders"), page, size, c.req.query("status"))); });
coreRoute.post("/shopping-lists", async (c) => c.json(await coreApiService.createShoppingList(shoppingListSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.get("/shopping-lists/:id", async (c) => c.json(await coreApiService.getShoppingList(uuid.parse(c.req.param("id")), c.get("authHeaders"))));
coreRoute.delete("/shopping-lists/:id", async (c) => { await coreApiService.cancelShoppingList(uuid.parse(c.req.param("id")), c.get("authHeaders")); return c.body(null, 204); });
coreRoute.get("/shopping-lists/suggestions", async (c) => c.json(await coreApiService.shoppingSuggestions(positiveInteger.parse(c.req.query("stockId")), c.get("authHeaders"))));
coreRoute.post("/shopping-lists/:id/items", async (c) => c.json(await coreApiService.addShoppingItem(uuid.parse(c.req.param("id")), shoppingItemSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.patch("/shopping-lists/:id/items/:itemId", async (c) => c.json(await coreApiService.updateShoppingItem(uuid.parse(c.req.param("id")), positiveInteger.parse(c.req.param("itemId")), shoppingItemUpdateSchema.parse(await c.req.json()), c.get("authHeaders"))));
coreRoute.delete("/shopping-lists/:id/items/:itemId", async (c) => { await coreApiService.deleteShoppingItem(uuid.parse(c.req.param("id")), positiveInteger.parse(c.req.param("itemId")), c.get("authHeaders")); return c.body(null, 204); });
coreRoute.delete("/shopping-lists/:id/purchased-items", async (c) => { await coreApiService.clearPurchasedItems(uuid.parse(c.req.param("id")), c.get("authHeaders")); return c.body(null, 204); });
coreRoute.post("/shopping-lists/:id/complete", async (c) => c.json(await coreApiService.completeShoppingList(uuid.parse(c.req.param("id")), completeShoppingSchema.parse(await c.req.json()), c.get("authHeaders"))));

coreRoute.get("/recipes", async (c) => { const { page, size } = paging(c); return c.json(await coreApiService.listRecipes(c.get("authHeaders"), page, size, c.req.query("name"))); });
coreRoute.get("/recipes/favorites", async (c) => { const { page, size } = paging(c); return c.json(await coreApiService.listFavoriteRecipes(c.get("authHeaders"), page, size)); });
coreRoute.get("/recipes/suggestions", async (c) => c.json(await coreApiService.recipeSuggestions(c.get("authHeaders"), c.req.query("stockId") ? positiveInteger.parse(c.req.query("stockId")) : undefined, c.req.query("limit") ? positiveInteger.parse(c.req.query("limit")) : undefined)));
coreRoute.get("/recipes/:id", async (c) => c.json(await coreApiService.getRecipe(positiveInteger.parse(c.req.param("id")), c.get("authHeaders"))));
coreRoute.put("/recipes/:id/favorite", async (c) => { await coreApiService.favoriteRecipe(positiveInteger.parse(c.req.param("id")), true, c.get("authHeaders")); return c.body(null, 204); });
coreRoute.delete("/recipes/:id/favorite", async (c) => { await coreApiService.favoriteRecipe(positiveInteger.parse(c.req.param("id")), false, c.get("authHeaders")); return c.body(null, 204); });

coreRoute.get("/notifications", async (c) => { const { page, size } = paging(c); return c.json(await coreApiService.listNotifications(c.get("authHeaders"), page, size)); });
coreRoute.get("/notifications/unread", async (c) => { const { page, size } = paging(c); return c.json(await coreApiService.listNotifications(c.get("authHeaders"), page, size, true)); });
coreRoute.get("/notifications/unread-count", async (c) => c.json(await coreApiService.unreadCount(c.get("authHeaders"))));
coreRoute.patch("/notifications/:id/read", async (c) => c.json(await coreApiService.markNotificationRead(uuid.parse(c.req.param("id")), c.get("authHeaders"))));
coreRoute.patch("/notifications/read-all", async (c) => { await coreApiService.markAllNotificationsRead(c.get("authHeaders")); return c.body(null, 204); });
coreRoute.get("/preferences", async (c) => c.json(await coreApiService.getPreferences(c.get("authHeaders"))));
coreRoute.put("/preferences", async (c) => c.json(await coreApiService.updatePreferences(preferencesSchema.parse(await c.req.json()), c.get("authHeaders"))));

coreRoute.get("/groups/:id/invitations", async (c) => c.json(await coreApiService.listInvitations(uuid.parse(c.req.param("id")), c.get("authHeaders"))));
coreRoute.post("/groups/:id/invitations", async (c) => c.json(await coreApiService.createInvitation(uuid.parse(c.req.param("id")), invitationSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.patch("/groups/:groupId/members/:userId/role", async (c) => c.json(await coreApiService.setMemberRole(uuid.parse(c.req.param("groupId")), uuid.parse(c.req.param("userId")), z.object({ memberRole: z.enum(["OWNER", "EDITOR", "VIEWER"]) }).parse(await c.req.json()), c.get("authHeaders"))));

coreRoute.get("/commercial/groups/:groupId/expenses", async (c) => { const { page, size } = paging(c); return c.json(await coreApiService.listExpenses(uuid.parse(c.req.param("groupId")), c.get("authHeaders"), page, size)); });
coreRoute.post("/commercial/groups/:groupId/expenses", async (c) => c.json(await coreApiService.createExpense(uuid.parse(c.req.param("groupId")), expenseSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.get("/commercial/groups/:groupId/reports/monthly", async (c) => c.json(await coreApiService.monthlyReport(uuid.parse(c.req.param("groupId")), z.string().regex(/^\d{4}-\d{2}$/).parse(c.req.query("month")), c.get("authHeaders"))));
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
coreRoute.post("/chat/conversations/:id/attachments/upload-ticket", async (c) => { const id = uuid.parse(c.req.param("id")); const headers = c.get("authHeaders"); await coreApiService.getConversation(id, headers); const user = await profileService.getProfile({ headers }); const input = attachmentUploadSchema.parse(await c.req.json()); return c.json(await messageAttachmentService.createUpload(user.id, id, input.fileName, input.mimeType)); });
coreRoute.get("/chat/conversations/:id/messages/:messageId/reactions", async (c) => c.json(await coreApiService.listMessageReactions(uuid.parse(c.req.param("id")), positiveInteger.parse(c.req.param("messageId")), c.get("authHeaders"))));
coreRoute.put("/chat/conversations/:id/messages/:messageId/reactions", async (c) => c.json(await coreApiService.addMessageReaction(uuid.parse(c.req.param("id")), positiveInteger.parse(c.req.param("messageId")), reactionSchema.parse(await c.req.json()), c.get("authHeaders"))));
coreRoute.delete("/chat/conversations/:id/messages/:messageId/reactions", async (c) => c.json(await coreApiService.removeMessageReaction(uuid.parse(c.req.param("id")), positiveInteger.parse(c.req.param("messageId")), reactionSchema.parse({ emoji: c.req.query("emoji") }).emoji, c.get("authHeaders"))));

export { coreRoute };
