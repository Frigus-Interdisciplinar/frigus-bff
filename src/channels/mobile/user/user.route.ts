import { Hono } from "hono";
import { authService, profileService } from "../../../services/index.js";
import { loginSchema, registerSchema } from "../../../schemas/index.js";

const userRoute = new Hono();

// rota de login para mobile
userRoute.post("/login", async (c) => {
  const body = await c.req.json();
  const validData = loginSchema.parse(body);
  const result = await authService.login(validData);
  return c.json(result);
});

// rota de registro para mobile
userRoute.post("/register", async (c) => {
  const body = await c.req.json();
  const validData = registerSchema.parse(body);
  const result = await authService.register(validData);
  return c.json(result, 201);
});

// rota de perfil para mobile
userRoute.get("/profile", async (c) => {
  const authHeader = c.req.header("Authorization");
  const result = await profileService.getProfile({
    headers: authHeader ? { Authorization: authHeader } : undefined,
  });
  return c.json(result);
});

export { userRoute };
