import {
  isAxiosError,
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import type {
  ApiBodylessRequestOptions,
  ApiRequestOptions,
  HttpMethod,
  HttpMethods,
} from "../types/index.js";
import { axiosInstance } from "./axios-instance.js";
import {
  AppException,
  BadRequestException,
  BadGatewayException,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException,
  type GenericExceptionResponse,
} from "../exceptions/index.js";

/**
 * Maps an AxiosError or generic error into the appropriate AppException subclass.
 */
export function handleAxiosError(error: unknown): never {
  if (isAxiosError<Partial<GenericExceptionResponse>>(error)) {
    const response = error.response;

    if (response) {
      const data = response.data;
      const status = (data?.status ?? response.status) as number;
      const code = data?.code ?? `HTTP_${status}`;
      const message =
        data?.message ?? error.message ?? "Erro na comunicação com o serviço externo";
      const displayMessage =
        data?.displayMessage ?? "Não foi possível processar a requisição";
      const fields = data?.fields;
      const timestamp = data?.timestamp;

      switch (status) {
        case 400:
          throw new BadRequestException(message, displayMessage, fields);
        case 401:
          throw new UnauthorizedException(message, displayMessage);
        case 403:
          throw new ForbiddenException(message, displayMessage);
        case 404:
          throw new NotFoundException(message, displayMessage);
        case 409:
          throw new ConflictException(message, displayMessage, fields);
        case 422:
          throw new UnprocessableEntityException(message, displayMessage, fields);
        case 500:
          throw new InternalServerErrorException(message, displayMessage);
        case 502:
          throw new BadGatewayException(message, displayMessage);
        case 503:
          throw new ServiceUnavailableException(message, displayMessage);
        case 504:
          throw new GatewayTimeoutException(message, displayMessage);
        default:
          throw new AppException({
            status: status as any,
            code,
            message,
            displayMessage,
            fields,
            timestamp,
          });
      }
    }

    // Network / Timeout errors (No response received)
    if (
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT" ||
      error.message.toLowerCase().includes("timeout")
    ) {
      throw new GatewayTimeoutException(
        "Tempo limite de requisição excedido",
        "O serviço externo demorou muito para responder",
      );
    }

    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND" ||
      error.code === "ERR_NETWORK"
    ) {
      throw new BadGatewayException(
        `Não foi possível conectar ao serviço externo: ${error.message}`,
        "Serviço temporariamente indisponível. Tente novamente mais tarde.",
      );
    }

    throw new BadGatewayException(
      error.message || "Erro de comunicação com o serviço externo",
      "Não foi possível comunicar com o serviço integrado",
    );
  }

  if (error instanceof AppException) {
    throw error;
  }

  if (error instanceof Error) {
    throw new InternalServerErrorException(error.message);
  }

  throw new InternalServerErrorException("Erro inesperado");
}

export interface ApiClientOptions<B = unknown> extends ApiRequestOptions<B> {
  client?: AxiosInstance;
}

/**
 * Main API request execution function.
 */
async function request<T, B = unknown>(
  endpoint: string,
  httpMethod: HttpMethods | HttpMethod,
  body?: B,
  options?: ApiClientOptions<B>,
): Promise<T> {
  const client = options?.client ?? axiosInstance;

  const config: AxiosRequestConfig = {
    method: httpMethod,
    url: endpoint,
    data: body ?? options?.body,
    params: options?.params,
    headers: options?.headers,
    timeout: options?.timeout,
    signal: options?.signal,
    ...options?.axiosConfig,
  };

  try {
    const res = await client.request<T>(config);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

/**
 * API client with convenient HTTP method helpers for optimal Developer Experience (DX).
 */
export const api = Object.assign(request, {
  get<T>(endpoint: string, options?: ApiBodylessRequestOptions): Promise<T> {
    return request<T>(endpoint, "GET", undefined, options);
  },
  post<T, B = unknown>(
    endpoint: string,
    body?: B,
    options?: ApiBodylessRequestOptions,
  ): Promise<T> {
    return request<T, B>(endpoint, "POST", body, options);
  },
  put<T, B = unknown>(
    endpoint: string,
    body?: B,
    options?: ApiBodylessRequestOptions,
  ): Promise<T> {
    return request<T, B>(endpoint, "PUT", body, options);
  },
  patch<T, B = unknown>(
    endpoint: string,
    body?: B,
    options?: ApiBodylessRequestOptions,
  ): Promise<T> {
    return request<T, B>(endpoint, "PATCH", body, options);
  },
  delete<T>(endpoint: string, options?: ApiBodylessRequestOptions): Promise<T> {
    return request<T>(endpoint, "DELETE", undefined, options);
  },
});
