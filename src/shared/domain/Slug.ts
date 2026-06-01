import type { LocaleCode } from "./LocaleCode";
import { domainError } from "./DomainError";

export class Slug {
  private constructor(
    readonly value: string,
    readonly locale?: LocaleCode,
  ) {}

  static create(rawValue: string, locale?: LocaleCode) {
    const value = normalizeSlug(rawValue);

    if (!value) {
      throw domainError("SLUG_MISSING", "Slug is required.");
    }

    if (value.includes("/") || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      throw domainError("SLUG_INVALID", "Slug is not URL safe.");
    }

    return new Slug(value, locale);
  }

  equals(other: Slug) {
    return (
      this.value === other.value &&
      (this.locale?.value ?? null) === (other.locale?.value ?? null)
    );
  }

  toString() {
    return this.value;
  }
}

function normalizeSlug(rawValue: string) {
  return rawValue
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
