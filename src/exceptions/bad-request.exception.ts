import { AppException } from "./app.exception.js";

export class BadRequestException extends AppException {
  constructor(
    message: string = "Requisição inválida",
    displayMessage = "Não foi possível processar a requisição",
  ) {
    super({
      status: 400,
      code: "BAD_REQUEST",
      message,
      displayMessage,
    });
  }
}