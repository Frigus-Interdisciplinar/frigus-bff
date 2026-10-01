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
  minimalQuantity?: number;
  expireDate: string;
  productStatus?: string;
  category: string;
}

export interface CoreProduct {
  id: number;
  name: string;
  category: string;
  storagePlace: string;
  unitPrice: number;
  unitOfMeasure: string;
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
  content: string;
  createdAt: string;
}
