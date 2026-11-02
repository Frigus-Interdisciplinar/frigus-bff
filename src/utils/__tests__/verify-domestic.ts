import assert from "node:assert/strict";
import { z } from "zod";
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

async function runDomesticTests() {
  assert.doesNotThrow(() => stockCreateSchema.parse({
    name: "Iogurte de Morango",
    category: "Laticínios",
    quantity: "4 un",
    location: "Geladeira",
    expireDate: "2026-09-20",
  }));
  assert.throws(() => stockCreateSchema.parse({
    name: "",
    category: "Laticínios",
    quantity: "",
    location: "Garagem",
    expireDate: "",
  }));
  assert.doesNotThrow(() => stockBatchCreateSchema.parse({
    items: [{
      name: "Item 1",
      category: "Mercearia",
      quantity: "1 un",
      location: "Despensa",
      expireDate: "2026-10-01",
    }],
  }));
  assert.doesNotThrow(() => stockConsumeSchema.parse({ quantity: "500 ml", notes: "Consumo" }));
  assert.doesNotThrow(() => shoppingListItemCreateSchema.parse({ name: "Café", quantity: "500 g" }));
  assert.doesNotThrow(() => shoppingListItemUpdateSchema.parse({ checked: true }));
  assert.doesNotThrow(() => notificationPreferencesSchema.parse({ emailNotify: true }));
  assert.doesNotThrow(() => domesticSettingsSchema.parse({ theme: "dark" }));

  const response = await app.request("/web/domestic/dashboard");
  assert.equal(response.status, 501);
  const body = z.object({
    code: z.string(),
    message: z.string(),
  }).parse(await response.json());
  assert.equal(body.code, "CORE_API_CONTRACT_REQUIRED");
  assert.ok(body.message.includes("core-api"));
}

runDomesticTests().catch((error: unknown) => {
  console.error("Domestic contract checks failed", error);
  process.exit(1);
});
