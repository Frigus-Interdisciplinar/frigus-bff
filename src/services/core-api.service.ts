import { api } from "../utils/index.js";
import type { ApiBodylessRequestOptions } from "../types/index.js";
import type {
  CoreConversation,
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

  createDiscard(body: { stockProductId: number; reason?: string }, headers: ApiBodylessRequestOptions["headers"]) {
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

  getMySubscription(headers: ApiBodylessRequestOptions["headers"]) {
    return api.get<unknown>("/subscriptions/me", options(headers));
  }

  cancelMySubscription(headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<unknown>("/subscriptions/me/cancel", undefined, options(headers));
  }

  reactivateMySubscription(headers: ApiBodylessRequestOptions["headers"]) {
    return api.post<unknown>("/subscriptions/me/reactivate", undefined, options(headers));
  }
}

export const coreApiService = new CoreApiService();
