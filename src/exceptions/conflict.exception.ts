import { AppException } from "./app.exception.js";

export class ConflictException extends AppException {
  constructor(
    message: string = "Conflito",
    displayMessage = "Não foi possível processar a requisição",
  ) {
    super({
      status: 409,
      code: "CONFLICT",
      message,
      displayMessage,
    });
  }
}