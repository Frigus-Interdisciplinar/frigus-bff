import { Hono } from "hono";
import { cors } from "hono/cors";
import { errorHandler } from "./middlewares/index.js";
import { webApp, mobileApp } from "./channels/index.js";

const app = new Hono();

// configuracao de cors para permitir comunicacao com o frontend web
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
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
