export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "primary"
  | "accent";

export type StorageLocation = "Despensa" | "Geladeira" | "Freezer";

// ==========================================
// 1. Estoque (Stock)
// ==========================================

export interface StockMovementItem {
  id: string | number;
  type: "CONSUMPTION" | "ENTRY" | "DISCARD";
  title: string;
  date: string;
  amount: string;
  isPositive: boolean;
}

export interface StockItemResponse {
  id: string;
  name: string;
  brand: string;
  category: string;
  quantity: string;
  location: StorageLocation;
  expiration: string;
  status: string;
  statusVariant: BadgeVariant;
  image?: string;
  daysRemaining?: number;
}

export interface StockItemDetailResponse {
  id: string;
  name: string;
  brand: string;
  category: string;
  quantity: string;
  unitOfMeasure: string;
  location: StorageLocation;
  expireDate: string;
  formattedExpireDate: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  statusVariant: BadgeVariant;
  daysRemaining: number;
  image?: string;
  movements: StockMovementItem[];
}

export interface StockCreateRequest {
  name: string;
  brand?: string;
  category: string;
  quantity: string;
  unitOfMeasure?: string;
  location: StorageLocation;
  expireDate: string;
  image?: string;
}

export interface StockUpdateRequest {
  name?: string;
  brand?: string;
  category?: string;
  quantity?: string;
  unitOfMeasure?: string;
  location?: StorageLocation;
  expireDate?: string;
  image?: string;
}

export interface StockConsumeRequest {
  quantity: string;
  notes?: string;
}

export interface StockBatchCreateRequest {
  items: StockCreateRequest[];
}

export interface StockSuggestedItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
}

// ==========================================
// 2. Dashboard
// ==========================================

export interface DashboardSummaryResponse {
  greeting: {
    userName: string;
    period: string;
    message: string;
  };
  hero: {
    title: string;
    subtitle: string;
    attentionCount: number;
    stockInOrderPercentage: number;
    sparkline: number[];
  };
  itemsToUseFirst: Array<{
    id: string;
    name: string;
    location: string;
    quantity: string;
    badgeText: string;
    badgeVariant: BadgeVariant;
  }>;
  weeklyConsumption: {
    totalItemsUsed: number;
    days: Array<{
      day: "S" | "T" | "Q" | "D";
      percentage: number;
      colorClass: string;
    }>;
  };
  distribution: {
    totalItems: number;
    pantryCount: number;
    fridgeCount: number;
    freshCount: number;
    frozenCount: number;
  };
  upcomingPurchases: {
    missingCount: number;
    items: Array<{
      id: string;
      name: string;
      qty: string;
      checked: boolean;
    }>;
  };
  recentUpdates: Array<{
    id: string;
    name: string;
    category: string;
    quantity: string;
    expiration: string;
    status: string;
    statusVariant: BadgeVariant;
  }>;
}

// ==========================================
// 3. Alertas (Alerts)
// ==========================================

export interface AlertItemResponse {
  id: string;
  name: string;
  detail: string;
  badge: string;
  badgeVariant: BadgeVariant;
  image?: string;
  type: "Validade" | "Quantidade" | "Vencidos";
}

export interface AlertsSummaryResponse {
  totalActiveAlerts: number;
  expiringSoonCount: number;
  expiredCount: number;
  lowStockCount: number;
  items: AlertItemResponse[];
  recipeSuggestion?: {
    id: string;
    title: string;
    category: string;
    prepTime: string;
    servings: string;
    description: string;
    image?: string;
  };
}

// ==========================================
// 4. Receitas (Recipes)
// ==========================================

export interface RecipeIngredientItem {
  id: string;
  name: string;
  quantity: string;
  isAvailableInStock: boolean;
}

export interface RecipeResponse {
  id: string;
  title: string;
  category: string;
  time: string;
  availableIngredientsText: string;
  availableIngredientsCount: number;
  totalIngredientsCount: number;
  image: string;
  isFavorite?: boolean;
}

export interface RecipeDetailResponse {
  id: string;
  title: string;
  category: string;
  time: string;
  portions: string;
  difficulty: string;
  description: string;
  image: string;
  ingredients: RecipeIngredientItem[];
  instructions: string[];
  isFavorite?: boolean;
}

export interface RecipeSuggestionResponse {
  banner: {
    title: string;
    subtitle: string;
    recipeId: string;
    image: string;
  };
  expiringIngredientsToUse: Array<{
    name: string;
    quantity: string;
  }>;
  recommendedRecipes: RecipeResponse[];
}

// ==========================================
// 5. Lista de Compras (Shopping List)
// ==========================================

export interface ShoppingListItemResponse {
  id: string;
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
  image?: string;
}

export interface ShoppingListSuggestion {
  name: string;
  desc: string;
  letter: string;
  category: string;
  quantity: string;
}

export interface ShoppingListResponse {
  id: string;
  missingStockAlertCount: number;
  pendingItems: ShoppingListItemResponse[];
  completedItems: ShoppingListItemResponse[];
}

export interface ShoppingListItemCreateRequest {
  name: string;
  category?: string;
  quantity?: string;
  image?: string;
}

export interface ShoppingListItemUpdateRequest {
  name?: string;
  category?: string;
  quantity?: string;
  checked?: boolean;
  image?: string;
}

// ==========================================
// 6. Notificações (Notifications)
// ==========================================

export interface NotificationItemResponse {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: "Estoque" | "Compras" | "Sistema";
  unread: boolean;
}

export interface NotificationsResponse {
  unreadCount: number;
  notifications: NotificationItemResponse[];
}

export interface NotificationPreferencesResponse {
  emailNotify: boolean;
  browserNotify: boolean;
  onlyImportant: boolean;
}

export interface NotificationPreferencesUpdateRequest {
  emailNotify?: boolean;
  browserNotify?: boolean;
  onlyImportant?: boolean;
}

// ==========================================
// 7. Configurações da Casa (Settings)
// ==========================================

export interface DomesticSettingsResponse {
  expiryReminder: boolean;
  shoppingReminder: boolean;
  weeklySummary: boolean;
  theme: "light" | "system" | "dark";
}

export interface DomesticSettingsUpdateRequest {
  expiryReminder?: boolean;
  shoppingReminder?: boolean;
  weeklySummary?: boolean;
  theme?: "light" | "system" | "dark";
}
