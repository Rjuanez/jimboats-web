import type {
  NotificationPayload,
  NotificationPayloadValue,
} from "../domain/NotificationDelivery";

export function addNotificationTemplatePayloadAliases(
  payload: NotificationPayload,
): NotificationPayload {
  return {
    ...payload,
    booking_access_url: stringValue(valueAtPath(payload, "booking.accessUrl")),
    booking_date: formatLocalDate(valueAtPath(payload, "booking.selectedLocalDate")),
    booking_reference: stringValue(valueAtPath(payload, "booking.reference")),
    booking_time: formatMinutes(valueAtPath(payload, "booking.selectedStartMinutes")),
    customer_name: stringValue(valueAtPath(payload, "customer.name")),
    deposit_amount: formatMoney({
      amountMinor: valueAtPath(payload, "payment.depositAmountMinor"),
      currency: valueAtPath(payload, "payment.depositCurrency"),
    }),
    experience_name: stringValue(valueAtPath(payload, "experience.name")),
    guest_count: stringValue(valueAtPath(payload, "booking.guestCount")),
    remaining_amount: formatMoney({
      amountMinor: valueAtPath(payload, "payment.cashRemainingAmountMinor"),
      currency: valueAtPath(payload, "payment.cashRemainingCurrency"),
    }),
  };
}

function valueAtPath(payload: NotificationPayload, path: string) {
  let current: NotificationPayloadValue | NotificationPayload | undefined =
    payload;

  for (const segment of path.split(".")) {
    if (!isRecord(current) || !(segment in current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

function stringValue(value: NotificationPayloadValue | undefined) {
  if (value === undefined || value === null) {
    return "";
  }

  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function formatLocalDate(value: NotificationPayloadValue | undefined) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return stringValue(value);
  }

  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
}

function formatMinutes(value: NotificationPayloadValue | undefined) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return stringValue(value);
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatMoney(input: {
  amountMinor: NotificationPayloadValue | undefined;
  currency: NotificationPayloadValue | undefined;
}) {
  if (typeof input.amountMinor !== "number") {
    return "";
  }

  const currency = typeof input.currency === "string" ? input.currency : "";
  const amount = input.amountMinor / 100;
  const formattedAmount = Number.isInteger(amount)
    ? String(amount)
    : amount.toFixed(2);

  return currency ? `${formattedAmount} ${currency}` : formattedAmount;
}

function isRecord(
  value: NotificationPayloadValue | NotificationPayload | undefined,
): value is Record<string, NotificationPayloadValue> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
