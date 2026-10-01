import { Hono } from "hono";

const domesticRoute = new Hono();

/**
 * The former /web/domestic API returned process-local mock data. It is kept as
 * an explicit migration response so a client never mistakes a simulation for
 * persisted core-api state. Supported replacements live under /web/core.
 */
domesticRoute.all("*", (c) =>
  c.json(
    {
      status: 501,
      code: "CORE_API_CONTRACT_REQUIRED",
      message: "Este contrato doméstico foi substituído por endpoints baseados na core-api.",
      displayMessage: "Use os endpoints documentados em docs/frontend-screen-contract.md.",
      timestamp: new Date().toISOString(),
    },
    501,
  ),
);

export { domesticRoute };
