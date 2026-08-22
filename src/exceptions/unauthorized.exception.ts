import { AppException } from "./app.exception.js";

export class UnauthorizedException extends AppException {
  constructor(
    message: string = "Não autorizado",
    displayMessage = "Não foi possível autorizar o acesso",
  ) {
    super({
      status: 401,
      code: "UNAUTHORIZED",
      message,
      displayMessage,
    });
  }
}