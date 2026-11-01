import { Hono } from "hono";
import { z } from "zod";
import { profilePictureService, profileService } from "../../../services/index.js";
import { authMiddleware } from "../../../middlewares/index.js";
import {
  changePasswordSchema,
  userAccountTypeUpdateSchema,
  userPatchSchema,
  userPutSchema,
} from "../../../schemas/index.js";

const profileRoute = new Hono();
const profilePictureUploadSchema = z.object({ contentType: z.enum(["image/png", "image/jpeg"]) });

// todas as rotas de perfil exigem autenticacao
profileRoute.use("*", authMiddleware);

// obter dados do perfil do usuario logado
profileRoute.get("/", async (c) => {
  const authHeaders = c.get("authHeaders");
  const result = await profileService.getProfile({
    headers: authHeaders,
  });
  return c.json(result);
});

profileRoute.patch("/onboarding/account-type", async (c) => {
  const body = await c.req.json();
  const validData = userAccountTypeUpdateSchema.parse(body);
  const authHeaders = c.get("authHeaders");
  const result = await profileService.updateOnboardingAccountType(validData, {
    headers: authHeaders,
  });
  return c.json(result);
});

// Retorna um upload assinado para o browser enviar a imagem diretamente ao Storage.
profileRoute.post("/picture-upload", async (c) => {
  const authHeaders = c.get("authHeaders");
  const user = await profileService.getProfile({ headers: authHeaders });
  const request = profilePictureUploadSchema.parse(await c.req.json());
  return c.json(await profilePictureService.createUpload(user, request.contentType));
});

// atualizacao completa do perfil
profileRoute.put("/", async (c) => {
  const body = await c.req.json();
  const validData = userPutSchema.parse(body);
  const authHeaders = c.get("authHeaders");
  const result = await profileService.updateProfile(validData, {
    headers: authHeaders,
  });
  return c.json(result);
});

// atualizacao parcial do perfil
profileRoute.patch("/", async (c) => {
  const body = await c.req.json();
  const validData = userPatchSchema.parse(body);
  const authHeaders = c.get("authHeaders");
  const result = await profileService.patchProfile(validData, {
    headers: authHeaders,
  });
  return c.json(result);
});

// alteracao de senha
profileRoute.patch("/password", async (c) => {
  const body = await c.req.json();
  const validData = changePasswordSchema.parse(body);
  const authHeaders = c.get("authHeaders");
  await profileService.changePassword(validData, {
    headers: authHeaders,
  });
  return c.body(null, 204);
});

// deletar conta do usuario logado
profileRoute.delete("/", async (c) => {
  const authHeaders = c.get("authHeaders");
  await profileService.deleteCurrentUser({
    headers: authHeaders,
  });
  return c.body(null, 204);
});

export { profileRoute };
