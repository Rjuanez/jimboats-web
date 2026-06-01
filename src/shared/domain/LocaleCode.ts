import { domainError } from "./DomainError";

export type SupportedLocaleCode = "ca" | "en" | "es";

const supportedLocales = new Set<SupportedLocaleCode>(["en", "es", "ca"]);

export class LocaleCode {
  private constructor(readonly value: SupportedLocaleCode) {}

  static create(rawValue: string) {
    const value = rawValue.trim().toLowerCase();

    if (!value) {
      throw domainError("LOCALE_CODE_MISSING", "Locale code is required.");
    }

    if (!supportedLocales.has(value as SupportedLocaleCode)) {
      throw domainError(
        "LOCALE_CODE_UNSUPPORTED",
        "Locale code is not supported.",
      );
    }

    return new LocaleCode(value as SupportedLocaleCode);
  }

  equals(other: LocaleCode) {
    return this.value === other.value;
  }

  toString() {
    return this.value;
  }
}
