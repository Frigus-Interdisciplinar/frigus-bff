import { api } from "../utils/index.js";
import { axiosInstance } from "../utils/axios-instance.js";
import { handleAxiosError } from "../utils/api-client.js";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { getCurrentCorrelationId } from "../middlewares/request-context.middleware.js";
import type { PlanLimits } from "../types/plan.type.js";
import type { ApiBodylessRequestOptions } from "../types/index.js";
import type {
  CoreConversation,
  CoreAdvertisement,
  CoreAdvertisementStatus,
  CoreGroup,
  CorePage,
  CoreProduct,
  CoreStock,
  CoreStockSummary,
  CoreStockMovement,
  CoreStockProduct,
  CoreMessage,
  CoreMessageReaction,
  CoreNotification,
  CoreRecipe,
  CoreRecipeAvailability,
  CoreReceipt,
  CoreReceiptConfirmation,
} from "../types/core-api.type.js";
import {
  coreAdvertisementPageSchema,
  coreAdvertisementSchema,
  coreActiveContextSchema,
  coreConversationListSchema,
  coreConversationSchema,
  coreGroupListSchema,
  coreGroupSchema,
  coreMessageSchema,
  coreMovementPageSchema,
  coreMovementSchema,
  coreNotificationPageSchema,
  coreNotificationSchema,
  corePageSchema,
  coreProductListSchema,
  coreProductPageSchema,
  coreProductSchema,
  coreReactionListSchema,
  coreReceiptConfirmationSchema,
  coreReceiptSchema,
  coreRecipeAvailabilityListSchema,
  coreRecipePageSchema,
  coreRecipeSchema,
  coreStockPageSchema,
  coreStockProductSchema,
  coreStockSchema,
  coreStockSummarySchema,
  coreUnreadCountSchema,
  planLimitsSchema,
} from "../schemas/core-api-response.schema.js";

type Query = Record<string, string | number | boolean | undefined>;
type CurrentSubscription = {
  status?: string | null;
  currentPeriodEnd?: string | null;
};

const options = (headers: ApiBodylessRequestOptions["headers"], params?: Query, timeout?: number) => ({
  headers,
  params,
  timeout,
});
const noContentOptions = (headers: ApiBodylessRequestOptions["headers"]) => ({
  ...options(headers),
  allowEmptyResponse: true,
});

/**
 * Thin, typed adapter around endpoints that are already implemented in core-api.
 * It intentionally does not manufacture data for features the core-api does not own.
 */
export class CoreApiService {
  /** Forward a Core API operation while preserving its status and response body. */
  async forwardRequest(config: AxiosRequestConfig): Promise<AxiosResponse> {
    try {
      const correlationId = getCurrentCorrelationId();
      const headers = {
        ...config.headers,
        ...(correlationId ? { "X-Correlation-ID": correlationId } : {}),
      };
      return await axiosInstance.request({ ...config, headers });
    } catch (error) {
      handleAxiosError(error);
    }
  }

  listMyAdvertisements(headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number) {
    return api.get<CorePage<CoreAdvertisement>>("/advertisements/mine", { ...options(headers, { page, size }), responseSchema: coreAdvertisementPageSchema });
  }

  listActiveAdvertisements(headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number) {
    return api.get<CorePage<CoreAdvertisement>>("/advertisements/active", { ...options(headers, { page, size }), responseSchema: coreAdvertisementPageSchema });
  }

  createAdvertisement(body: unknown, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreAdvertisement>("/advertisements", body, { ...options(headers), responseSchema: coreAdvertisementSchema });
  }

  updateAdvertisement(id: string, body: unknown, headers: ApiBodylessRequestOptions["headers"]) {
    return api.put<CoreAdvertisement>(`/advertisements/${id}`, body, { ...options(headers), responseSchema: coreAdvertisementSchema });
  }

  updateAdvertisementStatus(id: string, status: CoreAdvertisementStatus, headers: ApiBodylessRequestOptions["headers"]) {
    return api.patch<CoreAdvertisement>(`/advertisements/${id}/status`, { status }, { ...options(headers), responseSchema: coreAdvertisementSchema });
  }

