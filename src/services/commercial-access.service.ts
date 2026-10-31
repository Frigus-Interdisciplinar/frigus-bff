import type { ApiBodylessRequestOptions } from "../types/index.js";
import { ForbiddenException } from "../exceptions/index.js";
import { profileService } from "./profile.service.js";
import { coreApiService } from "./core-api.service.js";

/** MoneySaving is available for commercial accounts and domestic accounts with plan entitlement (PLUS/FAMILY). */
export async function assertCommercialMoneySavingAccess(headers: ApiBodylessRequestOptions["headers"]): Promise<void> {
  const [profile, planLimits] = await Promise.all([
    profileService.getProfile({ headers }),
    coreApiService.getMyPlanLimits(headers),
  ]);

  if (!planLimits.allowMoneySaving) {
    throw new ForbiddenException(
      "O plano atual não inclui MoneySaving",
      "Escolha um plano Plus, Família ou Comercial com acesso ao MoneySaving",
      "MONEY_SAVING_PLAN_REQUIRED",
    );
  }
}
