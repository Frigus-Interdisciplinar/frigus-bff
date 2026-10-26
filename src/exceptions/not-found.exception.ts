import { AppException } from "./app.exception.js";

export class NotFoundException extends AppException {
  constructor(
    message: string = "Recurso não encontrado",
    displayMessage = "Não foi possível encontrar o recurso solicitado",
    code = "NOT_FOUND",
  ) {
    super({
      status: 404,
      code,
      message,
      displayMessage,
    });
  }
}
