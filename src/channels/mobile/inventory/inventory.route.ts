import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware } from "../../../middlewares/index.js";
import { coreApiService } from "../../../services/index.js";
import type { CorePage, CoreStockProduct } from "../../../types/core-api.type.js";
import { NotFoundException } from "../../../exceptions/index.js";

const inventoryRoute = new Hono();
inventoryRoute.use("*", authMiddleware);

const positiveInteger = z.coerce.number().int().positive();
const nonNegativeInteger = z.coerce.number().int().nonnegative();
const uuid = z.string().uuid();
const category = z.enum(["FRUIT", "VEGETABLE", "DAIRY", "GRAIN", "MEAT", "BEVERAGE", "CLEANING", "PERSONAL_HYGIENE", "FISH", "FROZEN", "SWEETS", "CANNED", "SEASONING"]);
const storagePlace = z.enum(["FRIDGE", "FREEZER", "PANTRY", "CABINET", "SHELF"]);
import { movementSchema, receiptConfirmSchema, receiptScanSchema, stockProductUpdateSchema as updateSchema } from "../../../schemas/core-api.schema.js";
import { groupProductSchema } from "../../../schemas/core-api.schema.js";

const manualStockProductSchema = z.union([
  z.object({ productId: positiveInteger, quantity: nonNegativeInteger, minimalQuantity: nonNegativeInteger.optional(), expireDate: z.string().date(), batch: z.string().max(120).optional(), purchaseUnitPrice: z.number().positive().max(99999999.99).refine((value) => /^\d+(\.\d{1,2})?$/.test(String(value))).optional() }),
  groupProductSchema.extend({ quantity: nonNegativeInteger, minimalQuantity: nonNegativeInteger.optional(), expireDate: z.string().date(), batch: z.string().max(120).optional(), purchaseUnitPrice: z.number().positive().max(99999999.99).refine((value) => /^\d+(\.\d{1,2})?$/.test(String(value))).optional() }),
]);

inventoryRoute.post("/receipts/scan", async (c) => {
  const body = receiptScanSchema.parse(await c.req.json());
  return c.json(await coreApiService.scanReceipt(body, c.get("authHeaders")), 201);
});

inventoryRoute.get("/receipts/:receiptId", async (c) => {
  const receiptId = uuid.parse(c.req.param("receiptId"));
  return c.json(await coreApiService.getReceipt(receiptId, c.get("authHeaders")));
});

inventoryRoute.post("/receipts/:receiptId/confirm", async (c) => {
  const receiptId = uuid.parse(c.req.param("receiptId"));
  const body = receiptConfirmSchema.parse(await c.req.json());
  return c.json(await coreApiService.confirmReceipt(receiptId, body, c.get("authHeaders")));
});

type AuthHeaders = { Authorization: string };

async function listAllStockProducts(stockId: number, headers: AuthHeaders, filters?: {
  category?: string;
  storagePlace?: string;
  q?: string;
}): Promise<CoreStockProduct[]> {
  const pageSize = 100;
  const first = await coreApiService.listStockProducts(String(stockId), headers, 0, pageSize, filters?.category, filters?.storagePlace, filters?.q);
  const products = [...first.content];
  for (let page = 1; page < first.totalPages; page += 1) {
    const result = await coreApiService.listStockProducts(String(stockId), headers, page, pageSize, filters?.category, filters?.storagePlace, filters?.q);
    products.push(...result.content);
  }
  return products;
}

function asFilteredPage(items: CoreStockProduct[], page: number, size: number): CorePage<CoreStockProduct> {
  const start = page * size;
  const content = items.slice(start, start + size);
  return { content, totalElements: items.length, totalPages: Math.ceil(items.length / size), size, number: page };
}

inventoryRoute.get("/home", async (c) => {
  const groupId = c.req.query("groupId");
  if (groupId) uuid.parse(groupId);
  const headers = c.get("authHeaders");
  const [context, summary] = await Promise.all([
    coreApiService.getActiveContext(headers, groupId),
    coreApiService.getStockSummary(headers, groupId),
  ]);
  const stockItems = await Promise.all(context.stocks.map(async (stock) => ({
    stock,
    products: await listAllStockProducts(stock.id, headers),
  })));
  const allProducts = stockItems.flatMap(({ products }) => products);
  const categoryCounts = Object.fromEntries([...new Set(allProducts.map((item) => item.category))]
    .map((key) => [key, allProducts.filter((item) => item.category === key).length]));
  const statusCounts = {
    fresh: allProducts.filter((item) => item.productStatus === "FRESH").length,
    nearExpiration: allProducts.filter((item) => item.productStatus === "NEAR_EXPIRATION").length,
    expired: allProducts.filter((item) => item.productStatus === "EXPIRED").length,
  };
  return c.json({
    groupId: context.groupId,
    stocks: context.stocks,
    summary,
    categoryCounts,
    statusCounts,
    nearExpiration: (summary as { nearExpiration?: unknown[] }).nearExpiration ?? [],
  });
});

