import { AppException } from "./app.exception.js";

export class ForbiddenException extends AppException {
    constructor(
        message: string = "Proibido",
        displayMessage = "Não foi possível autorizar o acesso",
    ) {
        super({
            status: 403,
            code: "FORBIDDEN",
            message,
            displayMessage,
        });
    }
}