import type { ApiBodylessRequestOptions } from "../types/index.js";
import { ForbiddenException } from "../exceptions/index.js";
import { coreApiService } from "./core-api.service.js";

/** MoneySaving access follows the active subscription's Core plan entitlement. */
export async function assertCommercialMoneySavingAccess(headers: ApiBodylessRequestOptions["headers"]): Promise<void> {
  const [subscription, planLimits] = await Promise.all([
    coreApiService.getMySubscription(headers),
    coreApiService.getMyPlanLimits(headers),
  ]);

  const periodEnd = subscription.currentPeriodEnd
    ? Date.parse(subscription.currentPeriodEnd)
    : Number.NaN;
  const hasActiveSubscription = subscription.status === "ACTIVE"
    && Number.isFinite(periodEnd)
    && periodEnd > Date.now();

  if (!planLimits.allowMoneySaving || !hasActiveSubscription) {
    throw new ForbiddenException(
      "A assinatura atual não inclui MoneySaving",
      "Mantenha uma assinatura ativa em um plano com acesso ao MoneySaving",
      "MONEY_SAVING_PLAN_REQUIRED",
    );
  }
}
