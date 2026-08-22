import { Hono } from "hono";
import { errorHandler } from "./middlewares/index.js";
import { webApp, mobileApp } from "./channels/index.js";

const app = new Hono();

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
