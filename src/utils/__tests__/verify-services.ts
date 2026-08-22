import assert from "node:assert/strict";
import {
  authService,
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

async function runServiceTests() {
  console.log("🧪 Starting validation tests for Core API integration...\n");

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
      paymentMethod: "INVALID" as any,
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
  const healthRes = await app.request("/health");
  assert.equal(healthRes.status, 200);
  const healthJson = (await healthRes.json()) as any;
  assert.equal(healthJson.status, "UP");

  // Root
  const rootRes = await app.request("/");
  assert.equal(rootRes.status, 200);

  // Web Auth invalid input should return 400 with field errors
  const invalidLoginRes = await app.request("/web/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "invalid", rawPassword: "" }),
  });
  assert.equal(invalidLoginRes.status, 400);
  const invalidLoginJson = (await invalidLoginRes.json()) as any;
  assert.equal(invalidLoginJson.code, "BAD_REQUEST");
  assert.ok(invalidLoginJson.fields && invalidLoginJson.fields.length > 0);

  // Web Transaction invalid checkout
  const invalidCheckoutRes = await app.request("/web/transactions/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planCode: "", paymentMethod: "INVALID" }),
  });
  assert.equal(invalidCheckoutRes.status, 400);

  // Mobile Auth invalid input
  const mobileLoginRes = await app.request("/mobile/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "not-an-email" }),
  });
  assert.equal(mobileLoginRes.status, 400);

  console.log("✔ Hono routes and error handler verified!\n");
  console.log("🎉 ALL CORE API INTEGRATION TESTS PASSED SUCCESSFULLY!");
}

runServiceTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
