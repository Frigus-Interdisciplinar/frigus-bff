import { AppException } from "./app.exception.js";

export class ServiceUnavailableException extends AppException {
  constructor(
    message: string = "Serviço indisponível",
    displayMessage = "Não foi possível processar a requisição",
  ) {
    super({
      status: 503,
      code: "SERVICE_UNAVAILABLE",
      message,
      displayMessage,
    });
  }
}