import { AppException } from "./app.exception.js";

export class InternalServerErrorException extends AppException {
    constructor(
        message: string = "Erro interno do servidor",
        displayMessage = "Não foi possível processar a requisição",
    ) {
        super({
            status: 500,
            code: "INTERNAL_SERVER_ERROR",
            message,
            displayMessage,
        });
    }
}