inventoryRoute.get("/stocks/:stockId/products", async (c) => {
  const stockId = positiveInteger.parse(c.req.param("stockId"));
  const page = c.req.query("page") === undefined ? 0 : nonNegativeInteger.parse(c.req.query("page"));
  const size = c.req.query("size") === undefined ? 30 : positiveInteger.parse(c.req.query("size"));
  const categoryFilter = c.req.query("category") ? category.parse(c.req.query("category")) : undefined;
  const placeFilter = c.req.query("storagePlace") ? storagePlace.parse(c.req.query("storagePlace")) : undefined;
  const query = c.req.query("q")?.trim().toLocaleLowerCase("pt-BR");
  const result = await coreApiService.listStockProducts(String(stockId), c.get("authHeaders"), page, size, categoryFilter, placeFilter, query);
  return c.json(result);
});

inventoryRoute.post("/stocks/:stockId/products", async (c) => {
  const stockId = positiveInteger.parse(c.req.param("stockId"));
  const groupId = c.req.query("groupId");
  if (groupId) uuid.parse(groupId);
  const input = manualStockProductSchema.parse(await c.req.json());
  const headers = c.get("authHeaders");
  const context = await coreApiService.getActiveContext(headers, groupId);
  const stock = context.stocks.find((item) => item.id === stockId);
  if (!stock) {
    throw new NotFoundException("Estoque não encontrado no grupo ativo", "Selecione um estoque do grupo ativo");
  }

  const productId = "productId" in input
    ? input.productId
    : (await coreApiService.createGroupProduct(context.groupId, {
      name: input.name,
      category: input.category,
      storagePlace: input.storagePlace,
      unitPrice: input.unitPrice,
      unitOfMeasure: input.unitOfMeasure,
      ...(input.brand === undefined ? {} : { brand: input.brand }),
      ...(input.imageUrl === undefined ? {} : { imageUrl: input.imageUrl }),
    }, headers)).id;

  const stockProduct = await coreApiService.createStockProduct({
    productId,
    stockId,
    quantity: input.quantity,
    expireDate: input.expireDate,
    ...(input.purchaseUnitPrice === undefined ? {} : { purchaseUnitPrice: input.purchaseUnitPrice }),
    ...(input.minimalQuantity === undefined ? {} : { minimalQuantity: input.minimalQuantity }),
    ...(input.batch === undefined ? {} : { batch: input.batch }),
  }, headers);
  return c.json(stockProduct, 201);
});

inventoryRoute.get("/products", async (c) => {
  const page = c.req.query("page") === undefined ? 0 : nonNegativeInteger.parse(c.req.query("page"));
  const size = c.req.query("size") === undefined ? 30 : positiveInteger.parse(c.req.query("size"));
  const categoryFilter = c.req.query("category") ? category.parse(c.req.query("category")) : undefined;
  const placeFilter = c.req.query("storagePlace") ? storagePlace.parse(c.req.query("storagePlace")) : undefined;
  const query = c.req.query("q")?.trim().toLocaleLowerCase("pt-BR");
  const groupId = c.req.query("groupId");
  if (groupId) uuid.parse(groupId);
  const headers = c.get("authHeaders");
  const context = await coreApiService.getActiveContext(headers, groupId);
  const filters = { category: categoryFilter, storagePlace: placeFilter, q: query };
  const products = (await Promise.all(context.stocks.map((stock) => listAllStockProducts(stock.id, headers, filters)))).flat();
  const filtered = products;
  return c.json(asFilteredPage(filtered, page, size));
});

inventoryRoute.get("/stock-products/:id", async (c) => {
  const id = String(positiveInteger.parse(c.req.param("id")));
  return c.json(await coreApiService.getStockProduct(id, c.get("authHeaders")));
});

inventoryRoute.put("/stock-products/:id", async (c) => {
  const id = String(positiveInteger.parse(c.req.param("id")));
  const input = updateSchema.parse(await c.req.json());
  const headers = c.get("authHeaders");
  return c.json(await coreApiService.updateStockProduct(id, input, headers));
});

inventoryRoute.delete("/stock-products/:id", async (c) => {
  await coreApiService.deleteStockProduct(String(positiveInteger.parse(c.req.param("id"))), c.get("authHeaders"));
  return c.body(null, 204);
});

inventoryRoute.get("/stock-products/:id/movements", async (c) => {
  const id = String(positiveInteger.parse(c.req.param("id")));
  const page = c.req.query("page") === undefined ? undefined : nonNegativeInteger.parse(c.req.query("page"));
  const size = c.req.query("size") === undefined ? undefined : positiveInteger.parse(c.req.query("size"));
  return c.json(await coreApiService.listMovements(id, c.get("authHeaders"), page, size));
});

inventoryRoute.post("/stock-products/:id/movements", async (c) => {
  const body = movementSchema.parse(await c.req.json());
  return c.json(await coreApiService.createMovement(
    String(positiveInteger.parse(c.req.param("id"))), body, c.get("authHeaders"),
  ), 201);
});

export { inventoryRoute };
