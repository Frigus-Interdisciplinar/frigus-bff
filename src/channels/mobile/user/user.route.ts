import { Hono } from "hono";
import type { AppBindings } from "../../../config/env.js";
import { authService, profileService } from "../../../services/index.js";
import { authMiddleware } from "../../../middlewares/index.js";
import { loginSchema, registerSchema } from "../../../schemas/index.js";

const userRoute = new Hono<AppBindings>();

userRoute.post("/login", async (c) => {
  const body = await c.req.json();
  const validData = loginSchema.parse(body);
  const userAgent = c.req.header("User-Agent");
  const result = await authService.login(
    validData,
    userAgent ? { headers: { "User-Agent": userAgent } } : undefined,
  );
  return c.json(result);
});

userRoute.post("/register", async (c) => {
  const body = await c.req.json();
  const validData = registerSchema.parse(body);
  const result = await authService.register(validData);
  return c.json(result, 201);
});

userRoute.get("/profile", authMiddleware, async (c) => {
  const authHeaders = c.get("authHeaders");
  const result = await profileService.getProfile({
    headers: authHeaders,
  });
  return c.json(result);
});

export { userRoute };
