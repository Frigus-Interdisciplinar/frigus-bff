import { Hono } from "hono";
import { z } from "zod";
import { coreApiService } from "../../../services/index.js";
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
const discardSchema = z.object({ stockProductId: positiveInteger, reason: z.string().max(2000).optional() });
const groupConversationSchema = z.object({ groupId: uuid, name: z.string().min(1), participantUserIds: z.array(uuid).optional() });
const privateConversationSchema = z.object({ targetUserId: uuid });
const messageSchema = z.object({ content: z.string().min(1), messageType: z.string().optional(), relatedShoppingListProductId: positiveInteger.optional() });

/** Contracts backed by existing core-api endpoints. */
const coreRoute = new Hono();
coreRoute.use("*", authMiddleware);

coreRoute.get("/groups", async (c) => c.json(await coreApiService.listGroups(c.get("authHeaders"))));
coreRoute.get("/groups/:id", async (c) => c.json(await coreApiService.getGroup(uuid.parse(c.req.param("id")), c.get("authHeaders"))));
coreRoute.post("/groups", async (c) => c.json(await coreApiService.createGroup(groupCreateSchema.parse(await c.req.json()), c.get("authHeaders")), 201));
coreRoute.put("/groups/:id", async (c) => c.json(await coreApiService.updateGroup(uuid.parse(c.req.param("id")), groupUpdateSchema.parse(await c.req.json()), c.get("authHeaders"))));
coreRoute.post("/groups/:id/members", async (c) => c.json(await coreApiService.addGroupMember(uuid.parse(c.req.param("id")), z.object({ userId: uuid }).parse(await c.req.json()), c.get("authHeaders"))));
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
coreRoute.get("/chat/conversations/:id/messages", async (c) => { const { page, size } = paging(c); return c.json(await coreApiService.listMessages(uuid.parse(c.req.param("id")), c.get("authHeaders"), page, size)); });
coreRoute.post("/chat/conversations/:id/messages", async (c) => c.json(await coreApiService.sendMessage(uuid.parse(c.req.param("id")), messageSchema.parse(await c.req.json()), c.get("authHeaders")), 201));

export { coreRoute };
