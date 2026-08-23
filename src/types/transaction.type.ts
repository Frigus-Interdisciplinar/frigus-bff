export type PaymentMethod =
  | "PIX"
  | "BOLETO"
  | "CREDIT_CARD"
  | "DEBIT_CARD";

export type TransactionStatus =
  | "PENDING"
  | "PROCESSING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELED"
  | "ERROR";

export interface CheckoutRequest {
  planCode: string;
  paymentMethod: PaymentMethod;
  fakeCardLast4?: string;
  fakePixKey?: string;
}

export interface TransactionResponse {
  id: string;
  status: TransactionStatus;
  amount: number;
  paymentMethod: PaymentMethod;
  idempotencyKey?: string;
  planCode: string;
  errorMessage?: string;
  createdAt: string;
  queuedAt?: string;
  processedAt?: string;
}
