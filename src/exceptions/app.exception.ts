import { HTTPException } from "hono/http-exception";
import type { GenericExceptionResponse } from "./exception-response.dto.js";
import type { ErrorStatusCode } from "../types/error-status.type.js";
import type { FieldError } from "../types/fields-error.type.js";

export class AppException
  extends HTTPException
  implements GenericExceptionResponse
{
  readonly status: ErrorStatusCode;
  readonly code: string;
  readonly displayMessage?: string | undefined;
  readonly fields?: FieldError[] | undefined;
  readonly timestamp?: string;

  constructor(params: GenericExceptionResponse) {
    super(params.status, { message: params.message });

    this.status = params.status;
    this.code = params.code;
    this.displayMessage = params.displayMessage;
    this.fields = params.fields;
    this.timestamp = new Date().toISOString();
  }
}
