import { Hono } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";
import { env } from "./config/env.js";
import type { AppBindings } from "./config/env.js";
import { errorHandler } from "./middlewares/index.js";
import { requestContextMiddleware } from "./middlewares/request-context.middleware.js";
import { webApp, mobileApp } from "./channels/index.js";

const app = new Hono<AppBindings>();

app.use("*", requestContextMiddleware);
app.use("*", secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'none'"],
    baseUri: ["'none'"],
    formAction: ["'none'"],
    frameAncestors: ["'none'"],
  },
  strictTransportSecurity: env.NODE_ENV === "production"
    ? "max-age=31536000; includeSubDomains"
    : false,
  xContentTypeOptions: "nosniff",
  xFrameOptions: "DENY",
  referrerPolicy: "no-referrer",
  removePoweredBy: true,
}));
app.use("*", bodyLimit({
  maxSize: 1_048_576,
  onError: (c) => c.json({
    status: 413,
    code: "PAYLOAD_TOO_LARGE",
    message: "Corpo da requisição excede o limite permitido",
    displayMessage: "A requisição é muito grande.",
  }, 413),
}));

app.use(
  "*",
  cors({
    origin: env.WEB_ORIGINS,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "Idempotency-Key",
      "X-Correlation-ID",
      "X-Request-ID",
    ],
    exposeHeaders: ["X-Correlation-ID"],
    credentials: true,
  }),
);

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

app.route("/web", webApp);
app.route("/mobile", mobileApp);

export { app };
