import { serve } from "@hono/node-server";
import { env } from "./config/index.js";
import { app } from "./app.js";

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

export { app };
