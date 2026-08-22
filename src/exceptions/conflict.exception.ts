import { AppException } from "./app.exception.js";
import type { FieldError } from "../types/fields-error.type.js";

export class ConflictException extends AppException {
  constructor(
    message: string = "Conflito",
    displayMessage = "Não foi possível processar a requisição",
    fields?: FieldError[],
  ) {
    super({
      status: 409,
      code: "CONFLICT",
      message,
      displayMessage,
      fields,
    });
  }
}