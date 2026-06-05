import { domainError } from "@/shared/domain/DomainError";
import { LocaleCode } from "@/shared/domain/LocaleCode";
import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

export type CustomerDetailsProps = {
  email: string;
  fullName: string;
  notes: string;
  phone: string | null;
  preferredLocale: string;
};

export type CustomerDetailsSnapshot = {
  email: string;
  fullName: string;
  notes: string;
  phone: string | null;
  preferredLocale: SupportedLocaleCode;
};

export class CustomerDetails {
  private constructor(
    private readonly props: Omit<CustomerDetailsSnapshot, "preferredLocale"> & {
      preferredLocale: LocaleCode;
    },
  ) {}

  static create(input: CustomerDetailsProps) {
    const fullName = normalizeText(input.fullName);
    const email = normalizeEmail(input.email);
    const phone = normalizeOptionalText(input.phone);
    const notes = normalizeText(input.notes);
    const preferredLocale = LocaleCode.create(input.preferredLocale);

    if (!fullName) {
      throw domainError(
        "BOOKING_CUSTOMER_NAME_MISSING",
        "Customer name is required.",
      );
    }

    if (!isValidEmail(email)) {
      throw domainError(
        "BOOKING_CUSTOMER_EMAIL_INVALID",
        "Customer email is invalid.",
      );
    }

    return new CustomerDetails({
      email,
      fullName,
      notes,
      phone,
      preferredLocale,
    });
  }

  toSnapshot(): CustomerDetailsSnapshot {
    return {
      email: this.props.email,
      fullName: this.props.fullName,
      notes: this.props.notes,
      phone: this.props.phone,
      preferredLocale: this.props.preferredLocale.value,
    };
  }
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeOptionalText(value: string | null) {
  const normalized = normalizeText(value ?? "");

  return normalized || null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
