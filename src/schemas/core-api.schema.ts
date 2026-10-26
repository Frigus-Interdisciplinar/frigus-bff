import { z } from "zod";

// Request contracts follow the Core DTOs and service validations, not response fields.
const uuid = z.string().uuid("Identificador inválido");
const positiveInteger = z.number().int().positive().max(2147483647);
const nonNegativeInteger = z.number().int().nonnegative().max(2147483647);
const money = (max: number, positive = false) => z.number().finite().min(positive ? 0.01 : 0).max(max).refine(v => Math.abs(v * 100 - Math.round(v * 100)) < 0.00001, "Use no máximo duas casas decimais.");
const optionalInput = <T extends z.ZodType>(schema: T) =>
  z.preprocess(v => v === null || (typeof v === "string" && !v.trim()) ? undefined : v, schema.optional());

export const groupCreateSchema = z.object({ name: z.string().min(1), bannerPicture: optionalInput(z.string()) });
export const groupUpdateSchema = groupCreateSchema.partial();
export const stockSchema = z.object({ groupId: uuid, name: z.string().min(1) });
export const stockProductCreateSchema = z.object({ productId: positiveInteger, stockId: positiveInteger, quantity: nonNegativeInteger, minimalQuantity: optionalInput(nonNegativeInteger), expireDate: z.string().date(), batch: optionalInput(z.string().max(120)) });
export const stockProductUpdateSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  category: z.enum(["FRUIT", "VEGETABLE", "DAIRY", "GRAIN", "MEAT", "BEVERAGE", "CLEANING", "PERSONAL_HYGIENE", "FISH", "FROZEN", "SWEETS", "CANNED", "SEASONING"]).optional(),
  storagePlace: z.enum(["FRIDGE", "FREEZER", "PANTRY", "CABINET", "SHELF"]).optional(),
  quantity: nonNegativeInteger.optional(),
  minimalQuantity: optionalInput(nonNegativeInteger),
  initialQuantity: nonNegativeInteger.optional(),
  expireDate: z.string().date().optional(),
  batch: z.string().max(120).optional(),
}).refine((value) => Object.keys(value).length > 0, "Informe ao menos um campo para atualizar.");
export const movementSchema = z.object({ movementType: z.enum(["IN", "OUT", "ADJUSTMENT"]), quantity: nonNegativeInteger, observation: optionalInput(z.string().max(2000)) }).refine(v => v.movementType === "ADJUSTMENT" || v.quantity > 0, { path: ["quantity"], message: "Entradas e saídas devem ser maiores que zero." });
export const discardSchema = z.object({ stockProductId: positiveInteger, quantity: positiveInteger, reason: optionalInput(z.string().max(2000)) });
export const groupConversationSchema = z.object({ groupId: uuid, name: z.string().min(1), participantUserIds: z.array(uuid).optional() });
export const privateConversationSchema = z.object({ targetUserId: uuid });
export const messageSchema = z.object({ content: z.string().optional(), messageType: z.enum(["TEXT", "IMAGE", "SYSTEM"]).optional(), relatedShoppingListProductId: positiveInteger.optional(), attachments: z.array(z.object({ fileUrl: z.string().min(1), fileName: z.string().min(1).max(255), mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]), fileSize: positiveInteger })).max(5).optional() }).refine((value) => Boolean(value.content?.trim()) || Boolean(value.attachments?.length), "Envie uma mensagem ou anexo.");
export const attachmentUploadSchema = z.object({ fileName: z.string().min(1).max(255), mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]), fileSize: positiveInteger.max(10 * 1024 * 1024) });
export const reactionSchema = z.object({ emoji: z.enum(["👍", "❤️", "😂", "😮", "😢", "🙏"]) });
export const groupProductSchema = z.object({ name: z.string().min(1).max(255), category: z.enum(["FRUIT", "VEGETABLE", "DAIRY", "GRAIN", "MEAT", "BEVERAGE", "CLEANING", "PERSONAL_HYGIENE", "FISH", "FROZEN", "SWEETS", "CANNED", "SEASONING"]), storagePlace: z.enum(["FRIDGE", "FREEZER", "PANTRY", "CABINET", "SHELF"]), unitPrice: money(99999999.99, true), unitOfMeasure: z.enum(["KILOGRAM", "GRAM", "LITER", "MILLILITER", "UNIT", "DOZEN", "PACKAGE"]), brand: optionalInput(z.string().max(120)), imageUrl: optionalInput(z.string().max(2048).url().refine(v => ["http:", "https:"].includes(new URL(v).protocol))) });
export const shoppingListSchema = z.object({ stockId: positiveInteger, name: z.string().min(1).max(255), date: z.string().date().optional() });
export const shoppingItemSchema = z.object({ productId: positiveInteger, quantity: positiveInteger });
export const shoppingItemUpdateSchema = z.object({ quantity: positiveInteger.optional(), status: z.enum(["PENDING", "PURCHASED", "REMOVED"]).optional(), purchasedUnitPrice: optionalInput(money(99999999.99)) });
export const completeShoppingSchema = z.object({ supplier: optionalInput(z.string().max(255)) });
export const invitationSchema = z.object({ email: z.string().email(), name: optionalInput(z.string().max(255)), memberRole: z.enum(["EDITOR", "VIEWER"]) });
export const preferencesSchema = z.object({ expirationAlertsEnabled: z.boolean(), lowStockAlertsEnabled: z.boolean(), shoppingRemindersEnabled: z.boolean(), weeklySummaryEnabled: z.boolean(), theme: z.enum(["LIGHT", "DARK", "SYSTEM"]) });
export const expenseSchema = z.object({ description: z.string().min(1).max(255), category: z.string().min(1).max(120), amount: money(9999999999.99, true), expenseDate: z.string().date(), supplier: optionalInput(z.string().max(255)) });
export const checkoutSchema = z.object({ planCode: z.string().min(1).max(20), paymentMethod: z.enum(["PIX", "BOLETO", "CREDIT_CARD", "DEBIT_CARD"]).optional(), fakeCardLast4: optionalInput(z.string().regex(/^\d{4}$/)), fakePixKey: optionalInput(z.string().min(10).max(150)) });
export const aiRecipeChatSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  stockId: positiveInteger,
  sessionId: optionalInput(z.string().trim().max(200)),
});
export const httpsUrl = z.string().max(2048).url().refine((value) => new URL(value).protocol === "https:", "Use uma URL HTTPS pública");
export const advertisementSchema = z.object({
  name: z.string().trim().min(1).max(120),
  productName: z.string().trim().min(1).max(160),
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(2000),
  imageUrl: httpsUrl,
  destinationUrl: optionalInput(httpsUrl),
  price: optionalInput(money(9999999999.99)),
  startDate: optionalInput(z.string().date()),
  endDate: optionalInput(z.string().date()),
}).refine(v => !v.startDate || !v.endDate || v.endDate >= v.startDate, { path: ["endDate"], message: "A data final precisa ser igual ou posterior à data inicial." });
export const advertisementStatusSchema = z.object({ status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]) });
export const receiptScanSchema = z.object({ stockId: positiveInteger, qrPayload: z.string().trim().min(1).max(4000) });
export const receiptConfirmSchema = z.object({
  items: z.array(z.discriminatedUnion("action", [
    z.object({ lineId: uuid, action: z.literal("IMPORT"), productId: positiveInteger, quantity: positiveInteger, expireDate: z.string().date() }),
    z.object({ lineId: uuid, action: z.literal("IGNORE") }),
  ])).min(1),
});

