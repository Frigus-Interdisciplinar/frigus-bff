export type PlanCode =
  | "FREE"
  | "PLUS"
  | "FAMILY"
  | "COMMERCIAL"
  | "ENTERPRISE";

export interface PlanLimits {
  planCode: PlanCode;
  maxGroupMembers: number;
  maxStocks: number;
  maxProductsPerStock: number;
  allowOwnProducts: boolean;
  allowSavedRecipes: boolean;
  allowMoneySaving: boolean;
  isEnterprise: boolean;
  costPerPublishedAd?: number;
  hasMonthlyReport: boolean;
}
