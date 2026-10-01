import assert from "node:assert/strict";
import { app } from "../../app.js";
import {
  stockCreateSchema,
  stockBatchCreateSchema,
  stockConsumeSchema,
  shoppingListItemCreateSchema,
  shoppingListItemUpdateSchema,
  notificationPreferencesSchema,
  domesticSettingsSchema,
} from "../../schemas/index.js";
import { domesticService } from "../../services/index.js";

async function runDomesticTests() {
  console.log("🧪 Iniciando testes de validação para os endpoints domésticos...\n");

  // 1. Validar esquemas Zod
  console.log("▶ Testando esquemas Zod dos módulos domésticos...");

  // Stock create schema
  assert.doesNotThrow(() =>
    stockCreateSchema.parse({
      name: "Iogurte de Morango",
      category: "Laticínios",
      quantity: "4 un",
      location: "Geladeira",
      expireDate: "2026-09-20",
    }),
  );

  assert.throws(() =>
    stockCreateSchema.parse({
      name: "",
      category: "Laticínios",
      quantity: "",
      location: "Garagem" as any,
      expireDate: "",
    }),
  );

  // Batch create schema
  assert.doesNotThrow(() =>
    stockBatchCreateSchema.parse({
      items: [
        {
          name: "Item 1",
          category: "Mercearia",
          quantity: "1 un",
          location: "Despensa",
          expireDate: "2026-10-01",
        },
      ],
    }),
  );

  // Stock consume schema
  assert.doesNotThrow(() =>
    stockConsumeSchema.parse({
      quantity: "500 ml",
      notes: "Consumo no café da tarde",
    }),
  );

  // Shopping list create schema
  assert.doesNotThrow(() =>
    shoppingListItemCreateSchema.parse({
      name: "Café moído",
      category: "Mercearia",
      quantity: "500 g",
    }),
  );

  // Shopping list update schema
  assert.doesNotThrow(() =>
    shoppingListItemUpdateSchema.parse({
      checked: true,
      quantity: "2 pct",
    }),
  );

  // Preferences and settings schemas
  assert.doesNotThrow(() =>
    notificationPreferencesSchema.parse({
      emailNotify: true,
      browserNotify: false,
      onlyImportant: true,
    }),
  );

  assert.doesNotThrow(() =>
    domesticSettingsSchema.parse({
      theme: "dark",
      weeklySummary: true,
    }),
  );

  console.log("✔ Esquemas Zod validados com sucesso!\n");

  // 2. Validar métodos do serviço
  console.log("▶ Testando métodos do DomesticService...");
  assert.equal(typeof domesticService.getDashboardSummary, "function");
  assert.equal(typeof domesticService.listStock, "function");
  assert.equal(typeof domesticService.getStockById, "function");
  assert.equal(typeof domesticService.createStockItem, "function");
  assert.equal(typeof domesticService.batchCreateStock, "function");
  assert.equal(typeof domesticService.updateStockItem, "function");
  assert.equal(typeof domesticService.consumeStockItem, "function");
  assert.equal(typeof domesticService.deleteStockItem, "function");
  assert.equal(typeof domesticService.getAlertsSummary, "function");
  assert.equal(typeof domesticService.listRecipes, "function");
  assert.equal(typeof domesticService.getRecipeSuggestions, "function");
  assert.equal(typeof domesticService.getRecipeById, "function");
  assert.equal(typeof domesticService.toggleRecipeFavorite, "function");
  assert.equal(typeof domesticService.getShoppingList, "function");
  assert.equal(typeof domesticService.addShoppingListItem, "function");
  assert.equal(typeof domesticService.toggleShoppingListItem, "function");
  assert.equal(typeof domesticService.updateShoppingListItem, "function");
  assert.equal(typeof domesticService.deleteShoppingListItem, "function");
  assert.equal(typeof domesticService.clearCompletedShoppingList, "function");
  assert.equal(typeof domesticService.listNotifications, "function");
  assert.equal(typeof domesticService.getDomesticSettings, "function");
  assert.equal(typeof domesticService.updateDomesticSettings, "function");
  console.log("✔ Métodos do serviço verificados!\n");

  // 3. Testar endpoints HTTP via Hono app.request
  console.log("▶ Testando rotas HTTP e autenticação...");

  // Sem token -> 401 Unauthorized
  const unauthRes = await app.request("/web/domestic/dashboard");
  assert.equal(unauthRes.status, 401);

  const authHeaders = {
    Authorization: "Bearer mock-test-token",
    "Content-Type": "application/json",
  };

  // Dashboard
  const dashRes = await app.request("/web/domestic/dashboard", { headers: authHeaders });
  assert.equal(dashRes.status, 200);
  const dashData = (await dashRes.json()) as any;
  assert.ok(dashData.hero);
  assert.ok(dashData.distribution);
  assert.ok(dashData.weeklyConsumption);
  assert.ok(Array.isArray(dashData.itemsToUseFirst));

  // Listar Estoque
  const stockRes = await app.request("/web/domestic/stock?location=Geladeira", { headers: authHeaders });
  assert.equal(stockRes.status, 200);
  const stockData = (await stockRes.json()) as any;
  assert.ok(Array.isArray(stockData));
  assert.ok(stockData.every((i: any) => i.location === "Geladeira"));

  // Obter item de estoque por ID
  const itemRes = await app.request("/web/domestic/stock/1", { headers: authHeaders });
  assert.equal(itemRes.status, 200);
  const itemData = (await itemRes.json()) as any;
  assert.equal(itemData.id, "1");
  assert.ok(Array.isArray(itemData.movements));

  // Criar alimento no estoque
  const createStockRes = await app.request("/web/domestic/stock", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Queijo Minas",
      category: "Laticínios",
      quantity: "500 g",
      location: "Geladeira",
      expireDate: "2026-09-30",
    }),
  });
  assert.equal(createStockRes.status, 201);
  const createdItem = (await createStockRes.json()) as any;
  assert.equal(createdItem.name, "Queijo Minas");

  // Consumir item do estoque
  const consumeRes = await app.request(`/web/domestic/stock/${createdItem.id}/consume`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      quantity: "200 g",
      notes: "Lanche",
    }),
  });
  assert.equal(consumeRes.status, 200);

  // Alertas
  const alertsRes = await app.request("/web/domestic/alerts", { headers: authHeaders });
  assert.equal(alertsRes.status, 200);
  const alertsData = (await alertsRes.json()) as any;
  assert.ok(alertsData.totalActiveAlerts > 0);
  assert.ok(Array.isArray(alertsData.items));

  // Receitas
  const recipesRes = await app.request("/web/domestic/recipes", { headers: authHeaders });
  assert.equal(recipesRes.status, 200);
  const recipesData = (await recipesRes.json()) as any;
  assert.ok(Array.isArray(recipesData));

  // Detalhes da Receita
  const recipeDetailRes = await app.request("/web/domestic/recipes/1", { headers: authHeaders });
  assert.equal(recipeDetailRes.status, 200);
  const recipeDetailData = (await recipeDetailRes.json()) as any;
  assert.ok(recipeDetailData.ingredients.length > 0);
  assert.ok(recipeDetailData.instructions.length > 0);

  // Lista de compras
  const shopRes = await app.request("/web/domestic/shopping-list", { headers: authHeaders });
  assert.equal(shopRes.status, 200);
  const shopData = (await shopRes.json()) as any;
  assert.ok(Array.isArray(shopData.pendingItems));
  assert.ok(Array.isArray(shopData.completedItems));

  // Adicionar item na lista de compras
  const addShopRes = await app.request("/web/domestic/shopping-list/items", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Maçã Gala",
      category: "Hortifruti",
      quantity: "1 kg",
    }),
  });
  assert.equal(addShopRes.status, 201);
  const addedShopItem = (await addShopRes.json()) as any;
  assert.equal(addedShopItem.name, "Maçã Gala");

  // Alternar checkbox de item na lista de compras
  const toggleRes = await app.request(`/web/domestic/shopping-list/items/${addedShopItem.id}/toggle`, {
    method: "PATCH",
    headers: authHeaders,
  });
  assert.equal(toggleRes.status, 200);
  const toggledItem = (await toggleRes.json()) as any;
  assert.equal(toggledItem.checked, true);

  // Notificações
  const notifRes = await app.request("/web/domestic/notifications", { headers: authHeaders });
  assert.equal(notifRes.status, 200);
  const notifData = (await notifRes.json()) as any;
  assert.ok(Array.isArray(notifData.notifications));

  // Configurações
  const settingsRes = await app.request("/web/domestic/settings", { headers: authHeaders });
  assert.equal(settingsRes.status, 200);
  const settingsData = (await settingsRes.json()) as any;
  assert.ok(typeof settingsData.expiryReminder === "boolean");

  console.log("✔ Rotas HTTP e autenticação testadas com sucesso!\n");
  console.log("🎉 TODOS OS TESTES DOS ENDPOINTS DOMÉSTICOS PASSARAM COM SUCESSO!");
}

runDomesticTests().catch((err) => {
  console.error("❌ Falha nos testes:", err);
  process.exit(1);
});
