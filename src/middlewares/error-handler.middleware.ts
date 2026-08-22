import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";
import {
  AppException,
  BadRequestException,
  InternalServerErrorException,
} from "../exceptions/index.js";
import type { FieldError } from "../types/index.js";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppException) {
    return c.json(err.toJSON(), err.status as ContentfulStatusCode);
  }

  if (err instanceof ZodError) {
    const fields: FieldError[] = err.issues.map((issue) => ({
      fieldName: issue.path.join(".") || "body",
      errorMessage: issue.message,
      displayMessage: issue.message,
    }));

    const badRequest = new BadRequestException(
      "Erro de validação dos campos da requisição",
      "Dados inválidos enviados. Verifique os campos e tente novamente.",
      fields,
    );

    return c.json(badRequest.toJSON(), 400);
  }

  // Generic or unexpected error
  console.error("[ErrorHandler] Unhandled exception:", err);

  const internalError = new InternalServerErrorException(
    err instanceof Error ? err.message : "Erro interno do servidor",
    "Ocorreu um erro inesperado. Tente novamente mais tarde.",
  );

  return c.json(internalError.toJSON(), 500);
};
