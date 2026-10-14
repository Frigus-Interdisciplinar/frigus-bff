import { api } from "../utils/index.js";
import type { ApiBodylessRequestOptions } from "../types/index.js";
import type {
  CoreConversation,
  CoreAdvertisement,
  CoreAdvertisementStatus,
  CoreGroup,
  CorePage,
  CoreProduct,
  CoreStock,
  CoreStockMovement,
  CoreStockProduct,
} from "../types/core-api.type.js";

type Query = Record<string, string | number | boolean | undefined>;

const options = (headers: ApiBodylessRequestOptions["headers"], params?: Query) => ({
  headers,
  params,
});

/**
 * Thin, typed adapter around endpoints that are already implemented in core-api.
 * It intentionally does not manufacture data for features the core-api does not own.
 */
export class CoreApiService {
  listMyAdvertisements(headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number) {
    return api.get<CorePage<CoreAdvertisement>>("/advertisements/mine", options(headers, { page, size }));
  }

  listActiveAdvertisements(headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number) {
    return api.get<CorePage<CoreAdvertisement>>("/advertisements/active", options(headers, { page, size }));
  }

  createAdvertisement(body: unknown, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreAdvertisement>("/advertisements", body, options(headers));
  }

  updateAdvertisement(id: string, body: unknown, headers: ApiBodylessRequestOptions["headers"]) {
    return api.put<CoreAdvertisement>(`/advertisements/${id}`, body, options(headers));
  }

  updateAdvertisementStatus(id: string, status: CoreAdvertisementStatus, headers: ApiBodylessRequestOptions["headers"]) {
    return api.patch<CoreAdvertisement>(`/advertisements/${id}/status`, { status }, options(headers));
  }

  recordAdvertisementEvent(id: string, event: "impressions" | "clicks", headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<void>(`/advertisements/${id}/${event}`, undefined, options(headers));
  }

  getActiveContext(headers: ApiBodylessRequestOptions["headers"], groupId?: string) {
    return api.get<{ groupId: string; stocks: CoreStock[] }>("/stocks/active-context", options(headers, { groupId }));
  }

  getStockSummary(headers: ApiBodylessRequestOptions["headers"], groupId?: string) {
    return api.get<Record<string, unknown>>("/stocks/my-summary", options(headers, { groupId }));
  }
  listGroups(headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<CoreGroup[]>("/groups", options(headers));
  }

  getGroup(id: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<CoreGroup>(`/groups/${id}`, options(headers));
  }

