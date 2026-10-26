import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/index.js";
import { webApp, mobileApp } from "./channels/index.js";

const app = new Hono();

// configuracao de cors para permitir comunicacao com o frontend web
app.use(
  "*",
  cors({
    origin: env.WEB_ORIGINS,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
    credentials: true,
  }),
);

// middleware global de tratamento de excecoes
app.onError(errorHandler);

app.get("/health", (c) => {
  return c.json({
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (c) => {
  return c.text("Frigus BFF API");
});

// canais de acesso do bff
app.route("/web", webApp);
app.route("/mobile", mobileApp);

export { app };
