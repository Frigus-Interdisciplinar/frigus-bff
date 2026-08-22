import { AppException } from "./app.exception.js";
import type { FieldError } from "../types/fields-error.type.js";

export class UnprocessableEntityException extends AppException {
  constructor(
    message = "Entidade improcessável",
    displayMessage = "Não foi possível processar as instruções enviadas",
    fields?: FieldError[],
  ) {
    super({
      status: 422,
      code: "UNPROCESSABLE_ENTITY",
      message,
      displayMessage,
      fields,
    });
  }
}
