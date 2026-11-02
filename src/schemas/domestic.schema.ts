import { z } from "zod";

export const stockCreateSchema = z.object({
  name: z.string().min(1, "O nome do alimento é obrigatório"),
  brand: z.string().optional(),
  category: z.string().min(1, "A categoria é obrigatória"),
  quantity: z.string().min(1, "A quantidade é obrigatória"),
  unitOfMeasure: z.string().optional(),
  location: z.enum(["Despensa", "Geladeira", "Freezer"], {
    message: "Localização inválida. Escolha entre Despensa, Geladeira ou Freezer",
  }),
  expireDate: z.string().min(1, "A data de validade é obrigatória"),
  image: z.string().optional(),
});

export const stockUpdateSchema = stockCreateSchema.partial();

export const stockConsumeSchema = z.object({
  quantity: z.string().min(1, "Informe a quantidade consumida"),
  notes: z.string().optional(),
});

export const stockBatchCreateSchema = z.object({
  items: z.array(stockCreateSchema).min(1, "A lista de itens não pode estar vazia"),
});

export const shoppingListItemCreateSchema = z.object({
  name: z.string().min(1, "O nome do item é obrigatório"),
  category: z.string().optional().default("Geral"),
  quantity: z.string().optional().default("1 un"),
  image: z.string().optional(),
});

export const shoppingListItemUpdateSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  quantity: z.string().optional(),
  checked: z.boolean().optional(),
  image: z.string().optional(),
});

export const notificationPreferencesSchema = z.object({
  emailNotify: z.boolean().optional(),
  browserNotify: z.boolean().optional(),
  onlyImportant: z.boolean().optional(),
});

export const domesticSettingsSchema = z.object({
  expiryReminder: z.boolean().optional(),
  shoppingReminder: z.boolean().optional(),
  weeklySummary: z.boolean().optional(),
  theme: z.enum(["light", "system", "dark"]).optional(),
});

export type StockCreateInput = z.infer<typeof stockCreateSchema>;
export type StockUpdateInput = z.infer<typeof stockUpdateSchema>;
export type StockConsumeInput = z.infer<typeof stockConsumeSchema>;
export type StockBatchCreateInput = z.infer<typeof stockBatchCreateSchema>;
export type ShoppingListItemCreateInput = z.infer<typeof shoppingListItemCreateSchema>;
export type ShoppingListItemUpdateInput = z.infer<typeof shoppingListItemUpdateSchema>;
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
export type DomesticSettingsInput = z.infer<typeof domesticSettingsSchema>;
