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
import { getCurrentCorrelationId } from "../middlewares/request-context.middleware.js";
import { z } from "zod";
import type { ErrorStatusCode } from "../types/error-status.type.js";

const upstreamErrorSchema = z.object({
  code: z.string().max(80).optional(),
  message: z.string().max(500).optional(),
  displayMessage: z.string().max(500).optional(),
  fields: z.array(z.object({
    fieldName: z.string().max(120),
    errorMessage: z.string().max(300),
    displayMessage: z.string().max(300).optional(),
  })).max(50).optional(),
});
const jsonResponseSchema = z.json();

function supportedErrorStatus(status: number): ErrorStatusCode {
  switch (status) {
    case 400: return 400;
    case 401: return 401;
    case 403: return 403;
    case 404: return 404;
    case 405: return 405;
    case 406: return 406;
    case 408: return 408;
    case 409: return 409;
    case 410: return 410;
    case 411: return 411;
    case 412: return 412;
    case 413: return 413;
    case 414: return 414;
    case 415: return 415;
    case 416: return 416;
    case 417: return 417;
    case 418: return 418;
    case 422: return 422;
    case 425: return 425;
    case 426: return 426;
    case 429: return 429;
    case 431: return 431;
    case 500: return 500;
    case 501: return 501;
    case 502: return 502;
    case 503: return 503;
    case 504: return 504;
    case 505: return 505;
    case 506: return 506;
    case 507: return 507;
    case 508: return 508;
    case 510: return 510;
    case 511: return 511;
    default: return status >= 500 ? 502 : 400;
  }
}

function safeClientMessage(value: string | undefined, fallback: string): string {
  const stackTracePattern = /(?:\bat\s+[\w.$]+\([^)]*:\d+(?::\d+)?\)|Caused by:|\.java:\d+|StackTrace)/i;
  if (!value || value.includes("\n") || value.includes("\r") || stackTracePattern.test(value)) {
    return fallback;
  }
  return value;
}

/**
 * Maps an AxiosError or generic error into the appropriate AppException subclass.
 */
export function handleAxiosError(error: unknown): never {
  if (isAxiosError<Partial<GenericExceptionResponse>>(error)) {
    const response = error.response;

    if (response) {
      const status = supportedErrorStatus(response.status);
      const parsed = upstreamErrorSchema.safeParse(response.data);
      const data = parsed.success ? parsed.data : undefined;
      const code = data?.code && /^[A-Z0-9_-]{1,80}$/.test(data.code)
        ? data.code
        : `HTTP_${status}`;
      const message = status >= 500
        ? "Erro ao processar a solicitação no serviço integrado"
        : safeClientMessage(data?.message, "A solicitação não pôde ser processada");
      const displayMessage = status >= 500
        ? "Serviço temporariamente indisponível. Tente novamente mais tarde."
        : safeClientMessage(data?.displayMessage, "Verifique os dados enviados e tente novamente.");
      const fields = status < 500 ? data?.fields : undefined;

      switch (status) {
        case 400:
          throw new BadRequestException(message, displayMessage, fields, code);
        case 401:
          throw new UnauthorizedException(message, displayMessage, code);
        case 403:
          throw new ForbiddenException(message, displayMessage, code);
        case 404:
          throw new NotFoundException(message, displayMessage, code);
        case 409:
          throw new ConflictException(message, displayMessage, fields, code);
        case 422:
          throw new UnprocessableEntityException(message, displayMessage, fields, code);
        case 500:
          throw new InternalServerErrorException(message, displayMessage, code);
        case 502:
          throw new BadGatewayException(message, displayMessage, code);
        case 503:
          throw new ServiceUnavailableException(message, displayMessage, code);
        case 504:
          throw new GatewayTimeoutException(message, displayMessage, code);
        default:
          throw new AppException({
            status,
            code,
            message,
            displayMessage,
            fields,
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
        "Não foi possível conectar ao serviço integrado",
        "Serviço temporariamente indisponível. Tente novamente mais tarde.",
      );
    }

    throw new BadGatewayException(
      "Erro de comunicação com o serviço externo",
      "Não foi possível comunicar com o serviço integrado",
    );
  }

  if (error instanceof AppException) {
    throw error;
  }

  if (error instanceof Error) {
    throw new InternalServerErrorException();
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
  const correlationId = getCurrentCorrelationId();

  const config: AxiosRequestConfig = {
    method: httpMethod,
    url: endpoint,
    data: body ?? options?.body,
    params: options?.params,
    headers: {
      ...options?.headers,
      ...(correlationId ? { "X-Correlation-ID": correlationId } : {}),
    },
    timeout: options?.timeout,
    signal: options?.signal,
    ...options?.axiosConfig,
  };

  let response;
  try {
    response = await client.request<T>(config);
  } catch (error) {
    handleAxiosError(error);
  }

  if (
    options?.allowEmptyResponse &&
    response.status >= 200 &&
    response.status < 300 &&
    (response.data === "" || response.data === undefined)
  ) {
    return undefined as T;
  }

  const parsed = (options?.responseSchema ?? jsonResponseSchema).safeParse(response.data);
  if (!parsed.success) {
    throw new BadGatewayException(
      "Resposta inválida recebida do serviço integrado",
      "Serviço temporariamente indisponível. Tente novamente mais tarde.",
      "INVALID_UPSTREAM_RESPONSE",
    );
  }

  return parsed.data as T;
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
