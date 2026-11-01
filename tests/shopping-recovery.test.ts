import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Hono } from "hono";
import type { InternalAxiosRequestConfig } from "axios";
import { axiosInstance } from "../src/utils/axios-instance.js";
import { inventoryRoute } from "../src/channels/mobile/inventory/inventory.route.js";
import { shoppingListRoute } from "../src/channels/mobile/shopping-list/shopping-list.route.js";

const originalAdapter = axiosInstance.defaults.adapter;
afterEach(() => { axiosInstance.defaults.adapter = originalAdapter; });
const groupId = "c39671e5-a166-473a-b9a2-f82ff13831d1";
const listId = "d9c3ce6c-769a-475b-8b8d-e2842c3f6117";
const body = { productId: 7, quantity: 2, expireDate: "2026-12-31" };

function reply(config: InternalAxiosRequestConfig, data: unknown, status = 200) {
  return { config, data, status, statusText: "OK", headers: {} };
}

test("shopping update preserves the published mobile PATCH while forwarding Core PUT", async () => {
  let calls = 0;
  axiosInstance.defaults.adapter = async (config) => {
    calls += 1;
    assert.equal(config.method, "put");
    assert.equal(config.url, `/shopping-lists/${listId}/items/12`);
    assert.deepEqual(JSON.parse(config.data as string), { status: "PURCHASED" });
    return reply(config, { id: 12, status: "PURCHASED" });
  };
  const app = new Hono().route("/mobile/shopping-list", shoppingListRoute);
  const response = await app.request(`/mobile/shopping-list/${listId}/items/12`, {
    method: "PATCH", headers: { Authorization: "Bearer fixture", "Content-Type": "application/json" },
    body: JSON.stringify({ status: "PURCHASED" }),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { id: 12, status: "PURCHASED" });
  assert.equal(calls, 1);
});

test("manual lot uses the explicitly selected authorized group and the inferred stock", async () => {
  const calls: string[] = [];
  axiosInstance.defaults.adapter = async (config) => {
    calls.push(`${config.method} ${config.url}`);
    if (config.url === "/stocks/active-context") {
      assert.equal(config.params.groupId, groupId);
      return reply(config, { groupId, stocks: [{ id: 42, groupId, name: "Grupo selecionado" }] });
    }
    assert.equal(config.url, "/stock-products");
    assert.equal(config.method, "post");
    assert.deepEqual(JSON.parse(config.data as string), { ...body, stockId: 42 });
    return reply(config, { id: 91, ...body, stockId: 42 }, 201);
  };
  const app = new Hono().route("/mobile/inventory", inventoryRoute);
  const response = await app.request(`/mobile/inventory/stocks/42/products?groupId=${groupId}`, {
    method: "POST", headers: { Authorization: "Bearer fixture", "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  assert.equal(response.status, 201);
  assert.equal((await response.json()).id, 91);
  assert.deepEqual(calls, ["get /stocks/active-context", "post /stock-products"]);
});

test("invalid group or a stock outside that group never sends a lot mutation", async () => {
  let reads = 0;
  axiosInstance.defaults.adapter = async (config) => {
    reads += 1;
    assert.equal(config.method, "get");
    assert.equal(config.url, "/stocks/active-context");
    return reply(config, { groupId, stocks: [{ id: 8, groupId, name: "Outro estoque" }] });
  };
  const app = new Hono().route("/mobile/inventory", inventoryRoute);
  app.onError((_error, context) => context.json({ error: "rejected" }, 400));
  const send = (group: string) => app.request(`/mobile/inventory/stocks/42/products?groupId=${group}`, {
    method: "POST", headers: { Authorization: "Bearer fixture", "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  assert.equal((await send("invalid")).status, 400);
  assert.equal(reads, 0);
  assert.equal((await send(groupId)).status, 400);
  assert.equal(reads, 1);
});

test("confirmed purchase unit price reaches Core without a catalog price fallback", async () => {
  const priced = { ...body, purchaseUnitPrice: 7.9 };
  let writes = 0;
  axiosInstance.defaults.adapter = async (config) => {
    if (config.url === "/stocks/active-context") return reply(config, { groupId, stocks: [{ id: 42, groupId }] });
    writes += 1;
    assert.equal(config.url, "/stock-products");
    assert.deepEqual(JSON.parse(config.data as string), { ...priced, stockId: 42 });
    return reply(config, { id: 91, ...priced, stockId: 42 }, 201);
  };
  const app = new Hono().route("/mobile/inventory", inventoryRoute);
  const response = await app.request(`/mobile/inventory/stocks/42/products?groupId=${groupId}`, {
    method: "POST", headers: { Authorization: "Bearer fixture", "Content-Type": "application/json" },
    body: JSON.stringify(priced),
  });
  assert.equal(response.status, 201);
  assert.equal((await response.json()).purchaseUnitPrice, 7.9);
  assert.equal(writes, 1);
});

test("invalid purchase prices are rejected before reading context or sending a mutation", async () => {
  let calls = 0;
  axiosInstance.defaults.adapter = async () => { calls++; throw new Error("No upstream request expected"); };
  const app = new Hono().route("/mobile/inventory", inventoryRoute);
  app.onError((_error, context) => context.json({ error: "rejected" }, 400));
  for (const price of [0, -1, 1.234, 100000000, null]) {
    const response = await app.request(`/mobile/inventory/stocks/42/products?groupId=${groupId}`, {
      method: "POST", headers: { Authorization: "Bearer fixture", "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, purchaseUnitPrice: price }),
    });
    assert.equal(response.status, 400);
  }
  assert.equal(calls, 0);
});
