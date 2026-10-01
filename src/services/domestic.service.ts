import { api } from "../utils/index.js";
import type {
  ApiBodylessRequestOptions,
  DashboardSummaryResponse,
  StockItemResponse,
  StockItemDetailResponse,
  StockCreateRequest,
  StockUpdateRequest,
  StockConsumeRequest,
  StockBatchCreateRequest,
  StockSuggestedItem,
  AlertsSummaryResponse,
  RecipeResponse,
  RecipeDetailResponse,
  RecipeSuggestionResponse,
  ShoppingListResponse,
  ShoppingListItemResponse,
  ShoppingListItemCreateRequest,
  ShoppingListItemUpdateRequest,
  ShoppingListSuggestion,
  NotificationsResponse,
  NotificationPreferencesResponse,
  NotificationPreferencesUpdateRequest,
  DomesticSettingsResponse,
  DomesticSettingsUpdateRequest,
  StorageLocation,
} from "../types/index.js";

// Dados iniciais padrão para resiliência e apoio ao desenvolvimento frontend
const initialStockItems: StockItemResponse[] = [
  {
    id: "1",
    name: "Leite integral",
    brand: "Fazenda Bela",
    category: "Laticínios",
    quantity: "2 L",
    location: "Geladeira",
    expiration: "18 ago",
    status: "Dentro do prazo",
    statusVariant: "success",
    image: "/images/food-leite.png",
    daysRemaining: 3,
  },
  {
    id: "2",
    name: "Tomate italiano",
    brand: "Hortifruti",
    category: "Vegetais",
    quantity: "6 un",
    location: "Geladeira",
    expiration: "15 ago",
    status: "Vence em breve",
    statusVariant: "warning",
    image: "/images/food-tomate.png",
    daysRemaining: 1,
  },
  {
    id: "3",
    name: "Filé de frango",
    brand: "Seara",
    category: "Carnes",
    quantity: "1,2 kg",
    location: "Freezer",
    expiration: "22 set",
    status: "Dentro do prazo",
    statusVariant: "success",
    daysRemaining: 38,
  },
  {
    id: "4",
    name: "Banana prata",
    brand: "Hortifruti",
    category: "Frutas",
    quantity: "1 dúzia",
    location: "Despensa",
    expiration: "14 ago",
    status: "Vence em breve",
    statusVariant: "warning",
    image: "/images/food-banana.png",
    daysRemaining: 2,
  },
  {
    id: "5",
    name: "Feijão carioca",
    brand: "Camil",
    category: "Mercearia",
    quantity: "2 kg",
    location: "Despensa",
    expiration: "10 nov",
    status: "Dentro do prazo",
    statusVariant: "success",
    image: "/images/food-feijao.png",
    daysRemaining: 85,
  },
  {
    id: "6",
    name: "Iogurte natural",
    brand: "Nestlé",
    category: "Laticínios",
    quantity: "3 un",
    location: "Geladeira",
    expiration: "12 ago",
    status: "Vencido",
    statusVariant: "danger",
    image: "/images/food-iogurte.png",
    daysRemaining: -1,
  },
];

const initialShoppingItems: ShoppingListItemResponse[] = [
  {
    id: "1",
    name: "Queijo muçarela",
    category: "Laticínios",
    quantity: "40 g",
    checked: false,
  },
  {
    id: "2",
    name: "Tomate italiano",
    category: "Hortifruti",
    quantity: "6 un",
    checked: false,
    image: "/images/food-tomate.png",
  },
  {
    id: "3",
    name: "Café em pó",
    category: "Mercearia",
    quantity: "1 pct",
    checked: false,
  },
  {
    id: "4",
    name: "Macarrão penne",
    category: "Mercearia",
    quantity: "2 pct",
    checked: false,
  },
  {
    id: "5",
    name: "Banana prata",
    category: "Hortifruti",
    quantity: "6 un",
    checked: false,
    image: "/images/food-banana.png",
  },
  {
    id: "6",
    name: "Feijão carioca",
    category: "Mercearia",
    quantity: "1 pct",
    checked: false,
    image: "/images/food-feijao.png",
  },
  {
    id: "7",
    name: "Detergente líquido",
    category: "Limpeza",
    quantity: "2 un",
    checked: true,
  },
  {
    id: "8",
    name: "Pão de forma",
    category: "Padaria",
    quantity: "1 pct",
    checked: true,
  },
];

