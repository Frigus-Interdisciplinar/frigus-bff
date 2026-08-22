import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  API_BASE_URL: z.string().url().default("http://localhost:8080"),
  API_TIMEOUT_MS: z.coerce.number().default(10000),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
