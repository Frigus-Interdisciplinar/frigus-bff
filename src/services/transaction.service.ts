import { api } from "../utils/index.js";
import type {
  ApiBodylessRequestOptions,
  CheckoutRequest,
  PageableParams,
  PageResponse,
  TransactionResponse,
} from "../types/index.js";

// servico de checkout e transacoes na core-api
export class TransactionService {
  async checkout(
    body: CheckoutRequest,
    idempotencyKey?: string,
    options?: ApiBodylessRequestOptions,
  ): Promise<TransactionResponse> {
    return api.post<TransactionResponse, CheckoutRequest>(
      "/transactions/checkout",
      body,
      {
        ...options,
        headers: {
          ...options?.headers,
          ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
        },
      },
    );
  }

  async listTransactions(
    params?: PageableParams,
    options?: ApiBodylessRequestOptions,
  ): Promise<PageResponse<TransactionResponse>> {
    return api.get<PageResponse<TransactionResponse>>("/transactions", {
      ...options,
      params: {
        ...options?.params,
        ...params,
      },
    });
  }

  async getTransactionById(
    transactionId: string,
    options?: ApiBodylessRequestOptions,
  ): Promise<TransactionResponse> {
    return api.get<TransactionResponse>(
      `/transactions/${transactionId}`,
      options,
    );
  }

  async cancelTransaction(
    transactionId: string,
    options?: ApiBodylessRequestOptions,
  ): Promise<TransactionResponse> {
    return api.post<TransactionResponse>(
      `/transactions/${transactionId}/cancel`,
      undefined,
      options,
    );
  }
}

export const transactionService = new TransactionService();