  createGroup(body: { name: string; bannerPicture?: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreGroup>("/groups", body, options(headers));
  }

  updateGroup(id: string, body: { name?: string; bannerPicture?: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.put<CoreGroup>(`/groups/${id}`, body, options(headers));
  }

  addGroupMember(id: string, body: { userId: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreGroup>(`/groups/${id}/members`, body, options(headers));
  }

  removeGroupMember(id: string, userId: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.delete<void>(`/groups/${id}/members/${userId}`, options(headers));
  }

  listStocks(groupId: string, headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number) {
    return api.get<CorePage<CoreStock>>("/stocks", options(headers, { groupId, page, size }));
  }

  createStock(body: { groupId: string; name: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreStock>("/stocks", body, options(headers));
  }

  createGroupProduct(groupId: string, body: { name: string; category: string; storagePlace: string; unitPrice: number; unitOfMeasure: string; brand?: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreProduct>(`/groups/${groupId}/products`, body, options(headers));
  }

  listGroupProducts(groupId: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<CoreProduct[]>(`/groups/${groupId}/products`, options(headers));
  }

  updateStock(id: string, body: { groupId: string; name: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.put<CoreStock>(`/stocks/${id}`, body, options(headers));
  }

  listStockProducts(stockId: string, headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number) {
    return api.get<CorePage<CoreStockProduct>>("/stock-products", options(headers, { stockId, page, size }));
  }

  getStockProduct(id: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<CoreStockProduct>(`/stock-products/${id}`, options(headers));
  }

  createStockProduct(body: { productId: number; stockId: number; quantity: number; minimalQuantity?: number; expireDate: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreStockProduct>("/stock-products", body, options(headers));
  }

  updateStockProduct(id: string, body: { minimalQuantity?: number; expireDate: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.put<CoreStockProduct>(`/stock-products/${id}`, body, options(headers));
  }

  listMovements(stockProductId: string, headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number) {
    return api.get<CorePage<CoreStockMovement>>(`/stock-products/${stockProductId}/movements`, options(headers, { page, size }));
  }

  createMovement(stockProductId: string, body: { movementType: string; quantity: number }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreStockMovement>(`/stock-products/${stockProductId}/movements`, body, options(headers));
  }

  listProducts(page?: number, size?: number) {
    return api.get<CorePage<CoreProduct>>("/products", { params: { page, size } });
  }

  listDiscards(headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number) {
    return api.get<CorePage<unknown>>("/discard", options(headers, { page, size }));
  }

  createDiscard(body: { stockProductId: number; quantity: number; reason?: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<unknown>("/discard", body, options(headers));
  }

  listConversations(headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<CoreConversation[]>("/conversations", options(headers));
  }

  getConversation(id: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<CoreConversation>(`/conversations/${id}`, options(headers));
  }

  createGroupConversation(body: { groupId: string; name: string; participantUserIds?: string[] }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreConversation>("/conversations/group", body, options(headers));
  }

  createPrivateConversation(body: { targetUserId: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<CoreConversation>("/conversations/private", body, options(headers));
  }

  listMessages(id: string, headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number) {
    return api.get<CorePage<unknown>>(`/conversations/${id}/messages`, options(headers, { page, size }));
  }

  sendMessage(id: string, body: { content: string; messageType?: string; relatedShoppingListProductId?: number }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<unknown>(`/conversations/${id}/messages`, body, options(headers));
  }

  listPlans() {
    return api.get<unknown[]>("/plans/active");
  }

  checkout(body: { planCode: string; paymentMethod?: "PIX" | "BOLETO" | "CREDIT_CARD"; fakeCardLast4?: string; fakePixKey?: string }, headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<unknown>("/transactions/checkout", body, options(headers));
  }

  getTransaction(id: string, headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<unknown>(`/transactions/${id}`, options(headers));
  }

  getMySubscription(headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<unknown>("/subscriptions/me", options(headers));
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
  cancelShoppingList(id: string, headers: ApiBodylessRequestOptions["headers"]) { return api.delete<void>(`/shopping-lists/${id}`, options(headers)); }
  shoppingSuggestions(stockId: number, headers: ApiBodylessRequestOptions["headers"]) { return api.get<unknown[]>("/shopping-lists/suggestions", options(headers, { stockId })); }
  addShoppingItem(id: string, body: unknown, headers: ApiBodylessRequestOptions["headers"]) { return api.post<unknown>(`/shopping-lists/${id}/items`, body, options(headers)); }
  updateShoppingItem(id: string, itemId: number, body: unknown, headers: ApiBodylessRequestOptions["headers"]) { return api.patch<unknown>(`/shopping-lists/${id}/items/${itemId}`, body, options(headers)); }
  deleteShoppingItem(id: string, itemId: number, headers: ApiBodylessRequestOptions["headers"]) { return api.delete<void>(`/shopping-lists/${id}/items/${itemId}`, options(headers)); }
  clearPurchasedItems(id: string, headers: ApiBodylessRequestOptions["headers"]) { return api.delete<void>(`/shopping-lists/${id}/purchased-items`, options(headers)); }
  completeShoppingList(id: string, body: unknown, headers: ApiBodylessRequestOptions["headers"]) { return api.post<unknown>(`/shopping-lists/${id}/complete`, body, options(headers)); }
  listRecipes(headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number, name?: string) { return api.get<CorePage<unknown>>("/recipes", options(headers, { page, size, name })); }
  listFavoriteRecipes(headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number) { return api.get<CorePage<unknown>>("/recipes/favorites", options(headers, { page, size })); }
  getRecipe(id: number, headers: ApiBodylessRequestOptions["headers"]) { return api.get<unknown>(`/recipes/${id}`, options(headers)); }
  recipeSuggestions(headers: ApiBodylessRequestOptions["headers"], stockId?: number, limit?: number) { return api.get<unknown[]>("/recipes/suggestions", options(headers, { stockId, limit })); }
  favoriteRecipe(id: number, favorite: boolean, headers: ApiBodylessRequestOptions["headers"]) { return favorite ? api.put<void>(`/recipes/${id}/favorite`, undefined, options(headers)) : api.delete<void>(`/recipes/${id}/favorite`, options(headers)); }
  listNotifications(headers: ApiBodylessRequestOptions["headers"], page?: number, size?: number, unread = false) { return api.get<CorePage<unknown>>(unread ? "/notifications/unread" : "/notifications", options(headers, { page, size })); }
  unreadCount(headers: ApiBodylessRequestOptions["headers"]) { return api.get<{ count: number }>("/notifications/unread-count", options(headers)); }
  markNotificationRead(id: string, headers: ApiBodylessRequestOptions["headers"]) { return api.patch<unknown>(`/notifications/${id}/read`, undefined, options(headers)); }
  markAllNotificationsRead(headers: ApiBodylessRequestOptions["headers"]) { return api.patch<void>("/notifications/read-all", undefined, options(headers)); }
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
