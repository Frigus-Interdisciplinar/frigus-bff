import type { AxiosRequestConfig } from "axios";
import type { HttpMethods } from "./http-methods.type.js";

export type HttpMethod = HttpMethods;

export interface ApiRequestOptions<B = unknown> {
  params?: Record<string, unknown> | URLSearchParams;
  headers?: Record<string, string>;
  body?: B;
  timeout?: number;
  signal?: AbortSignal;
  axiosConfig?: Omit<
    AxiosRequestConfig,
    "url" | "method" | "data" | "params" | "headers" | "timeout" | "signal"
  >;
}

export type ApiBodylessRequestOptions = Omit<ApiRequestOptions, "body">;
