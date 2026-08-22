import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { env } from "./config/index.js";
import { errorHandler } from "./middlewares/index.js";

const app = new Hono();

app.onError(errorHandler);

app.get("/health", (c) => {
  return c.json({
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
