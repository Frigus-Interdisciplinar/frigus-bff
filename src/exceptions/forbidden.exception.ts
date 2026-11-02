import { AppException } from "./app.exception.js";

export class ForbiddenException extends AppException {
  constructor(
    message: string = "Proibido",
    displayMessage = "Não foi possível autorizar o acesso",
    code = "FORBIDDEN",
  ) {
    super({
      status: 403,
      code,
      message,
      displayMessage,
    });
  }
}
