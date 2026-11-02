import { AppException } from "./app.exception.js";

export class GatewayTimeoutException extends AppException {
  constructor(
    message = "Tempo limite de requisição excedido",
    displayMessage = "O serviço externo demorou muito para responder",
    code = "GATEWAY_TIMEOUT",
  ) {
    super({
      status: 504,
      code,
      message,
      displayMessage,
    });
  }
}
