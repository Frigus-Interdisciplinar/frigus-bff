import { Hono } from "hono";
import { domesticService } from "../../../services/index.js";
import { authMiddleware } from "../../../middlewares/index.js";
import {
  stockCreateSchema,
  stockUpdateSchema,
  stockConsumeSchema,
  stockBatchCreateSchema,
  shoppingListItemCreateSchema,
  shoppingListItemUpdateSchema,
  notificationPreferencesSchema,
  domesticSettingsSchema,
} from "../../../schemas/index.js";

const domesticRoute = new Hono();

// Todas as rotas domésticas exigem autenticação
domesticRoute.use("*", authMiddleware);

// ==========================================
// 1. Dashboard
// ==========================================
domesticRoute.get("/dashboard", async (c) => {
  const authHeaders = c.get("authHeaders");
  const result = await domesticService.getDashboardSummary({ headers: authHeaders });
  return c.json(result);
});

// ==========================================
// 2. Estoque (Stock)
// ==========================================
domesticRoute.get("/stock", async (c) => {
  const location = c.req.query("location");
  const category = c.req.query("category");
  const search = c.req.query("search");
  const authHeaders = c.get("authHeaders");

  const result = await domesticService.listStock({ location, category, search }, { headers: authHeaders });
  return c.json(result);
});

domesticRoute.get("/stock/suggestions", async (c) => {
  const authHeaders = c.get("authHeaders");
  const result = await domesticService.getStockSuggestions({ headers: authHeaders });
  return c.json(result);
});

domesticRoute.get("/stock/:id", async (c) => {
  const id = c.req.param("id");
  const authHeaders = c.get("authHeaders");
  const result = await domesticService.getStockById(id, { headers: authHeaders });
  return c.json(result);
});

domesticRoute.post("/stock", async (c) => {
  const body = await c.req.json();
  const validData = stockCreateSchema.parse(body);
  const authHeaders = c.get("authHeaders");

  const result = await domesticService.createStockItem(validData, { headers: authHeaders });
  return c.json(result, 201);
});

domesticRoute.post("/stock/batch", async (c) => {
  const body = await c.req.json();
  const validData = stockBatchCreateSchema.parse(body);
  const authHeaders = c.get("authHeaders");

  const result = await domesticService.batchCreateStock(validData, { headers: authHeaders });
  return c.json(result, 201);
});

domesticRoute.put("/stock/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const validData = stockUpdateSchema.parse(body);
  const authHeaders = c.get("authHeaders");

  const result = await domesticService.updateStockItem(id, validData, { headers: authHeaders });
  return c.json(result);
});

domesticRoute.post("/stock/:id/consume", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const validData = stockConsumeSchema.parse(body);
  const authHeaders = c.get("authHeaders");

  const result = await domesticService.consumeStockItem(id, validData, { headers: authHeaders });
  return c.json(result);
});

domesticRoute.delete("/stock/:id", async (c) => {
  const id = c.req.param("id");
  const authHeaders = c.get("authHeaders");

  await domesticService.deleteStockItem(id, { headers: authHeaders });
  return c.body(null, 204);
});

// ==========================================
// 3. Alertas (Alerts)
// ==========================================
domesticRoute.get("/alerts", async (c) => {
  const authHeaders = c.get("authHeaders");
  const result = await domesticService.getAlertsSummary({ headers: authHeaders });
  return c.json(result);
});

domesticRoute.get("/alerts/recipes", async (c) => {
  const authHeaders = c.get("authHeaders");
  const summary = await domesticService.getAlertsSummary({ headers: authHeaders });
  return c.json(summary.recipeSuggestion || null);
});

// ==========================================
// 4. Receitas (Recipes)
// ==========================================
domesticRoute.get("/recipes", async (c) => {
  const search = c.req.query("search");
  const category = c.req.query("category");
  const onlyAvailable = c.req.query("onlyAvailable") === "true";
  const authHeaders = c.get("authHeaders");

  const result = await domesticService.listRecipes({ search, category, onlyAvailable }, { headers: authHeaders });
  return c.json(result);
});

domesticRoute.get("/recipes/suggestions", async (c) => {
  const authHeaders = c.get("authHeaders");
  const result = await domesticService.getRecipeSuggestions({ headers: authHeaders });
  return c.json(result);
});

