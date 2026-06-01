import { domainError } from "@/shared/domain/DomainError";
import type { Money } from "@/shared/domain/Money";

export type ExtraStatus = "ACTIVE" | "ARCHIVED" | "DRAFT";

export type ExtraSnapshot = {
  defaultNoticeMinutes: number;
  id: string;
  name: string;
  price: ReturnType<Money["toSnapshot"]>;
  status: ExtraStatus;
};

export type ExtraProps = {
  defaultNoticeMinutes: number;
  id: string;
  name: string;
  price: Money;
  status: ExtraStatus;
};

export class Extra {
  private constructor(private readonly props: ExtraProps) {}

  static create(input: ExtraProps) {
    const id = input.id.trim();
    const name = input.name.trim();

    if (!id) {
      throw domainError("EXTRA_ID_MISSING", "Extra id is required.");
    }

    if (!name) {
      throw domainError("EXTRA_NAME_MISSING", "Extra name is required.");
    }

    if (
      !Number.isInteger(input.defaultNoticeMinutes) ||
      input.defaultNoticeMinutes < 0
    ) {
      throw domainError(
        "EXTRA_MINIMUM_NOTICE_INVALID",
        "Extra default notice must be a non-negative integer.",
      );
    }

    if (input.status === "ACTIVE" && input.price.isZero()) {
      throw domainError(
        "EXTRA_PRICE_MISSING",
        "Active extra requires a price.",
      );
    }

    return new Extra({
      ...input,
      id,
      name,
    });
  }

  get id() {
    return this.props.id;
  }

  get status() {
    return this.props.status;
  }

  isSelectable() {
    return this.props.status === "ACTIVE" && !this.props.price.isZero();
  }

  assertSelectable() {
    if (!this.isSelectable()) {
      throw domainError(
        "EXTRA_NOT_SELECTABLE",
        "Extra is not selectable for new bookings.",
      );
    }
  }

  toSnapshot(): ExtraSnapshot {
    return {
      defaultNoticeMinutes: this.props.defaultNoticeMinutes,
      id: this.props.id,
      name: this.props.name,
      price: this.props.price.toSnapshot(),
      status: this.props.status,
    };
  }
}
