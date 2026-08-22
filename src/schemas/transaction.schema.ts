import { z } from "zod";

// validacao do checkout de assinatura
export const checkoutSchema = z.object({
  planCode: z.string().min(1, "Plano deve ser informado"),
  paymentMethod: z.enum(["PIX", "BOLETO", "CREDIT_CARD", "DEBIT_CARD"]),
  fakeCardLast4: z
    .string()
    .regex(
      /^\d{4}$/,
      "Os ultimos 4 digitos do cartao devem conter exatamente 4 numeros",
    )
    .optional(),
  fakePixKey: z
    .string()
    .min(10, "A chave PIX deve ter no minimo 10 caracteres")
    .max(150, "A chave PIX deve ter no maximo 150 caracteres")
    .optional(),
});
