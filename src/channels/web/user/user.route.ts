import { Hono } from "hono";
import { userService } from "../../../services/index.js";
import { authMiddleware } from "../../../middlewares/index.js";
import {
  adminResetPasswordSchema,
  userAccountTypeUpdateSchema,
  userRoleUpdateSchema,
} from "../../../schemas/index.js";

const userRoute = new Hono();

// todas as rotas administrativas exigem autenticacao
userRoute.use("*", authMiddleware);

// listar usuarios paginados (admin)
userRoute.get("/", async (c) => {
  const page = c.req.query("page");
  const size = c.req.query("size");
  const sort = c.req.query("sort");
  const authHeaders = c.get("authHeaders");

  const result = await userService.findAll(
    {
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
      sort,
    },
    {
      headers: authHeaders,
    },
  );
  return c.json(result);
});

// buscar usuario por email (admin)
userRoute.get("/search", async (c) => {
  const email = c.req.query("email");
  if (!email) {
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

  const authHeaders = c.get("authHeaders");

  const result = await userService.findByEmail(email, {
    headers: authHeaders,
  });
  return c.json(result);
});

// buscar usuario por id (admin)
userRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const authHeaders = c.get("authHeaders");

  const result = await userService.findById(id, {
    headers: authHeaders,
  });
  return c.json(result);
});

// atualizar role do usuario (admin)
userRoute.patch("/:id/role", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const validData = userRoleUpdateSchema.parse(body);
  const authHeaders = c.get("authHeaders");

  const result = await userService.updateRole(id, validData, {
    headers: authHeaders,
  });
  return c.json(result);
});

// atualizar tipo de conta do usuario (admin)
userRoute.patch("/:id/account-type", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const validData = userAccountTypeUpdateSchema.parse(body);
  const authHeaders = c.get("authHeaders");

  const result = await userService.updateAccountType(id, validData, {
    headers: authHeaders,
  });
  return c.json(result);
});

// reset de senha por admin
userRoute.patch("/:id/password", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const validData = adminResetPasswordSchema.parse(body);
  const authHeaders = c.get("authHeaders");

  await userService.adminResetPassword(id, validData, {
    headers: authHeaders,
  });
  return c.body(null, 204);
});

// deletar usuario por id (admin)
userRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const authHeaders = c.get("authHeaders");

  await userService.deleteUser(id, {
    headers: authHeaders,
  });
  return c.body(null, 204);
});

export { userRoute };
