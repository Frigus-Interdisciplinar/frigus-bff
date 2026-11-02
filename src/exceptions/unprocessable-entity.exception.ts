import { AppException } from "./app.exception.js";
import type { FieldError } from "../types/fields-error.type.js";

export class UnprocessableEntityException extends AppException {
  constructor(
    message = "Entidade improcessável",
    displayMessage = "Não foi possível processar as instruções enviadas",
    fields?: FieldError[],
    code = "UNPROCESSABLE_ENTITY",
  ) {
    super({
      status: 422,
      code,
      message,
      displayMessage,
      fields,
    });
  }
}