export class DomesticService {
  private stockMemory: StockItemResponse[] = [...initialStockItems];
  private shoppingMemory: ShoppingListItemResponse[] = [...initialShoppingItems];
  private notificationPreferences: NotificationPreferencesResponse = {
    emailNotify: true,
    browserNotify: false,
    onlyImportant: true,
  };
  private domesticSettings: DomesticSettingsResponse = {
    expiryReminder: true,
    shoppingReminder: true,
    weeklySummary: false,
    theme: "light",
  };

  // ==========================================
  // Dashboard
  // ==========================================
  async getDashboardSummary(options?: ApiBodylessRequestOptions): Promise<DashboardSummaryResponse> {
    try {
      // Tenta agregar dados da core-api se disponiveis
      const coreStock = await api.get<any>("/stocks/my-summary", options).catch(() => null);
      if (coreStock) return coreStock;
    } catch {
      // Fallback para os dados consolidados do BFF
    }

    const attentionItems = this.stockMemory.filter(
      (item) => item.statusVariant === "warning" || item.statusVariant === "danger",
    );
    const inOrderItems = this.stockMemory.filter((item) => item.statusVariant === "success");
    const stockInOrderPercentage = Math.round((inOrderItems.length / (this.stockMemory.length || 1)) * 100);

    return {
      greeting: {
        userName: "Henrique",
        period: "Bom dia",
        message: "Uma visão clara para aproveitar melhor cada item",
      },
      hero: {
        title: `${attentionItems.length} itens pedem atenção`,
        subtitle: "Você ainda consegue usá-los antes da validade.",
        attentionCount: attentionItems.length,
        stockInOrderPercentage,
        sparkline: [4, 7, 5, 10, 7],
      },
      itemsToUseFirst: attentionItems.slice(0, 3).map((item) => ({
        id: item.id,
        name: item.name,
        location: item.location,
        quantity: item.quantity,
        badgeText: item.expiration === "15 ago" ? "Amanhã" : "Hoje",
        badgeVariant: item.statusVariant as any,
      })),
      weeklyConsumption: {
        totalItemsUsed: 18,
        days: [
          { day: "S", percentage: 35, colorClass: "bg-frigus-primary" },
          { day: "T", percentage: 65, colorClass: "bg-frigus-primary" },
          { day: "Q", percentage: 50, colorClass: "bg-frigus-primary" },
          { day: "Q", percentage: 80, colorClass: "bg-frigus-secondary" },
          { day: "S", percentage: 55, colorClass: "bg-frigus-primary" },
          { day: "S", percentage: 90, colorClass: "bg-frigus-ice" },
          { day: "D", percentage: 70, colorClass: "bg-frigus-primary" },
        ],
      },
      distribution: {
        totalItems: 128,
        pantryCount: 46,
        fridgeCount: 31,
        freshCount: 28,
        frozenCount: 23,
      },
      upcomingPurchases: {
        missingCount: this.shoppingMemory.filter((i) => !i.checked).length,
        items: this.shoppingMemory.slice(0, 3).map((i) => ({
          id: i.id,
          name: i.name,
          qty: i.quantity,
          checked: i.checked,
        })),
      },
      recentUpdates: [
        {
          id: "1",
          name: "Leite",
          category: "Laticínios",
          quantity: "2 un.",
          expiration: "14 nov.",
          status: "Em dia",
          statusVariant: "success",
        },
        {
          id: "2",
          name: "Arroz integral",
          category: "Despensa",
          quantity: "1 kg",
          expiration: "28 nov.",
          status: "Em dia",
          statusVariant: "success",
        },
      ],
    };
  }

