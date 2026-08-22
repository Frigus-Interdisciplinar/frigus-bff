import { Hono } from "hono";
import { profileService } from "../../../services/index.js";
import {
  changePasswordSchema,
  userPatchSchema,
  userPutSchema,
} from "../../../schemas/index.js";

const profileRoute = new Hono();

// obter dados do perfil do usuario logado
profileRoute.get("/", async (c) => {
  const authHeader = c.req.header("Authorization");
  const cookieHeader = c.req.header("Cookie");
  const result = await profileService.getProfile({
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });
  return c.json(result);
});

// atualizacao completa do perfil
profileRoute.put("/", async (c) => {
  const body = await c.req.json();
  const validData = userPutSchema.parse(body);
  const authHeader = c.req.header("Authorization");
  const cookieHeader = c.req.header("Cookie");
  const result = await profileService.updateProfile(validData, {
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });
  return c.json(result);
});

// atualizacao parcial do perfil
profileRoute.patch("/", async (c) => {
  const body = await c.req.json();
  const validData = userPatchSchema.parse(body);
  const authHeader = c.req.header("Authorization");
  const cookieHeader = c.req.header("Cookie");
  const result = await profileService.patchProfile(validData, {
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });
  return c.json(result);
});

// alteracao de senha
profileRoute.patch("/password", async (c) => {
  const body = await c.req.json();
  const validData = changePasswordSchema.parse(body);
  const authHeader = c.req.header("Authorization");
  const cookieHeader = c.req.header("Cookie");
  await profileService.changePassword(validData, {
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });
  return c.body(null, 204);
});

// deletar conta do usuario logado
profileRoute.delete("/", async (c) => {
  const authHeader = c.req.header("Authorization");
  const cookieHeader = c.req.header("Cookie");
  await profileService.deleteCurrentUser({
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });
  return c.body(null, 204);
});

export { profileRoute };
