import { AppException } from "./app.exception.js";

export class BadGatewayException extends AppException {
  constructor(
    message = "Erro de comunicação com o serviço externo",
    displayMessage = "Não foi possível comunicar com o serviço integrado",
  ) {
    super({
      status: 502,
      code: "BAD_GATEWAY",
      message,
      displayMessage,
    });
  }
}
