import { AppException } from "./app.exception.js";

export class NotFoundException extends AppException {
  constructor(
    message: string = "Recurso não encontrado",
    displayMessage = "Não foi possível encontrar o recurso solicitado",
  ) {
    super({
      status: 404,
      code: "NOT_FOUND",
      message,
      displayMessage,
    });
  }
}
