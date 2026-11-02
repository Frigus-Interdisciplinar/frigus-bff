import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { assertCommercialMoneySavingAccess } from "../src/services/commercial-access.service.js";
import { ForbiddenException } from "../src/exceptions/index.js";
import { axiosInstance } from "../src/utils/axios-instance.js";

const originalAdapter = axiosInstance.defaults.adapter;
afterEach(() => { axiosInstance.defaults.adapter = originalAdapter; });

for (const scenario of [
  { name: "active entitled subscription", status: "ACTIVE", end: "2999-01-01T00:00:00Z", allowed: true, passes: true },
  { name: "plan without entitlement", status: "ACTIVE", end: "2999-01-01T00:00:00Z", allowed: false, passes: false },
  { name: "expired period", status: "ACTIVE", end: "2000-01-01T00:00:00Z", allowed: true, passes: false },
  { name: "canceled subscription", status: "CANCELED", end: "2999-01-01T00:00:00Z", allowed: true, passes: false },
  { name: "missing period", status: "ACTIVE", end: null, allowed: true, passes: false },
  { name: "invalid period", status: "ACTIVE", end: "invalid", allowed: true, passes: false },
]) {
  test(`MoneySaving access: ${scenario.name}`, async () => {
    const requests: string[] = [];
    axiosInstance.defaults.adapter = async (config) => {
      requests.push(config.url!);
      assert.equal(config.headers.Authorization, "Bearer fixture");
      const data = config.url === "/subscriptions/me"
        ? { status: scenario.status, currentPeriodEnd: scenario.end }
        : {
            planCode: "COMMERCIAL",
            maxGroupsCreated: 3,
            maxGroupMembers: 10,
            maxStocks: 10,
            maxProductsPerStock: 500,
            allowOwnProducts: true,
            allowSavedRecipes: true,
            allowMoneySaving: scenario.allowed,
            isEnterprise: false,
            hasMonthlyReport: true,
          };
      return { config, status: 200, statusText: "OK", headers: {}, data };
    };
    const request = assertCommercialMoneySavingAccess({ Authorization: "Bearer fixture" });
    if (scenario.passes) await request;
    else await assert.rejects(request, ForbiddenException);
    assert.deepEqual(requests.sort(), ["/plans/me/limits", "/subscriptions/me"]);
  });
}
