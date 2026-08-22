import axios, { type AxiosInstance, type CreateAxiosDefaults } from "axios";
import { env } from "../config/env.js";

export function createAxiosInstance(
  overrides?: CreateAxiosDefaults,
): AxiosInstance {
  const config: CreateAxiosDefaults = {
    baseURL: overrides?.baseURL ?? env.API_BASE_URL,
    timeout: overrides?.timeout ?? env.API_TIMEOUT_MS,
    timeoutErrorMessage:
      overrides?.timeoutErrorMessage ??
      "Tempo limite excedido ao conectar com o serviço externo",
    headers: {
      "Content-Type": "application/json",
      ...overrides?.headers,
    },
    ...overrides,
  };

  return axios.create(config);
}

export const axiosInstance = createAxiosInstance();
