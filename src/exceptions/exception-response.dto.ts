import type { ErrorStatus } from "../types/error-status.type.js";
import type { FieldError } from "../types/fields-error.type.js";

export interface GenericExceptionResponse {
  status: ErrorStatus;
  code: string;
  message: string;
  displayMessage?: string;
  fields?: FieldError[];
  timestamp: string;
}
