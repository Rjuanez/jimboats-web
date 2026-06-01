export type ApplicationErrorCode =
  | "EXPERIENCE_ALREADY_EXISTS"
  | "EXPERIENCE_ID_MISSING"
  | "EXPERIENCE_NOT_FOUND"
  | "EXTRA_NOT_FOUND";

export class ApplicationError extends Error {
  readonly code: ApplicationErrorCode;

  constructor(code: ApplicationErrorCode, message: string) {
    super(message);
    this.name = "ApplicationError";
    this.code = code;
  }
}

export function applicationError(code: ApplicationErrorCode, message: string) {
  return new ApplicationError(code, message);
}
