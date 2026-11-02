import { z } from "zod";

export function corePageSchema<T extends z.ZodType>(contentSchema: T) {
  return z.object({
    content: z.array(contentSchema),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    size: z.number().int().nonnegative(),
    number: z.number().int().nonnegative(),
  });
}

export const coreStockSchema = z.object({
  id: z.number().int().positive(),
  groupId: z.string().uuid(),
  name: z.string(),
});

export const coreActiveContextSchema = z.object({
  groupId: z.string().uuid(),
  stocks: z.array(coreStockSchema),
});

export const coreGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  bannerPicture: z.string().nullable().optional().transform((value) => value ?? undefined),
  ownerId: z.string().uuid(),
  ownerName: z.string(),
  isOwner: z.boolean(),
  defaultConversationId: z.string().uuid().nullable().optional(),
  membersCount: z.number().int().nonnegative(),
  members: z.array(z.object({
    userId: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    isOwner: z.boolean().optional(),
    joinedAt: z.string().optional(),
    role: z.string().optional(),
    memberRole: z.string().optional(),
  }).refine((member) => member.role !== undefined || member.memberRole !== undefined)
    .transform(({ role, memberRole, ...member }) => ({
      ...member,
      memberRole: memberRole ?? role ?? "",
    }))),
});

export const coreAdvertisementSchema = z.object({
  id: z.string().min(1),
  advertiserId: z.string().min(1),
  advertiserName: z.string(),
  name: z.string(),
  productName: z.string(),
  category: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  destinationUrl: z.string().nullable().optional(),
  price: z.number().finite().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]),
  impressions: z.number().int().nonnegative(),
  clicks: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const coreNotificationSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid().nullable().optional(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  referenceId: z.string().nullable().optional(),
  readAt: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const coreMovementSchema = z.object({
  id: z.number().int().positive(),
  stockProductId: z.number().int().positive(),
  userId: z.string().uuid(),
  movementType: z.string(),
  quantity: z.number().int(),
  balanceAfter: z.number().int().nonnegative(),
  date: z.string(),
});

const recipeIngredientSchema = z.object({
  id: z.number().int().positive().optional(),
  productId: z.number().int().positive().optional(),
  productName: z.string(),
  productCategory: z.string().nullable().optional(),
  productUnitOfMeasure: z.string().nullable().optional(),
  quantity: z.number().finite().nullable().optional(),
  unit: z.string().nullable().optional(),
  required: z.boolean().nullable().optional(),
  inStock: z.boolean().nullable().optional(),
  expireDate: z.string().date().nullable().optional(),
});

export const coreRecipeSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  domesticOnly: z.boolean().nullable().optional(),
  active: z.boolean().nullable().optional(),
  createdAt: z.string().optional(),
  favorite: z.boolean(),
  ingredients: z.array(recipeIngredientSchema).optional(),
});

export const coreRecipeAvailabilitySchema = z.object({
  productId: z.number().int().positive(),
  productName: z.string(),
  requiredQuantity: z.number().finite(),
  availableQuantity: z.number().finite(),
  unit: z.string(),
  required: z.boolean(),
  available: z.boolean(),
});

const messageAttachmentSchema = z.object({
  id: z.number().int().positive(),
  fileUrl: z.string().url(),
  fileName: z.string(),
  mimeType: z.string(),
  fileSize: z.number().int().nonnegative(),
  createdAt: z.string(),
});

export const coreMessageSchema = z.object({
  id: z.number().int().positive(),
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  senderName: z.string(),
  messageType: z.string().nullable().optional(),
  content: z.string().nullable(),
  createdAt: z.string(),
  attachments: z.array(messageAttachmentSchema).optional(),
});

