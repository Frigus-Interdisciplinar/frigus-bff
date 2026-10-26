export interface CorePage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CoreGroup {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  isOwner: boolean;
  defaultConversationId?: string;
  membersCount: number;
  members: CoreGroupMember[];
}

export interface CoreGroupMember {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface CoreStock {
  id: number;
  groupId: string;
  name: string;
}

export interface CoreStockProduct {
  id: number;
  productId: number;
  stockId: number;
  quantity: number;
  initialQuantity?: number;
  minimalQuantity?: number;
  expireDate: string;
  batch?: string;
  productStatus?: string;
  category: string;
  product?: CoreProduct;
}

export interface CoreProduct {
  id: number;
  name: string;
  category: string;
  storagePlace: string;
  unitPrice: number;
  unitOfMeasure: string;
  brand?: string;
  imageUrl?: string;
}

export interface CoreNotification {
  id: string;
  groupId?: string;
  type: string;
  title: string;
  body: string;
  referenceId?: string;
  readAt?: string | null;
  createdAt: string;
}

export interface CoreRecipeIngredient {
  id?: number;
  productId?: number;
  productName: string;
  productCategory?: string;
  productUnitOfMeasure?: string;
  quantity?: number;
  unit?: string;
  required?: boolean;
  inStock?: boolean;
  expireDate?: string;
}

export interface CoreRecipe {
  id: number;
  name: string;
  description?: string;
  instructions?: string;
  favorite: boolean;
  ingredients?: CoreRecipeIngredient[];
  [key: string]: unknown;
}

export interface CoreRecipeAvailability {
  productId: number;
  productName: string;
  requiredQuantity: number;
  availableQuantity: number;
  unit: string;
  required: boolean;
  available: boolean;
}

export interface CoreReceipt {
  receiptId: string;
  status: "REVIEW_REQUIRED" | "IMPORTED" | "FAILED";
  invoice: { documentType: "NFCE"; accessKey?: string | null; issuerName?: string | null; issuedAt?: string | null; totalAmount?: number | null };
  items: Array<{ lineId: string; description: string; normalizedProductName?: string | null; brand?: string | null; category?: string | null; storagePlace?: string | null; unitOfMeasure?: string | null; quantity: number; unit?: string | null; unitPrice?: number | null; totalPrice?: number | null; confidence?: number | null; evidence?: string | null; matchedProduct?: { productId: number; name: string } | null; expireDate?: string | null }>;
  warnings: string[];
}
export interface CoreReceiptConfirmation {
  receiptId: string;
  status: "IMPORTED";
  importedItems: Array<{ lineId: string; stockProductId: number; productId: number; quantity: number }>;
  ignoredLineIds: string[];
}

export interface CoreStockMovement {
  id: number;
  stockProductId: number;
  userId: string;
  movementType: string;
  quantity: number;
  balanceAfter: number;
  date: string;
}

export interface CoreConversation {
  id: string;
  conversationType: string;
  groupId?: string;
  groupName?: string;
  name?: string;
  latestMessage?: CoreMessage;
}

export interface CoreMessage {
  id: number;
  conversationId: string;
  senderId: string;
  senderName: string;
  messageType?: string;
  content: string | null;
  createdAt: string;
  attachments?: CoreMessageAttachment[];
}

export interface CoreMessageAttachment {
  id: number;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export interface CoreMessageReaction { userId: string; emoji: string }

export type CoreAdvertisementStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";

export interface CoreAdvertisement {
  id: string;
  advertiserId: string;
  advertiserName: string;
  name: string;
  productName: string;
  category: string;
  description: string;
  imageUrl: string;
  destinationUrl?: string;
  price?: number;
  startDate?: string;
  endDate?: string;
  status: CoreAdvertisementStatus;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}
