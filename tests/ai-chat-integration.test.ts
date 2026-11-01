import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Hono } from "hono";
import { recipesRoute } from "../src/channels/mobile/recipes/recipes.route.js";
import { aiRecipeChatSchema } from "../src/schemas/core-api.schema.js";
import { axiosInstance } from "../src/utils/axios-instance.js";

const originalAdapter = axiosInstance.defaults.adapter;
afterEach(() => { axiosInstance.defaults.adapter = originalAdapter; });

test("mobile forwards dietary preferences and stock through one authenticated Core request", async () => {
  let calls = 0;
  const body = { message: "O que cozinhar?", stockId: 42, sessionId: "conversa", foodPreferences: ["VEGAN", "QUICK_RECIPES"] };
  axiosInstance.defaults.adapter = async (config) => {
    calls++;
    assert.equal(config.url, "/ai/recipes/chat");
    assert.equal(config.method, "post");
    assert.equal(config.headers.Authorization, "Bearer fixture");
    assert.equal(config.timeout, 120_000);
    assert.deepEqual(JSON.parse(config.data as string), body);
    return { config, status: 200, statusText: "OK", headers: {}, data: { sessionId: "conversa", chatMessage: "Receita real", recipeIds: [7] } };
  };
  const app = new Hono().route("/mobile/recipes", recipesRoute);
  const response = await app.request("/mobile/recipes/ai/chat", {
    method: "POST", headers: { Authorization: "Bearer fixture", "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).recipeIds, [7]);
  assert.equal(calls, 1);
});

test("dietary preference identifiers are bounded and validated", () => {
  assert.equal(aiRecipeChatSchema.safeParse({ message: "oi", stockId: 42, foodPreferences: ["INVENTADA"] }).success, false);
  assert.equal(aiRecipeChatSchema.safeParse({ message: "oi", stockId: 42, foodPreferences: Array(10).fill("VEGAN") }).success, false);
  assert.equal(aiRecipeChatSchema.safeParse({ message: "oi", stockId: 42, foodPreferences: [] }).success, true);
});