export const coreConversationSchema = z.object({
  id: z.string().uuid(),
  conversationType: z.string(),
  groupId: z.string().uuid().nullable().optional(),
  groupName: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  pairKey: z.string().nullable().optional(),
  participants: z.array(z.object({
    userId: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    joinedAt: z.string().nullable().optional(),
    leftAt: z.string().nullable().optional(),
  })).optional(),
  latestMessage: coreMessageSchema.nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const coreReactionSchema = z.object({
  userId: z.string().uuid(),
  emoji: z.string().min(1).max(32),
});

export const coreReceiptSchema = z.object({
  receiptId: z.string().uuid(),
  status: z.enum(["REVIEW_REQUIRED", "IMPORTED", "FAILED"]),
  invoice: z.object({
    documentType: z.enum(["NFCE"]),
    accessKey: z.string().nullable().optional(),
    issuerName: z.string().nullable().optional(),
    issuedAt: z.string().nullable().optional(),
    totalAmount: z.number().finite().nullable().optional(),
  }),
  items: z.array(z.object({
    lineId: z.string(),
    description: z.string(),
    normalizedProductName: z.string().nullable().optional(),
    brand: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    storagePlace: z.string().nullable().optional(),
    unitOfMeasure: z.string().nullable().optional(),
    quantity: z.number().finite(),
    unit: z.string().nullable().optional(),
    unitPrice: z.number().finite().nullable().optional(),
    totalPrice: z.number().finite().nullable().optional(),
    confidence: z.number().finite().nullable().optional(),
    evidence: z.string().nullable().optional(),
    matchedProduct: z.object({ productId: z.number().int().positive(), name: z.string() }).nullable().optional(),
    expireDate: z.string().date().nullable().optional(),
  })),
  warnings: z.array(z.string()),
});

export const coreReceiptConfirmationSchema = z.object({
  receiptId: z.string().uuid(),
  status: z.literal("IMPORTED"),
  importedItems: z.array(z.object({
    lineId: z.string(),
    stockProductId: z.number().int().positive(),
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
  })),
  ignoredLineIds: z.array(z.string()),
});

export const planLimitsSchema = z.object({
  planCode: z.enum(["FREE", "PLUS", "FAMILY", "COMMERCIAL", "ENTERPRISE"]),
  maxGroupsCreated: z.number().int().nonnegative(),
  maxGroupMembers: z.number().int().nonnegative(),
  maxStocks: z.number().int().nonnegative(),
  maxProductsPerStock: z.number().int().nonnegative(),
  allowOwnProducts: z.boolean(),
  allowSavedRecipes: z.boolean(),
  allowMoneySaving: z.boolean(),
  isEnterprise: z.boolean(),
  costPerPublishedAd: z.number().finite().nullable().optional(),
  hasMonthlyReport: z.boolean(),
});

export const coreUnreadCountSchema = z.object({ count: z.number().int().nonnegative() });

const productSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  category: z.string(),
  storagePlace: z.string(),
  unitPrice: z.number().finite(),
  unitOfMeasure: z.string(),
  brand: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

const stockProductSchema = z.object({
  id: z.number().int().positive(),
  productId: z.number().int().positive(),
  stockId: z.number().int().positive(),
  quantity: z.number().int().nonnegative(),
  initialQuantity: z.number().int().nonnegative().optional(),
  minimalQuantity: z.number().int().nonnegative().nullable().optional(),
  purchaseUnitPrice: z.number().finite().nullable().optional(),
  expireDate: z.string().date(),
  batch: z.string().nullable().optional(),
  productStatus: z.string().nullable().optional(),
  category: z.string(),
  product: productSchema.optional(),
});

export const coreStockSummarySchema = z.object({
  groupId: z.string().uuid(),
  stockCount: z.number().int().nonnegative(),
  productCount: z.number().int().nonnegative(),
  itemCount: z.number().int().nonnegative(),
  estimatedValue: z.number().finite(),
  pendingShoppingItems: z.number().int().nonnegative(),
  quantitiesByUnit: z.record(z.string(), z.number().finite()),
  itemsByStoragePlace: z.record(z.string(), z.number().int().nonnegative()),
  consumedThisWeek: z.record(z.string(), z.number().finite()),
  weekStart: z.string().date(),
  nearExpiration: z.array(stockProductSchema),
});

export const coreStockProductSchema = stockProductSchema;
export const coreProductSchema = productSchema;
export const coreStockPageSchema = corePageSchema(stockProductSchema);
export const coreProductPageSchema = corePageSchema(productSchema);
export const coreProductListSchema = z.array(productSchema);
export const coreAdvertisementPageSchema = corePageSchema(coreAdvertisementSchema);
export const coreGroupListSchema = z.array(coreGroupSchema);
export const coreNotificationPageSchema = corePageSchema(coreNotificationSchema);
export const coreRecipePageSchema = corePageSchema(coreRecipeSchema);
export const coreMovementPageSchema = corePageSchema(coreMovementSchema);
export const coreConversationListSchema = z.array(coreConversationSchema);
export const coreReactionListSchema = z.array(coreReactionSchema);
export const coreRecipeAvailabilityListSchema = z.array(coreRecipeAvailabilitySchema);
