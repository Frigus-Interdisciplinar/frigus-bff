import { AppException } from "./app.exception.js";
import type { FieldError } from "../types/fields-error.type.js";

export class BadRequestException extends AppException {
  constructor(
    message: string = "Requisição inválida",
    displayMessage = "Não foi possível processar a requisição",
    fields?: FieldError[],
  ) {
    super({
      status: 400,
      code: "BAD_REQUEST",
      message,
      displayMessage,
      fields,
    });
  }
}