domesticRoute.get("/recipes/:id", async (c) => {
  const id = c.req.param("id");
  const authHeaders = c.get("authHeaders");

  const result = await domesticService.getRecipeById(id, { headers: authHeaders });
  return c.json(result);
});

domesticRoute.post("/recipes/:id/favorite", async (c) => {
  const id = c.req.param("id");
  const authHeaders = c.get("authHeaders");

  const result = await domesticService.toggleRecipeFavorite(id, { headers: authHeaders });
  return c.json(result);
});

// ==========================================
// 5. Lista de Compras (Shopping List)
// ==========================================
domesticRoute.get("/shopping-list", async (c) => {
  const authHeaders = c.get("authHeaders");
  const result = await domesticService.getShoppingList({ headers: authHeaders });
  return c.json(result);
});

domesticRoute.post("/shopping-list/items", async (c) => {
  const body = await c.req.json();
  const validData = shoppingListItemCreateSchema.parse(body);
  const authHeaders = c.get("authHeaders");

  const result = await domesticService.addShoppingListItem(validData, { headers: authHeaders });
  return c.json(result, 201);
});

domesticRoute.patch("/shopping-list/items/:id/toggle", async (c) => {
  const id = c.req.param("id");
  const authHeaders = c.get("authHeaders");

  const result = await domesticService.toggleShoppingListItem(id, { headers: authHeaders });
  return c.json(result);
});

domesticRoute.put("/shopping-list/items/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const validData = shoppingListItemUpdateSchema.parse(body);
  const authHeaders = c.get("authHeaders");

  const result = await domesticService.updateShoppingListItem(id, validData, { headers: authHeaders });
  return c.json(result);
});

domesticRoute.delete("/shopping-list/items/:id", async (c) => {
  const id = c.req.param("id");
  const authHeaders = c.get("authHeaders");

  await domesticService.deleteShoppingListItem(id, { headers: authHeaders });
  return c.body(null, 204);
});

domesticRoute.delete("/shopping-list/completed", async (c) => {
  const authHeaders = c.get("authHeaders");
  await domesticService.clearCompletedShoppingList({ headers: authHeaders });
  return c.body(null, 204);
});

domesticRoute.get("/shopping-list/suggestions", async (c) => {
  const authHeaders = c.get("authHeaders");
  const result = await domesticService.getShoppingListSuggestions({ headers: authHeaders });
  return c.json(result);
});

// ==========================================
// 6. Notificações (Notifications)
// ==========================================
domesticRoute.get("/notifications", async (c) => {
  const authHeaders = c.get("authHeaders");
  const result = await domesticService.listNotifications({ headers: authHeaders });
  return c.json(result);
});

domesticRoute.patch("/notifications/read-all", async (c) => {
  const authHeaders = c.get("authHeaders");
  const result = await domesticService.markAllNotificationsRead({ headers: authHeaders });
  return c.json(result);
});

domesticRoute.patch("/notifications/:id/read", async (c) => {
  const id = c.req.param("id");
  const authHeaders = c.get("authHeaders");
  const result = await domesticService.markNotificationRead(id, { headers: authHeaders });
  return c.json(result);
});

domesticRoute.get("/notifications/preferences", async (c) => {
  const authHeaders = c.get("authHeaders");
  const result = await domesticService.getNotificationPreferences({ headers: authHeaders });
  return c.json(result);
});

domesticRoute.put("/notifications/preferences", async (c) => {
  const body = await c.req.json();
  const validData = notificationPreferencesSchema.parse(body);
  const authHeaders = c.get("authHeaders");

  const result = await domesticService.updateNotificationPreferences(validData, { headers: authHeaders });
  return c.json(result);
});

// ==========================================
// 7. Configurações da Casa (Settings)
// ==========================================
domesticRoute.get("/settings", async (c) => {
  const authHeaders = c.get("authHeaders");
  const result = await domesticService.getDomesticSettings({ headers: authHeaders });
  return c.json(result);
});

domesticRoute.put("/settings", async (c) => {
  const body = await c.req.json();
  const validData = domesticSettingsSchema.parse(body);
  const authHeaders = c.get("authHeaders");

  const result = await domesticService.updateDomesticSettings(validData, { headers: authHeaders });
  return c.json(result);
});

export { domesticRoute };
