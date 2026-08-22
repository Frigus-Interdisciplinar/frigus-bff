import { AppException } from "./app.exception.js";

export class GatewayTimeoutException extends AppException {
  constructor(
    message = "Tempo limite de requisição excedido",
    displayMessage = "O serviço externo demorou muito para responder",
  ) {
    super({
      status: 504,
      code: "GATEWAY_TIMEOUT",
      message,
      displayMessage,
    });
  }
}
