import { Hono } from "hono";
import type { AppBindings } from "../../../config/env.js";
import { userService } from "../../../services/index.js";
import { authMiddleware } from "../../../middlewares/index.js";
import {
  adminResetPasswordSchema,
  userAccountTypeUpdateSchema,
  userRoleUpdateSchema,
} from "../../../schemas/index.js";
import { z } from "zod";

const userRoute = new Hono<AppBindings>();
const uuidSchema = z.string().uuid();
const pagingSchema = z.object({
  page: z.coerce.number().int().nonnegative().max(1_000_000).optional(),
  size: z.coerce.number().int().positive().max(100).optional(),
  sort: z.string().trim().min(1).max(120).regex(/^[A-Za-z0-9_,.:-]+$/).optional(),
});

userRoute.use("*", authMiddleware);

userRoute.get("/", async (c) => {
  const { page, size, sort } = pagingSchema.parse(c.req.query());
  const authHeaders = c.get("authHeaders");

  const result = await userService.findAll(
    {
      page,
      size,
      sort,
    },
    {
      headers: authHeaders,
    },
  );
  return c.json(result);
});

userRoute.get("/search", async (c) => {
  const emailResult = z.string().trim().email().safeParse(c.req.query("email"));
  if (!emailResult.success) {
    return c.json(
      {
        status: 400,
        code: "BAD_REQUEST",
        message: "Parametro email e obrigatorio",
        displayMessage: "Informe o email para realizar a busca",
      },
      400,
    );
  }
  const email = emailResult.data;

  const authHeaders = c.get("authHeaders");

  const result = await userService.findByEmail(email, {
    headers: authHeaders,
  });
  return c.json(result);
});

userRoute.get("/:id", async (c) => {
  const id = uuidSchema.parse(c.req.param("id"));
  const authHeaders = c.get("authHeaders");

  const result = await userService.findById(id, {
    headers: authHeaders,
  });
  return c.json(result);
});

userRoute.patch("/:id/role", async (c) => {
  const id = uuidSchema.parse(c.req.param("id"));
  const body = await c.req.json();
  const validData = userRoleUpdateSchema.parse(body);
  const authHeaders = c.get("authHeaders");

  const result = await userService.updateRole(id, validData, {
    headers: authHeaders,
  });
  return c.json(result);
});

userRoute.patch("/:id/account-type", async (c) => {
  const id = uuidSchema.parse(c.req.param("id"));
  const body = await c.req.json();
  const validData = userAccountTypeUpdateSchema.parse(body);
  const authHeaders = c.get("authHeaders");

  const result = await userService.updateAccountType(id, validData, {
    headers: authHeaders,
  });
  return c.json(result);
});

userRoute.patch("/:id/password", async (c) => {
  const id = uuidSchema.parse(c.req.param("id"));
  const body = await c.req.json();
  const validData = adminResetPasswordSchema.parse(body);
  const authHeaders = c.get("authHeaders");

  await userService.adminResetPassword(id, validData, {
    headers: authHeaders,
  });
  return c.body(null, 204);
});

userRoute.delete("/:id", async (c) => {
  const id = uuidSchema.parse(c.req.param("id"));
  const authHeaders = c.get("authHeaders");

  await userService.deleteUser(id, {
    headers: authHeaders,
  });
  return c.body(null, 204);
});

export { userRoute };
