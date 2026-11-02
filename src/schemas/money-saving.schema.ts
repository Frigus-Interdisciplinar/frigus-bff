import { z } from "zod";

const uuid = z.string().uuid("Identificador inválido");
const positiveInteger = z.number().int().positive().max(2_147_483_647);
const positiveLong = z.number().int().positive();
const money = z.number().finite().positive().max(99_999_999.99)
  .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.00001, "Use no máximo duas casas decimais.");
const foodCategory = z.enum(["FRUIT", "VEGETABLE", "MEAT", "DAIRY", "GRAIN", "BEVERAGE"]);

export const moneySavingPathSchema = z.object({ groupId: uuid });
export const foodPurchasePathSchema = z.object({ groupId: uuid, purchaseId: uuid });

export const moneySavingRangeSchema = z.object({
  from: z.string().date(),
  to: z.string().date(),
});

export const moneySavingEventsQuerySchema = moneySavingRangeSchema.extend({
  category: z.enum(["HORTIFRUTI", "MEAT", "DAIRY", "GRAIN", "BEVERAGE"]).optional(),
  kind: z.enum(["PURCHASE", "CONSUMED", "DISCARDED"]).optional(),
  page: z.coerce.number().int().nonnegative().default(0),
  size: z.coerce.number().int().positive().max(100).default(20),
});

const purchaseHeaderSchema = z.object({
  purchaseDate: z.string().date(),
  source: z.enum(["USER_CONFIRMED", "RECEIPT_CAPTURED"]),
  receiptReference: z.string().max(160).nullable().optional(),
});

export const foodPurchaseCreateSchema = purchaseHeaderSchema.extend({
  lines: z.array(z.object({
    stockId: positiveInteger,
    productId: positiveInteger,
    expireDate: z.string().date(),
    quantity: positiveInteger,
    unitPrice: money,
    category: foodCategory.optional(),
  })).min(1),
});

export const foodPurchaseUpdateSchema = purchaseHeaderSchema.extend({
  version: z.number().int().nonnegative(),
  lines: z.array(z.object({
    id: positiveLong,
    quantity: positiveInteger,
    unitPrice: money,
    category: foodCategory.optional(),
  })).min(1),
});

export type FoodPurchaseCreateInput = z.infer<typeof foodPurchaseCreateSchema>;
export type FoodPurchaseUpdateInput = z.infer<typeof foodPurchaseUpdateSchema>;