  // ==========================================
  // Estoque (Stock)
  // ==========================================
  async listStock(
    params?: { location?: string; category?: string; search?: string },
    _options?: ApiBodylessRequestOptions,
  ): Promise<StockItemResponse[]> {
    let filtered = [...this.stockMemory];

    if (params?.location && params.location !== "Todos") {
      filtered = filtered.filter((i) => i.location === params.location);
    }
    if (params?.category) {
      filtered = filtered.filter((i) => i.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.brand.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q),
      );
    }

    return filtered;
  }

  async getStockById(id: string, _options?: ApiBodylessRequestOptions): Promise<StockItemDetailResponse> {
    const item = this.stockMemory.find((i) => i.id === id) ?? this.stockMemory[0];

    return {
      id: item.id,
      name: item.name,
      brand: item.brand,
      category: item.category,
      quantity: item.quantity,
      unitOfMeasure: "Litro (L)",
      location: item.location,
      expireDate: "2026-08-18",
      formattedExpireDate: "18 de agosto de 2026",
      createdAt: "2026-08-02",
      updatedAt: "Hoje, 09:41",
      status: item.status,
      statusVariant: item.statusVariant,
      daysRemaining: item.daysRemaining ?? 3,
      image: item.image,
      movements: [
        {
          id: 1,
          type: "CONSUMPTION",
          title: "Consumo de 500 ml",
          date: "Ontem às 19:20",
          amount: "-500 ml",
          isPositive: false,
        },
        {
          id: 2,
          type: "ENTRY",
          title: "Entrada no estoque",
          date: "02 ago às 11:00",
          amount: `+${item.quantity}`,
          isPositive: true,
        },
      ],
    };
  }

  async createStockItem(
    body: StockCreateRequest,
    _options?: ApiBodylessRequestOptions,
  ): Promise<StockItemResponse> {
    const newItem: StockItemResponse = {
      id: String(Date.now()),
      name: body.name,
      brand: body.brand || "Geral",
      category: body.category,
      quantity: body.quantity,
      location: body.location,
      expiration: body.expireDate,
      status: "Dentro do prazo",
      statusVariant: "success",
      image: body.image,
      daysRemaining: 15,
    };
    this.stockMemory.unshift(newItem);
    return newItem;
  }

  async batchCreateStock(
    body: StockBatchCreateRequest,
    options?: ApiBodylessRequestOptions,
  ): Promise<StockItemResponse[]> {
    const created: StockItemResponse[] = [];
    for (const item of body.items) {
      created.push(await this.createStockItem(item, options));
    }
    return created;
  }

  async updateStockItem(
    id: string,
    body: StockUpdateRequest,
    _options?: ApiBodylessRequestOptions,
  ): Promise<StockItemResponse> {
    const index = this.stockMemory.findIndex((i) => i.id === id);
    if (index !== -1) {
      this.stockMemory[index] = {
        ...this.stockMemory[index],
        ...body,
        location: (body.location ?? this.stockMemory[index].location) as StorageLocation,
      };
      return this.stockMemory[index];
    }
    throw new Error("Item de estoque não encontrado");
  }

  async consumeStockItem(
    id: string,
    body: StockConsumeRequest,
    options?: ApiBodylessRequestOptions,
  ): Promise<{ success: boolean; message: string }> {
    // Tenta encaminhar descarte/consumo para core-api se aplicável
    await api
      .post("/discard", { stockProductId: Number(id) || 1, quantity: Number(body.quantity) || 1, reason: body.notes || "CONSUMPTION" }, options)
      .catch(() => null);

    return {
      success: true,
      message: `Consumo de ${body.quantity} registrado com sucesso`,
    };
  }

  async deleteStockItem(id: string, _options?: ApiBodylessRequestOptions): Promise<void> {
    this.stockMemory = this.stockMemory.filter((i) => i.id !== id);
  }

  async getStockSuggestions(_options?: ApiBodylessRequestOptions): Promise<StockSuggestedItem[]> {
    return [
      { id: "1", name: "Arroz integral", category: "Mercearia", quantity: "1 kg" },
      { id: "2", name: "Peito de frango", category: "Proteínas", quantity: "500 g" },
      { id: "3", name: "Alface crespa", category: "Hortifruti", quantity: "1 un." },
      { id: "4", name: "Iogurte natural", category: "Laticínios", quantity: "4 un." },
    ];
  }

  // ==========================================
  // Alertas (Alerts)
  // ==========================================
  async getAlertsSummary(_options?: ApiBodylessRequestOptions): Promise<AlertsSummaryResponse> {
    const items = [
      {
        id: "2",
        name: "Tomate italiano",
        detail: "6 unidades • Geladeira",
        badge: "Vence amanhã",
        badgeVariant: "warning" as const,
        image: "/images/food-tomate.png",
        type: "Validade" as const,
      },
      {
        id: "6",
        name: "Iogurte natural",
        detail: "3 unidades • Geladeira",
        badge: "Vencido há 1 dia",
        badgeVariant: "danger" as const,
        image: "/images/food-iogurte.png",
        type: "Vencidos" as const,
      },
      {
        id: "7",
        name: "Ovos brancos",
        detail: "4 unidades • Geladeira",
        badge: "Vence em 2 dias",
        badgeVariant: "warning" as const,
        type: "Validade" as const,
      },
      {
        id: "8",
        name: "Azeite de oliva",
        detail: "Restam 120 ml • Despensa",
        badge: "Quantidade baixa",
        badgeVariant: "info" as const,
        type: "Quantidade" as const,
      },
    ];

    return {
      totalActiveAlerts: 11,
      expiringSoonCount: 6,
      expiredCount: 2,
      lowStockCount: 3,
      items,
      recipeSuggestion: {
        id: "1",
        title: "Omelete de tomate",
        category: "Café da manhã",
        prepTime: "15 min",
        servings: "2 porções",
        description: "Aproveita os tomates da geladeira que vencem amanhã.",
        image: "/images/omelete.png",
      },
    };
  }

  // ==========================================
  // Receitas (Recipes)
  // ==========================================
  async listRecipes(
    params?: { search?: string; category?: string; onlyAvailable?: boolean },
    _options?: ApiBodylessRequestOptions,
  ): Promise<RecipeResponse[]> {
    const catalog: RecipeResponse[] = [
      {
        id: "1",
        title: "Omelete de tomate",
        category: "Café da manhã",
        time: "15 min",
        availableIngredientsText: "4 de 5 ingredientes disponíveis",
        availableIngredientsCount: 4,
        totalIngredientsCount: 5,
        image: "/images/omelete.png",
        isFavorite: true,
      },
      {
        id: "2",
        title: "Arroz cremoso de legumes",
        category: "Almoço",
        time: "25 min",
        availableIngredientsText: "5 de 7 ingredientes disponíveis",
        availableIngredientsCount: 5,
        totalIngredientsCount: 7,
        image: "/images/arroz-cremoso.png",
        isFavorite: false,
      },
      {
        id: "3",
        title: "Frango com legumes",
        category: "Jantar",
        time: "35 min",
        availableIngredientsText: "3 de 4 ingredientes disponíveis",
        availableIngredientsCount: 3,
        totalIngredientsCount: 4,
        image: "/images/frango-legumes.png",
        isFavorite: false,
      },
    ];

    let result = [...catalog];
    if (params?.search) {
      result = result.filter((r) => r.title.toLowerCase().includes(params.search!.toLowerCase()));
    }
    if (params?.category) {
      result = result.filter((r) => r.category.toLowerCase() === params.category!.toLowerCase());
    }
    return result;
  }

  async getRecipeSuggestions(_options?: ApiBodylessRequestOptions): Promise<RecipeSuggestionResponse> {
    const recommended = await this.listRecipes();
    return {
      banner: {
        title: "Cozinhe com o que você já tem",
        subtitle: "Encontramos 8 receitas com ingredientes disponíveis no seu estoque",
        recipeId: "1",
        image: "/images/omelete-tomate.png",
      },
      expiringIngredientsToUse: [
        { name: "Tomate", quantity: "6 un." },
        { name: "Ovos", quantity: "4 un." },
        { name: "Iogurte", quantity: "3 un." },
      ],
      recommendedRecipes: recommended,
    };
  }

  async getRecipeById(id: string, _options?: ApiBodylessRequestOptions): Promise<RecipeDetailResponse> {
    return {
      id,
      title: "Omelete de tomate",
      category: "Café da manhã",
      time: "15 min",
      portions: "2 porções",
      difficulty: "Fácil",
      description: "Uma refeição leve, rápida e que aproveita os tomates frescos da geladeira.",
      image: "/images/omelete.png",
      ingredients: [
        { id: "1", name: "Ovos brancos", quantity: "3 un", isAvailableInStock: true },
        { id: "2", name: "Tomate italiano picado", quantity: "2 un", isAvailableInStock: true },
        { id: "3", name: "Queijo muçarela ralado", quantity: "40 g", isAvailableInStock: false },
        { id: "4", name: "Azeite de oliva", quantity: "1 colher", isAvailableInStock: true },
        { id: "5", name: "Sal e pimenta", quantity: "a gosto", isAvailableInStock: true },
      ],
      instructions: [
        "Bata os ovos com uma pitada de sal e pimenta em um recipiente.",
        "Aqueça uma frigideira com o azeite de oliva em fogo médio.",
        "Despeje os ovos batidos e adicione os tomates picados uniformemente.",
        "Deixe dourar por baixo e dobre ao meio antes de servir quentinho.",
      ],
      isFavorite: true,
    };
  }

  async toggleRecipeFavorite(id: string, _options?: ApiBodylessRequestOptions): Promise<{ isFavorite: boolean }> {
    return { isFavorite: true };
  }

  // ==========================================
  // Lista de Compras (Shopping List)
  // ==========================================
  async getShoppingList(_options?: ApiBodylessRequestOptions): Promise<ShoppingListResponse> {
    return {
      id: "sl-default",
      missingStockAlertCount: 3,
      pendingItems: this.shoppingMemory.filter((i) => !i.checked),
      completedItems: this.shoppingMemory.filter((i) => i.checked),
    };
  }

  async addShoppingListItem(
    body: ShoppingListItemCreateRequest,
    _options?: ApiBodylessRequestOptions,
  ): Promise<ShoppingListItemResponse> {
    const newItem: ShoppingListItemResponse = {
      id: String(Date.now()),
      name: body.name,
      category: body.category || "Mercearia",
      quantity: body.quantity || "1 un",
      checked: false,
      image: body.image,
    };
    this.shoppingMemory.unshift(newItem);
    return newItem;
  }

  async toggleShoppingListItem(
    id: string,
    _options?: ApiBodylessRequestOptions,
  ): Promise<ShoppingListItemResponse> {
    const item = this.shoppingMemory.find((i) => i.id === id);
    if (item) {
      item.checked = !item.checked;
      return item;
    }
    throw new Error("Item da lista de compras não encontrado");
  }

  async updateShoppingListItem(
    id: string,
    body: ShoppingListItemUpdateRequest,
    _options?: ApiBodylessRequestOptions,
  ): Promise<ShoppingListItemResponse> {
    const item = this.shoppingMemory.find((i) => i.id === id);
    if (item) {
      if (body.name !== undefined) item.name = body.name;
      if (body.category !== undefined) item.category = body.category;
      if (body.quantity !== undefined) item.quantity = body.quantity;
      if (body.checked !== undefined) item.checked = body.checked;
      if (body.image !== undefined) item.image = body.image;
      return item;
    }
    throw new Error("Item da lista de compras não encontrado");
  }

  async deleteShoppingListItem(id: string, _options?: ApiBodylessRequestOptions): Promise<void> {
    this.shoppingMemory = this.shoppingMemory.filter((i) => i.id !== id);
  }

  async clearCompletedShoppingList(_options?: ApiBodylessRequestOptions): Promise<void> {
    this.shoppingMemory = this.shoppingMemory.filter((i) => !i.checked);
  }

  async getShoppingListSuggestions(_options?: ApiBodylessRequestOptions): Promise<ShoppingListSuggestion[]> {
    return [
      {
        name: "Leite integral",
        desc: "Estoque baixo • resta 1 L",
        letter: "L",
        category: "Laticínios",
        quantity: "2 L",
      },
      {
        name: "Ovos brancos",
        desc: "Acabando • restam 2 un.",
        letter: "O",
        category: "Proteínas",
        quantity: "1 dúzia",
      },
      {
        name: "Azeite de oliva",
        desc: "Estoque baixo • resta 120 ml",
        letter: "A",
        category: "Mercearia",
        quantity: "500 ml",
      },
    ];
  }

  // ==========================================
  // Notificações (Notifications)
  // ==========================================
  async listNotifications(_options?: ApiBodylessRequestOptions): Promise<NotificationsResponse> {
    const list = [
      {
        id: "1",
        title: "Tomates vencem amanhã",
        desc: "Use os tomates em uma receita ou adicione à lista de compras.",
        time: "há 12 min",
        type: "Estoque" as const,
        unread: true,
      },
      {
        id: "2",
        title: "Marina atualizou a lista de compras",
        desc: "Foram adicionados leite integral e aveia.",
        time: "há 1 h",
        type: "Compras" as const,
        unread: true,
      },
      {
        id: "3",
        title: "Azeite de oliva está com pouco estoque",
        desc: "Restam 120 ml na despensa.",
        time: "ontem",
        type: "Estoque" as const,
        unread: true,
      },
      {
        id: "4",
        title: "Seu resumo mensal está pronto",
        desc: "Veja quanto sua casa evitou desperdiçar neste mês.",
        time: "terça-feira",
        type: "Sistema" as const,
        unread: false,
      },
    ];
    return {
      unreadCount: list.filter((n) => n.unread).length,
      notifications: list,
    };
  }

  async markAllNotificationsRead(_options?: ApiBodylessRequestOptions): Promise<{ success: boolean }> {
    return { success: true };
  }

  async markNotificationRead(id: string, _options?: ApiBodylessRequestOptions): Promise<{ id: string; unread: boolean }> {
    return { id, unread: false };
  }

  async getNotificationPreferences(_options?: ApiBodylessRequestOptions): Promise<NotificationPreferencesResponse> {
    return this.notificationPreferences;
  }

  async updateNotificationPreferences(
    body: NotificationPreferencesUpdateRequest,
    _options?: ApiBodylessRequestOptions,
  ): Promise<NotificationPreferencesResponse> {
    this.notificationPreferences = {
      ...this.notificationPreferences,
      ...body,
    };
    return this.notificationPreferences;
  }

  // ==========================================
  // Configurações Domésticas (Settings)
  // ==========================================
  async getDomesticSettings(_options?: ApiBodylessRequestOptions): Promise<DomesticSettingsResponse> {
    return this.domesticSettings;
  }

  async updateDomesticSettings(
    body: DomesticSettingsUpdateRequest,
    _options?: ApiBodylessRequestOptions,
  ): Promise<DomesticSettingsResponse> {
    this.domesticSettings = {
      ...this.domesticSettings,
      ...body,
    };
    return this.domesticSettings;
  }
}

export const domesticService = new DomesticService();