  recordAdvertisementEvent(id: string, event: "impressions" | "clicks", headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<void>(`/advertisements/${id}/${event}`, undefined, noContentOptions(headers));
  }

  getActiveContext(headers: ApiBodylessRequestOptions["headers"], groupId?: string) {
    return api.get<{ groupId: string; stocks: CoreStock[] }>("/stocks/active-context", {
      ...options(headers, { groupId }),
      responseSchema: coreActiveContextSchema,
    });
  }

  getStockSummary(headers: ApiBodylessRequestOptions["headers"], groupId?: string) {
    return api.get<CoreStockSummary>("/stocks/my-summary", {
      ...options(headers, { groupId }),
      responseSchema: coreStockSummarySchema,
    });
  }
  listGroups(headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<CoreGroup[]>("/groups", { ...options(headers), responseSchema: coreGroupListSchema });
  }

  getGroup(id: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<CoreGroup>(`/groups/${id}`, { ...options(headers), responseSchema: coreGroupSchema });
  }

  createGroup(body: { name: string; bannerPicture?: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreGroup>("/groups", body, { ...options(headers), responseSchema: coreGroupSchema });
  }

  updateGroup(id: string, body: { name?: string; bannerPicture?: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.put<CoreGroup>(`/groups/${id}`, body, { ...options(headers), responseSchema: coreGroupSchema });
  }

  addGroupMember(id: string, body: { userId: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreGroup>(`/groups/${id}/members`, body, { ...options(headers), responseSchema: coreGroupSchema });
  }

  removeGroupMember(id: string, userId: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.delete<void>(`/groups/${id}/members/${userId}`, noContentOptions(headers));
  }

  listStocks(groupId: string, headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number) {
    return api.get<CorePage<CoreStock>>("/stocks", {
      ...options(headers, { groupId, page, size }),
      responseSchema: corePageSchema(coreStockSchema),
    });
  }

  createStock(body: { groupId: string; name: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreStock>("/stocks", body, { ...options(headers), responseSchema: coreStockSchema });
  }

  createGroupProduct(groupId: string, body: { name: string; category: string; storagePlace: string; unitPrice: number; unitOfMeasure: string; brand?: string; imageUrl?: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreProduct>(`/groups/${groupId}/products`, body, { ...options(headers), responseSchema: coreProductSchema });
  }

  listGroupProducts(groupId: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<CoreProduct[]>(`/groups/${groupId}/products`, { ...options(headers), responseSchema: coreProductListSchema });
  }

  updateStock(id: string, body: { groupId: string; name: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.put<CoreStock>(`/stocks/${id}`, body, { ...options(headers), responseSchema: coreStockSchema });
  }

  listStockProducts(stockId: string, headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number, category?: string, storagePlace?: string, q?: string) {
    return api.get<CorePage<CoreStockProduct>>("/stock-products", {
      ...options(headers, { stockId, page, size, category, storagePlace, q }),
      responseSchema: coreStockPageSchema,
    });
  }

  getStockProduct(id: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<CoreStockProduct>(`/stock-products/${id}`, { ...options(headers), responseSchema: coreStockProductSchema });
  }

  deleteStockProduct(id: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.delete<void>(`/stock-products/${id}`, noContentOptions(headers));
  }

  createStockProduct(body: { productId: number; stockId: number; quantity: number; minimalQuantity?: number; expireDate: string; batch?: string; purchaseUnitPrice?: number }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreStockProduct>("/stock-products", body, { ...options(headers), responseSchema: coreStockProductSchema });
  }

  scanReceipt(body: { stockId: number; qrPayload: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreReceipt>("/receipts/scan", body, { ...options(headers, undefined, 120_000), responseSchema: coreReceiptSchema });
  }

  getReceipt(id: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<CoreReceipt>(`/receipts/${id}`, { ...options(headers), responseSchema: coreReceiptSchema });
  }

  confirmReceipt(id: string, body: unknown, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreReceiptConfirmation>(`/receipts/${id}/confirm`, body, { ...options(headers), responseSchema: coreReceiptConfirmationSchema });
  }

  updateStockProduct(id: string, body: { name?: string; category?: string; storagePlace?: string; quantity?: number; initialQuantity?: number; minimalQuantity?: number; expireDate?: string; batch?: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.put<CoreStockProduct>(`/stock-products/${id}`, body, { ...options(headers), responseSchema: coreStockProductSchema });
  }

  listMovements(stockProductId: string, headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number) {
    return api.get<CorePage<CoreStockMovement>>(`/stock-products/${stockProductId}/movements`, { ...options(headers, { page, size }), responseSchema: coreMovementPageSchema });
  }

  createMovement(stockProductId: string, body: { movementType: string; quantity: number; observation?: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreStockMovement>(`/stock-products/${stockProductId}/movements`, body, { ...options(headers), responseSchema: coreMovementSchema });
  }

  listProducts(page?: number, size?: number) {
    return api.get<CorePage<CoreProduct>>("/products", {
      params: { page, size },
      responseSchema: coreProductPageSchema,
    });
  }

  listDiscards(headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number) {
    return api.get<CorePage<unknown>>("/discard", options(headers, { page, size }));
  }

  createDiscard(body: { stockProductId: number; quantity: number; reason?: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<unknown>("/discard", body, options(headers));
  }

  listConversations(headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<CoreConversation[]>("/conversations", { ...options(headers), responseSchema: coreConversationListSchema });
  }

  getConversation(id: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<CoreConversation>(`/conversations/${id}`, { ...options(headers), responseSchema: coreConversationSchema });
  }

  createGroupConversation(body: { groupId: string; name: string; participantUserIds?: string[] }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreConversation>("/conversations/group", body, { ...options(headers), responseSchema: coreConversationSchema });
  }

  createPrivateConversation(body: { targetUserId: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreConversation>("/conversations/private", body, { ...options(headers), responseSchema: coreConversationSchema });
  }

  listMessages(id: string, headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number, q?: string) {
    return api.get<CorePage<CoreMessage>>(`/conversations/${id}/messages`, { ...options(headers, { page, size, q }), responseSchema: corePageSchema(coreMessageSchema) });
  }

  sendMessage(id: string, body: { content?: string; messageType?: string; relatedShoppingListProductId?: number; attachments?: Array<{ fileUrl: string; fileName: string; mimeType: string; fileSize: number }> }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreMessage>(`/conversations/${id}/messages`, body, { ...options(headers), responseSchema: coreMessageSchema });
  }

  listMessageReactions(conversationId: string, messageId: number, headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<CoreMessageReaction[]>(`/conversations/${conversationId}/messages/${messageId}/reactions`, { ...options(headers), responseSchema: coreReactionListSchema });
  }
  addMessageReaction(conversationId: string, messageId: number, body: { emoji: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.put<CoreMessageReaction[]>(`/conversations/${conversationId}/messages/${messageId}/reactions`, body, { ...options(headers), responseSchema: coreReactionListSchema });
  }
  removeMessageReaction(conversationId: string, messageId: number, emoji: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.delete<CoreMessageReaction[]>(`/conversations/${conversationId}/messages/${messageId}/reactions`, { ...options(headers, { emoji }), responseSchema: coreReactionListSchema });
  }

  listPlans() {
    return api.get<unknown[]>("/plans/active");
  }

  getMyPlanLimits(headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<PlanLimits>("/plans/me/limits", { ...options(headers), responseSchema: planLimitsSchema });
  }

  getMoneySavingSummary(groupId: string, from: string, to: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<unknown>(`/groups/${groupId}/money-saving/summary`, options(headers, { from, to }));
  }

  getMoneySavingEvents(
    groupId: string,
    query: { from: string; to: string; category?: string; kind?: string; page?: number; size?: number },
    headers: ApiBodylessRequestOptions["headers"],
  ) {
    return api.get<unknown>(`/groups/${groupId}/money-saving/events`, options(headers, query));
  }

  createFoodPurchase(groupId: string, body: unknown, idempotencyKey: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<unknown>(`/groups/${groupId}/food-purchases`, body, {
      ...options(headers),
      headers: { ...headers, "Idempotency-Key": idempotencyKey },
    });
  }

  getFoodPurchase(groupId: string, purchaseId: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<unknown>(`/groups/${groupId}/food-purchases/${purchaseId}`, options(headers));
  }

  updateFoodPurchase(groupId: string, purchaseId: string, body: unknown, headers: ApiBodylessRequestOptions["headers"]) {
    return api.put<unknown>(`/groups/${groupId}/food-purchases/${purchaseId}`, body, options(headers));
  }

  deleteFoodPurchase(groupId: string, purchaseId: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.delete<void>(`/groups/${groupId}/food-purchases/${purchaseId}`, noContentOptions(headers));
  }

  checkout(body: { planCode: string; paymentMethod?: "PIX" | "BOLETO" | "CREDIT_CARD" | "DEBIT_CARD"; fakeCardLast4?: string; fakePixKey?: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<unknown>("/transactions/checkout", body, options(headers));
  }

  getTransaction(id: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<unknown>(`/transactions/${id}`, options(headers));
  }

  getMySubscription(headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<CurrentSubscription>("/subscriptions/me", options(headers));
  }

  cancelMySubscription(headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<unknown>("/subscriptions/me/cancel", undefined, options(headers));
  }

  reactivateMySubscription(headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<unknown>("/subscriptions/me/reactivate", undefined, options(headers));
  }

  listShoppingLists(stockId: number, headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number, status?: string) {
    return api.get<CorePage<unknown>>("/shopping-lists", options(headers, { stockId, page, size, status }));
  }
  createShoppingList(body: unknown, headers: ApiBodylessRequestOptions["headers"]) { return api.post<unknown>("/shopping-lists", body, options(headers)); }
  getShoppingList(id: string, headers: ApiBodylessRequestOptions["headers"]) { return api.get<unknown>(`/shopping-lists/${id}`, options(headers)); }
  cancelShoppingList(id: string, headers: ApiBodylessRequestOptions["headers"]) { return api.delete<void>(`/shopping-lists/${id}`, noContentOptions(headers)); }
  shoppingSuggestions(stockId: number, headers: ApiBodylessRequestOptions["headers"]) { return api.get<unknown[]>("/shopping-lists/suggestions", options(headers, { stockId })); }
  addShoppingItem(id: string, body: unknown, headers: ApiBodylessRequestOptions["headers"]) { return api.post<unknown>(`/shopping-lists/${id}/items`, body, options(headers)); }
  updateShoppingItem(id: string, itemId: number, body: unknown, headers: ApiBodylessRequestOptions["headers"]) { return api.put<unknown>(`/shopping-lists/${id}/items/${itemId}`, body, options(headers)); }
  deleteShoppingItem(id: string, itemId: number, headers: ApiBodylessRequestOptions["headers"]) { return api.delete<void>(`/shopping-lists/${id}/items/${itemId}`, noContentOptions(headers)); }
  clearPurchasedItems(id: string, headers: ApiBodylessRequestOptions["headers"]) { return api.delete<void>(`/shopping-lists/${id}/purchased-items`, noContentOptions(headers)); }
  completeShoppingList(id: string, body: unknown, headers: ApiBodylessRequestOptions["headers"]) { return api.post<unknown>(`/shopping-lists/${id}/complete`, body, options(headers)); }
  listRecipes(headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number, name?: string) { return api.get<CorePage<CoreRecipe>>("/recipes", { ...options(headers, { page, size, name }), responseSchema: coreRecipePageSchema }); }
  listFavoriteRecipes(headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number) { return api.get<CorePage<CoreRecipe>>("/recipes/favorites", { ...options(headers, { page, size }), responseSchema: coreRecipePageSchema }); }
  getRecipe(id: number, headers: ApiBodylessRequestOptions["headers"]) { return api.get<CoreRecipe>(`/recipes/${id}`, { ...options(headers), responseSchema: coreRecipeSchema }); }
  getRecipeAvailability(id: number, headers: ApiBodylessRequestOptions["headers"], stockId?: number) { return api.get<CoreRecipeAvailability[]>(`/recipes/${id}/availability`, { ...options(headers, { stockId }), responseSchema: coreRecipeAvailabilityListSchema }); }
  recipeSuggestions(headers: ApiBodylessRequestOptions["headers"], stockId?: number, limit?: number) { return api.get<unknown[]>("/recipes/suggestions", options(headers, { stockId, limit }, 30_000)); }
  favoriteRecipe(id: number, favorite: boolean, headers: ApiBodylessRequestOptions["headers"]) { return favorite ? api.put<void>(`/recipes/${id}/favorite`, undefined, noContentOptions(headers)) : api.delete<void>(`/recipes/${id}/favorite`, noContentOptions(headers)); }
  chatWithRecipeAi(body: { message: string; stockId: number; sessionId?: string; foodPreferences?: string[] }, headers: ApiBodylessRequestOptions["headers"]) { return api.post<unknown>("/ai/recipes/chat", body, options(headers, undefined, 120_000)); }
  recipeAiSuggestions(stockId: number, headers: ApiBodylessRequestOptions["headers"]) { return api.get<unknown[]>(`/ai/recipes/suggestions/stock/${stockId}`, options(headers)); }
  listNotifications(headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number, unread = false) { return api.get<CorePage<CoreNotification>>(unread ? "/notifications/unread" : "/notifications", { ...options(headers, { page, size }), responseSchema: coreNotificationPageSchema }); }
  unreadCount(headers: ApiBodylessRequestOptions["headers"]) { return api.get<{ count: number }>("/notifications/unread-count", { ...options(headers), responseSchema: coreUnreadCountSchema }); }
  markNotificationRead(id: string, headers: ApiBodylessRequestOptions["headers"]) { return api.patch<CoreNotification>(`/notifications/${id}/read`, undefined, { ...options(headers), responseSchema: coreNotificationSchema }); }
  markAllNotificationsRead(headers: ApiBodylessRequestOptions["headers"]) { return api.patch<void>("/notifications/read-all", undefined, noContentOptions(headers)); }
  clearNotifications(headers: ApiBodylessRequestOptions["headers"]) { return api.delete<void>("/notifications", noContentOptions(headers)); }
  getPreferences(headers: ApiBodylessRequestOptions["headers"]) { return api.get<unknown>("/profile/preferences", options(headers)); }
  updatePreferences(body: unknown, headers: ApiBodylessRequestOptions["headers"]) { return api.put<unknown>("/profile/preferences", body, options(headers)); }
  listInvitations(groupId: string, headers: ApiBodylessRequestOptions["headers"]) { return api.get<unknown[]>(`/groups/${groupId}/invitations`, options(headers)); }
  createInvitation(groupId: string, body: unknown, headers: ApiBodylessRequestOptions["headers"]) { return api.post<unknown>(`/groups/${groupId}/invitations`, body, options(headers)); }
  setMemberRole(groupId: string, userId: string, body: unknown, headers: ApiBodylessRequestOptions["headers"]) { return api.patch<unknown>(`/groups/${groupId}/members/${userId}/role`, body, options(headers)); }
  listExpenses(groupId: string, headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number) { return api.get<CorePage<unknown>>(`/commercial/groups/${groupId}/expenses`, options(headers, { page, size })); }
  createExpense(groupId: string, body: unknown, headers: ApiBodylessRequestOptions["headers"]) { return api.post<unknown>(`/commercial/groups/${groupId}/expenses`, body, options(headers)); }
  monthlyReport(groupId: string, month: string, headers: ApiBodylessRequestOptions["headers"]) { return api.get<unknown>(`/commercial/groups/${groupId}/reports/monthly`, options(headers, { month })); }
  listEmployees(groupId: string, headers: ApiBodylessRequestOptions["headers"]) { return api.get<unknown[]>(`/commercial/groups/${groupId}/employees`, options(headers)); }
  inviteEmployee(groupId: string, body: unknown, headers: ApiBodylessRequestOptions["headers"]) { return api.post<unknown>(`/commercial/groups/${groupId}/employees/invitations`, body, options(headers)); }
}

export const coreApiService = new CoreApiService();
