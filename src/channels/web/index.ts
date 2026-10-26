import { Hono } from "hono";
import { authRoute } from "./auth/auth.route.js";
import { profileRoute } from "./profile/profile.route.js";
import { transactionRoute } from "./transaction/transaction.route.js";
import { userRoute } from "./user/user.route.js";
import { coreRoute } from "./core/core.route.js";
import { planRoute } from "./plan/plan.route.js";

import { domesticRoute } from "./domestic/domestic.route.js";
import { env } from "../../config/env.js";
import { ForbiddenException } from "../../exceptions/index.js";

const webApp = new Hono();

// Browser requests authenticated with cookies must originate from a trusted web origin.
webApp.use("*", async (c, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(c.req.method.toUpperCase())) return next();

  const origin = c.req.header("Origin");
  if (!origin || !env.WEB_ORIGINS.includes(origin)) {
    throw new ForbiddenException("Origem não autorizada", "Origem da requisição não autorizada");
  }

  await next();
});

webApp.route("/auth", authRoute);
webApp.route("/profile", profileRoute);
webApp.route("/transactions", transactionRoute);
webApp.route("/user", userRoute);
webApp.route("/domestic", domesticRoute);
webApp.route("/core", coreRoute);
webApp.route("/plans", planRoute);

export { webApp };
