import { ZodError } from "zod";

import { adminEs, adminErrorMessages, adminFieldLabels } from "@/i18n/admin/es";
import { ApplicationError } from "@/shared/application/ApplicationError";
import { DomainError } from "@/shared/domain/DomainError";

/** Translate interface errors without changing domain codes or exposing technical exceptions. */
export function presentAdminError(error: unknown): string {
  if (error instanceof ApplicationError || error instanceof DomainError) {
    return adminErrorMessages[error.code] ?? adminEs.invalidInput;
  }
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    const field = issue?.path
      .map(String)
      .find((key) => key in adminFieldLabels);
    return field
      ? `Revisa el campo «${adminFieldLabels[field]}».`
      : adminEs.invalidInput;
  }
  return adminEs.unexpectedError;
}
