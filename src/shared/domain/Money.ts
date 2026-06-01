import { domainError } from "./DomainError";

export type CurrencyCode = "EUR";

export type MoneySnapshot = {
  amountMinor: number;
  currency: CurrencyCode;
};

const supportedCurrencies = new Set<CurrencyCode>(["EUR"]);

export class Money {
  private constructor(
    readonly amountMinor: number,
    readonly currency: CurrencyCode,
  ) {}

  static create(input: MoneySnapshot) {
    if (!Number.isInteger(input.amountMinor)) {
      throw domainError(
        "MONEY_AMOUNT_INVALID",
        "Money amount must be an integer in minor units.",
      );
    }

    if (input.amountMinor < 0) {
      throw domainError(
        "MONEY_AMOUNT_INVALID",
        "Money amount cannot be negative.",
      );
    }

    if (!supportedCurrencies.has(input.currency)) {
      throw domainError(
        "MONEY_CURRENCY_INVALID",
        "Money currency is not supported.",
      );
    }

    return new Money(input.amountMinor, input.currency);
  }

  equals(other: Money) {
    return (
      this.amountMinor === other.amountMinor && this.currency === other.currency
    );
  }

  isZero() {
    return this.amountMinor === 0;
  }

  toSnapshot(): MoneySnapshot {
    return {
      amountMinor: this.amountMinor,
      currency: this.currency,
    };
  }
}
