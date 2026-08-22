import assert from "node:assert/strict";
import { AxiosError, type AxiosResponse } from "axios";
import { z } from "zod";
import { Hono } from "hono";
import {
  api,
  axiosInstance,
  createAxiosInstance,
  handleAxiosError,
} from "../index.js";
import {
  AppException,
  BadRequestException,
  BadGatewayException,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "../../exceptions/index.js";
import { errorHandler } from "../../middlewares/index.js";

async function runTests() {
  console.log("🧪 Starting validation tests for utils & exceptions...\n");

  // 1. Test createAxiosInstance & axiosInstance
  console.log("▶ Testing axios-instance...");
  assert.ok(axiosInstance, "Default axiosInstance should be defined");
  const customInstance = createAxiosInstance({
    baseURL: "http://custom-url:9000",
    timeout: 5000,
  });
  assert.equal(customInstance.defaults.baseURL, "http://custom-url:9000");
  assert.equal(customInstance.defaults.timeout, 5000);
  console.log("✔ axios-instance passed!\n");

  // 2. Test Exception classes and toJSON()
  console.log("▶ Testing AppException classes and toJSON()...");
  const badReq = new BadRequestException("Mensagem teste", "Display teste", [
    { fieldName: "email", errorMessage: "Email inválido" },
  ]);
  assert.equal(badReq.status, 400);
  assert.equal(badReq.code, "BAD_REQUEST");
  assert.equal(badReq.message, "Mensagem teste");
  assert.equal(badReq.displayMessage, "Display teste");
  assert.equal(badReq.fields?.length, 1);
  assert.ok(badReq.timestamp, "Timestamp must be defined");

  const badReqJson = badReq.toJSON();
  assert.equal(badReqJson.status, 400);
  assert.equal(badReqJson.code, "BAD_REQUEST");
  assert.equal(badReqJson.message, "Mensagem teste");
  assert.equal(badReqJson.fields?.[0].fieldName, "email");

  const notFound = new NotFoundException();
  assert.equal(notFound.status, 404);
  assert.equal(notFound.code, "NOT_FOUND");

  const unauth = new UnauthorizedException();
  assert.equal(unauth.status, 401);
  assert.equal(unauth.code, "UNAUTHORIZED");

  const forbidden = new ForbiddenException();
  assert.equal(forbidden.status, 403);
  assert.equal(forbidden.code, "FORBIDDEN");

  const conflict = new ConflictException();
  assert.equal(conflict.status, 409);
  assert.equal(conflict.code, "CONFLICT");

  const unprocessable = new UnprocessableEntityException();
  assert.equal(unprocessable.status, 422);
  assert.equal(unprocessable.code, "UNPROCESSABLE_ENTITY");

  const serverError = new InternalServerErrorException();
  assert.equal(serverError.status, 500);
  assert.equal(serverError.code, "INTERNAL_SERVER_ERROR");

  const badGateway = new BadGatewayException();
  assert.equal(badGateway.status, 502);
  assert.equal(badGateway.code, "BAD_GATEWAY");

  const serviceUnavail = new ServiceUnavailableException();
  assert.equal(serviceUnavail.status, 503);
  assert.equal(serviceUnavail.code, "SERVICE_UNAVAILABLE");

  const gatewayTimeout = new GatewayTimeoutException();
  assert.equal(gatewayTimeout.status, 504);
  assert.equal(gatewayTimeout.code, "GATEWAY_TIMEOUT");
  console.log("✔ Exceptions & toJSON passed!\n");

  // 3. Test handleAxiosError status code mapping
  console.log("▶ Testing handleAxiosError status code mappings...");
  const createMockAxiosError = (status: number, data?: any, code?: string) => {
    const error = new AxiosError("Request failed");
    if (code) error.code = code;
    if (status > 0) {
      error.response = {
        status,
        statusText: "Error",
        headers: {},
        config: {} as any,
        data: data ?? {
          status,
          code: `CODE_${status}`,
          message: `Error msg ${status}`,
          displayMessage: `Display msg ${status}`,
        },
      } as AxiosResponse;
    }
    return error;
  };

  assert.throws(
    () => handleAxiosError(createMockAxiosError(400)),
    BadRequestException,
  );
  assert.throws(
    () => handleAxiosError(createMockAxiosError(401)),
    UnauthorizedException,
  );
  assert.throws(
    () => handleAxiosError(createMockAxiosError(403)),
    ForbiddenException,
  );
  assert.throws(
    () => handleAxiosError(createMockAxiosError(404)),
    NotFoundException,
  );
  assert.throws(
    () => handleAxiosError(createMockAxiosError(409)),
    ConflictException,
  );
  assert.throws(
    () => handleAxiosError(createMockAxiosError(422)),
    UnprocessableEntityException,
  );
  assert.throws(
    () => handleAxiosError(createMockAxiosError(500)),
    InternalServerErrorException,
  );
  assert.throws(
    () => handleAxiosError(createMockAxiosError(502)),
    BadGatewayException,
  );
  assert.throws(
    () => handleAxiosError(createMockAxiosError(503)),
    ServiceUnavailableException,
  );
  assert.throws(
    () => handleAxiosError(createMockAxiosError(504)),
    GatewayTimeoutException,
  );

  // 4. Test Network & Timeout error mapping
  console.log("▶ Testing network & timeout error mappings...");
  assert.throws(
    () => handleAxiosError(createMockAxiosError(0, undefined, "ECONNABORTED")),
    GatewayTimeoutException,
  );
  assert.throws(
    () => handleAxiosError(createMockAxiosError(0, undefined, "ECONNREFUSED")),
    BadGatewayException,
  );
  assert.throws(
    () => handleAxiosError(createMockAxiosError(0, undefined, "ERR_NETWORK")),
    BadGatewayException,
  );
  console.log("✔ Error mapper passed!\n");

  // 5. Test api method existence and signatures
  console.log("▶ Testing api helper methods...");
  assert.equal(typeof api, "function");
  assert.equal(typeof api.get, "function");
  assert.equal(typeof api.post, "function");
  assert.equal(typeof api.put, "function");
  assert.equal(typeof api.patch, "function");
  assert.equal(typeof api.delete, "function");
  console.log("✔ api helpers passed!\n");

  // 6. Test Hono errorHandler middleware integration
  console.log("▶ Testing Hono errorHandler middleware...");
  const testApp = new Hono();
  testApp.onError(errorHandler);

  testApp.get("/test-app-exception", () => {
    throw new NotFoundException("Usuário não encontrado", "Ops! Não encontramos");
  });

  testApp.post("/test-zod", (c) => {
    const schema = z.object({
      email: z.string().email("Formato de e-mail inválido"),
    });
    schema.parse({});
    return c.json({ ok: true });
  });

  testApp.get("/test-generic-error", () => {
    throw new Error("Erro desconhecido");
  });

  // AppException test
  const res1 = await testApp.request("/test-app-exception");
  assert.equal(res1.status, 404);
  const json1 = (await res1.json()) as any;
  assert.equal(json1.code, "NOT_FOUND");
  assert.equal(json1.displayMessage, "Ops! Não encontramos");

  // ZodError test
  const res2 = await testApp.request("/test-zod", { method: "POST" });
  assert.equal(res2.status, 400);
  const json2 = (await res2.json()) as any;
  assert.equal(json2.code, "BAD_REQUEST");
  assert.equal(json2.fields?.[0]?.fieldName, "email");

  // Generic error test
  const res3 = await testApp.request("/test-generic-error");
  assert.equal(res3.status, 500);
  const json3 = (await res3.json()) as any;
  assert.equal(json3.code, "INTERNAL_SERVER_ERROR");
  console.log("✔ Hono errorHandler middleware passed!\n");

  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
