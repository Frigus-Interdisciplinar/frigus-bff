import type { ApiBodylessRequestOptions } from "../types/index.js";
import { ForbiddenException } from "../exceptions/index.js";
import { profileService } from "./profile.service.js";
import { coreApiService } from "./core-api.service.js";

/** MoneySaving is a commercial-account feature and still obeys the Core plan entitlement. */
export async function assertCommercialMoneySavingAccess(headers: ApiBodylessRequestOptions["headers"]): Promise<void> {
  const [profile, planLimits] = await Promise.all([
    profileService.getProfile({ headers }),
    coreApiService.getMyPlanLimits(headers),
  ]);

  if (profile.accountType !== "COMMERCIAL" && profile.accountType !== "BUSINESS") {
    throw new ForbiddenException(
      "MoneySaving está disponível apenas para contas comerciais",
      "Este recurso está disponível no perfil comercial",
      "COMMERCIAL_ACCOUNT_REQUIRED",
    );
  }

  if (!planLimits.allowMoneySaving) {
    throw new ForbiddenException(
      "O plano atual não inclui MoneySaving",
      "Escolha um plano comercial com acesso ao MoneySaving",
      "MONEY_SAVING_PLAN_REQUIRED",
    );
  }
}
