import assert from "node:assert/strict";
import { test } from "node:test";
import { Hono } from "hono";
import { createFirebaseRoute } from "../src/channels/mobile/firebase/firebase.route.js";

const owner = "c39671e5-a166-473a-b9a2-f82ff13831d1";
const token = { uid: owner, projectId: "fixture-project", customToken: "fixture-only" };

test("Firebase session owner comes from validated Core identity, never from the body", async () => {
  let issued: string | undefined;
  const route = createFirebaseRoute(async (headers) => {
    assert.equal(headers.Authorization, "Bearer core-fixture");
    return { id: owner };
  }, async (uid) => { issued = uid; return token; });
  const app = new Hono().route("/mobile/firebase", route);
  const response = await app.request("/mobile/firebase/session", { method: "POST",
    headers: { Authorization: "Bearer core-fixture", "Content-Type": "application/json" },
    body: JSON.stringify({ uid: "someone-else" }),
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await response.json(), token);
  assert.equal(issued, owner);
});

test("missing or rejected Core authentication never mints a Firebase token", async () => {
  let issued = 0;
  const route = createFirebaseRoute(async () => { throw new Error("Invalid Core session"); }, async () => { issued++; return token; });
  const app = new Hono().route("/mobile/firebase", route);
  app.onError((_error, c) => c.json({ error: "unauthorized" }, 401));
  assert.equal((await app.request("/mobile/firebase/session", { method: "POST" })).status, 401);
  assert.equal((await app.request("/mobile/firebase/session", { method: "POST", headers: { Authorization: "Bearer invalid" } })).status, 401);
  assert.equal(issued, 0);
});

test("invalid identities and missing signing configuration cannot pretend synchronization is ready", async () => {
  let issued = 0;
  const invalid = new Hono().route("/mobile/firebase", createFirebaseRoute(async () => ({ id: "invalid" }), async () => { issued++; return token; }));
  assert.equal((await invalid.request("/mobile/firebase/session", { method: "POST", headers: { Authorization: "Bearer fixture" } })).status, 502);
  assert.equal(issued, 0);
  const unavailable = new Hono().route("/mobile/firebase", createFirebaseRoute(async () => ({ id: owner }), async () => { throw new Error("secret configuration details"); }));
  const response = await unavailable.request("/mobile/firebase/session", { method: "POST", headers: { Authorization: "Bearer fixture" } });
  assert.equal(response.status, 503);
  const body = await response.json() as { code: string; displayMessage: string };
  assert.equal(body.code, "FIREBASE_UNAVAILABLE");
  assert.ok(!JSON.stringify(body).includes("secret"));
});
