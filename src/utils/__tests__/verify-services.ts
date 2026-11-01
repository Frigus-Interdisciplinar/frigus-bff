import assert from "node:assert/strict";
import {
  authService,
  coreApiService,
  profileService,
  userService,
  transactionService,
} from "../../services/index.js";
import {
  loginSchema,
  registerSchema,
  userPutSchema,
  userPatchSchema,
  changePasswordSchema,
  checkoutSchema,
} from "../../schemas/index.js";
import { app } from "../../app.js";
import { z } from "zod";
import { envSchema } from "../../config/env.js";
import { coreGroupSchema, coreStockSummarySchema } from "../../schemas/core-api-response.schema.js";

async function runServiceTests() {
  console.log("🧪 Starting validation tests for Core API integration...\n");

  assert.equal(envSchema.safeParse({ WEB_ORIGINS: "*" }).success, false);
  assert.equal(envSchema.safeParse({ WEB_ORIGINS: "https://example.com/path" }).success, false);
  assert.equal(envSchema.safeParse({ WEB_ORIGINS: "https://example.com" }).success, true);
  const validatedGroup = coreGroupSchema.parse({
    id: "11111111-1111-4111-8111-111111111111",
    name: "Grupo",
    bannerPicture: "https://example.com/group.png",
    ownerId: "22222222-2222-4222-8222-222222222222",
    ownerName: "Proprietário",
    isOwner: false,
    membersCount: 1,
    members: [{
      userId: "33333333-3333-4333-8333-333333333333",
      name: "Membro",
      email: "member@example.com",
      isOwner: false,
      memberRole: "EDITOR",
    }],
  });
  assert.equal(validatedGroup.bannerPicture, "https://example.com/group.png");
  assert.equal(validatedGroup.members[0]?.memberRole, "EDITOR");
  assert.equal("role" in (validatedGroup.members[0] ?? {}), false);

  const validatedSummary = coreStockSummarySchema.parse({
    groupId: "22222222-2222-4222-8222-222222222222",
    stockCount: 1,
    productCount: 1,
    itemCount: 1,
    estimatedValue: 15,
    pendingShoppingItems: 0,
    quantitiesByUnit: { LITER: 2 },
    itemsByStoragePlace: { FRIDGE: 1 },
    consumedThisWeek: {},
    weekStart: "2026-10-19",
    nearExpiration: [],
    internalDebug: "discarded",
  });
  assert.equal("internalDebug" in validatedSummary, false);

  // 1. Test Zod Schemas
  console.log("▶ Testing Zod Schemas...");

  // Login schema
  assert.doesNotThrow(() =>
    loginSchema.parse({
      email: "user@frigus.com",
      rawPassword: "Password123!",
    }),
  );
  assert.throws(() =>
    loginSchema.parse({
      email: "invalid-email",
      rawPassword: "",
    }),
  );

  // Register schema
  assert.doesNotThrow(() =>
    registerSchema.parse({
      name: "Gabriel Teste",
      birthDate: "15/05/1998",
      email: "gabriel@frigus.com",
      rawPassword: "Password123!",
    }),
  );
  assert.throws(() =>
    registerSchema.parse({
      name: "",
      birthDate: "1998-05-15", // wrong format
      email: "invalid-email",
      rawPassword: "short",
    }),
  );

  // User schemas
  assert.doesNotThrow(() =>
    userPutSchema.parse({
      name: "Nome Atualizado",
      birthDate: "20/10/1995",
    }),
  );

  assert.doesNotThrow(() =>
    userPatchSchema.parse({
      name: "Nome Parcial",
    }),
  );

  assert.doesNotThrow(() =>
    changePasswordSchema.parse({
      oldPassword: "OldPassword123!",
      newPassword: "NewPassword123!",
    }),
  );

  // Checkout schema
  assert.doesNotThrow(() =>
    checkoutSchema.parse({
      planCode: "PLUS",
      paymentMethod: "CREDIT_CARD",
      fakeCardLast4: "1234",
    }),
  );
  assert.doesNotThrow(() =>
    checkoutSchema.parse({
      planCode: "FREE",
      paymentMethod: "PIX",
      fakePixKey: "12345678901",
    }),
  );
  assert.throws(() =>
    checkoutSchema.parse({
      planCode: "",
      paymentMethod: "INVALID",
    }),
  );
  console.log("✔ Zod schemas passed!\n");

  // 2. Test Services Definition and Signatures
  console.log("▶ Testing Services signatures...");
  assert.equal(typeof authService.register, "function");
  assert.equal(typeof authService.login, "function");
  assert.equal(typeof authService.refreshToken, "function");
  assert.equal(typeof authService.logout, "function");

  assert.equal(typeof profileService.getProfile, "function");
  assert.equal(typeof profileService.updateProfile, "function");
  assert.equal(typeof profileService.patchProfile, "function");
  assert.equal(typeof profileService.changePassword, "function");
  assert.equal(typeof profileService.deleteCurrentUser, "function");

  assert.equal(typeof userService.findAll, "function");
  assert.equal(typeof userService.findById, "function");
  assert.equal(typeof userService.findByEmail, "function");
  assert.equal(typeof userService.updateRole, "function");
  assert.equal(typeof userService.updateAccountType, "function");
  assert.equal(typeof userService.adminResetPassword, "function");
  assert.equal(typeof userService.deleteUser, "function");

  assert.equal(typeof transactionService.checkout, "function");
  assert.equal(typeof transactionService.listTransactions, "function");
  assert.equal(typeof transactionService.getTransactionById, "function");
  assert.equal(typeof transactionService.cancelTransaction, "function");
  console.log("✔ Services methods verified!\n");

  // 3. Test Hono App Route Endpoints Routing & Validation
  console.log("▶ Testing Hono Routes & Validation...");

  // Health check
  const healthRes = await app.request("/health", { headers: { Origin: "http://localhost:5173" } });
  assert.equal(healthRes.status, 200);
  const healthJson = z.object({ status: z.string() }).parse(await healthRes.json());
  assert.equal(healthJson.status, "UP");
  assert.equal(healthRes.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(healthRes.headers.get("X-Frame-Options"), "DENY");
  assert.ok(healthRes.headers.get("Content-Security-Policy")?.includes("frame-ancestors 'none'"));
  assert.ok(healthRes.headers.get("X-Correlation-ID"));
  assert.equal(healthRes.headers.get("Access-Control-Allow-Origin"), "http://localhost:5173");

  const oversizedBody = await app.request("/missing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "x".repeat(1_048_577),
  });
  assert.equal(oversizedBody.status, 413);

  // Root
  const rootRes = await app.request("/");
  assert.equal(rootRes.status, 200);

  // Web Auth invalid input should return 400 with field errors
  const invalidLoginRes = await app.request("/web/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: JSON.stringify({ email: "invalid", rawPassword: "" }),
  });
  assert.equal(invalidLoginRes.status, 400);
  const invalidLoginJson = z.object({ code: z.string(), fields: z.array(z.unknown()).optional() }).parse(await invalidLoginRes.json());
  assert.equal(invalidLoginJson.code, "BAD_REQUEST");
  assert.ok(invalidLoginJson.fields && invalidLoginJson.fields.length > 0);

  const untrustedOriginRes = await app.request("/web/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://attacker.example" },
    body: JSON.stringify({ email: "bad", rawPassword: "bad" }),
  });
  assert.equal(untrustedOriginRes.status, 403);

  // Test authMiddleware: unauthenticated request to protected route should return 401
  const unauthCheckoutRes = await app.request("/web/transactions/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: JSON.stringify({ planCode: "PLUS", paymentMethod: "PIX" }),
  });
  assert.equal(unauthCheckoutRes.status, 401);
  const unauthJson = z.object({ code: z.string() }).parse(await unauthCheckoutRes.json());
  assert.equal(unauthJson.code, "UNAUTHORIZED");

  // Test authMiddleware with token present but invalid body -> should pass middleware and fail on validation with 400
  const invalidCheckoutWithTokenRes = await app.request(
    "/web/transactions/checkout",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:5173",
        Authorization: "Bearer mock-token",
      },
      body: JSON.stringify({ planCode: "", paymentMethod: "INVALID" }),
    },
  );
  assert.equal(invalidCheckoutWithTokenRes.status, 400);

  // Mobile Auth invalid input
  const mobileLoginRes = await app.request("/mobile/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "not-an-email" }),
  });
  assert.equal(mobileLoginRes.status, 400);

  // Mobile Profile without token -> 401
  const mobileUnauthProfileRes = await app.request("/mobile/user/profile");
  assert.equal(mobileUnauthProfileRes.status, 401);
  const mobileUnauthProxyRes = await app.request("/mobile/core/profile/sessions");
  assert.equal(mobileUnauthProxyRes.status, 401);
  const invalidProxyJsonRes = await app.request("/mobile/core/profile/app-settings", {
    method: "PUT",
    headers: { Authorization: "Bearer mock-token", "Content-Type": "application/json" },
    body: "{ invalid",
  });
  assert.equal(invalidProxyJsonRes.status, 400);
  const originalForwardRequest = coreApiService.forwardRequest;
  coreApiService.forwardRequest = async () => ({
    data: JSON.stringify({ accessToken: "google-access-token" }),
    status: 200,
    statusText: "OK",
    headers: { "content-type": "application/json" },
    config: {},
  } as Awaited<ReturnType<typeof coreApiService.forwardRequest>>);
  try {
    const googleLoginRes = await app.request("/mobile/core/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "google-id-token" }),
    });
    assert.equal(googleLoginRes.status, 200);
    assert.equal((await googleLoginRes.json()).accessToken, "google-access-token");
  } finally {
    coreApiService.forwardRequest = originalForwardRequest;
  }
  const unsupportedProxyBodyRes = await app.request("/mobile/core/profile/app-settings", {
    method: "PUT",
    headers: { Authorization: "Bearer mock-token", "Content-Type": "text/plain" },
    body: "unexpected",
  });
  assert.equal(unsupportedProxyBodyRes.status, 415);
  const invalidGroupFilterRes = await app.request("/web/core/inventory/active-context?groupId=invalid", {
    headers: { Authorization: "Bearer mock-token" },
  });
  assert.equal(invalidGroupFilterRes.status, 400);
  const invalidProductPageRes = await app.request("/web/plans/catalog/products?page=-1");
  assert.equal(invalidProductPageRes.status, 400);

  const limitedResponses = await Promise.all(Array.from({ length: 11 }, () => app.request("/web/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: JSON.stringify({ email: "bad" }),
  })));
  assert.equal(limitedResponses.at(-1)?.status, 429);
  assert.ok(limitedResponses.at(-1)?.headers.get("Retry-After"));

  console.log("✔ Hono routes, authMiddleware and error handler verified!\n");
  console.log("🎉 ALL CORE API INTEGRATION TESTS PASSED SUCCESSFULLY!");
}

runServiceTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
