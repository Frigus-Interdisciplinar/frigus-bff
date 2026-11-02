import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  API_BASE_URL: z.string().url().default("http://localhost:8080"),
  API_TIMEOUT_MS: z.coerce.number().int().min(100).max(120_000).default(10_000),
  TRUST_PROXY: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  WEB_ORIGINS: z.string()
    .default("http://localhost:5173,http://127.0.0.1:5173")
    .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean))
    .pipe(z.array(z.string().url()).min(1))
    .refine((origins) => origins.every((origin) => {
      if (origin === "*" || origin.includes("*")) return false;
      const parsed = new URL(origin);
      return ["http:", "https:"].includes(parsed.protocol) && parsed.origin === origin;
    }), "WEB_ORIGINS must contain exact HTTP(S) origins without paths or wildcards")
    .transform((origins) => [...new Set(origins)]),
});

export type Env = z.infer<typeof envSchema>;
export type AppBindings = { Bindings: Env };

export const env = envSchema.parse(process.env);
