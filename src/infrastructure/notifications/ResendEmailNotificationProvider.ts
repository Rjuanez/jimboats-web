import type {
  NotificationProvider,
  NotificationProviderSendResult,
} from "@/modules/notifications/application/ports/NotificationProvider";
import type { NotificationDeliverySnapshot } from "@/modules/notifications/domain/NotificationDelivery";

import { renderEmailHtmlDocument } from "./SimpleTemplateRenderer";

type FetchLike = typeof fetch;

export type ResendEmailNotificationProviderConfig = {
  apiKey: string;
  baseUrl?: string | null;
  from: string;
  replyTo: string | null;
};

type ResendSendEmailResponse = {
  id?: unknown;
};

const termsNotice = {
  ca: "T’adjuntem una còpia de les condicions aplicables a la teva reserva.",
  en: "A copy of the terms for your booking is attached.",
  es: "Adjuntamos una copia de las condiciones aplicables a tu reserva.",
};

export class ResendEmailNotificationProvider implements NotificationProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly from: string;
  private readonly replyTo: string | null;

  constructor(
    config: ResendEmailNotificationProviderConfig,
    private readonly fetchFn: FetchLike = fetch,
  ) {
    this.apiKey = requireNonEmpty(config.apiKey, "RESEND_API_KEY");
    this.baseUrl = (config.baseUrl ?? "https://api.resend.com").replace(
      /\/$/,
      "",
    );
    this.from = requireNonEmpty(config.from, "RESEND_FROM");
    this.replyTo = config.replyTo?.trim() || null;
  }

  async send(
    delivery: NotificationDeliverySnapshot,
  ): Promise<NotificationProviderSendResult> {
    if (delivery.channel !== "EMAIL") {
      throw new Error("Resend email provider only supports email deliveries.");
    }

    if (!delivery.recipient.email || !delivery.renderedSubject) {
      throw new Error("Email delivery is missing recipient or subject.");
    }

    const terms = delivery.payload.bookingTermsDocument;
    const hasTerms =
      delivery.notificationType === "BOOKING_CONFIRMED_DEPOSIT_PAID" &&
      typeof terms === "string" &&
      terms.trim().length > 0;
    const note = termsNotice[delivery.locale];
    const html =
      delivery.renderedHtmlBody ??
      renderEmailHtmlDocument({
        bodyHtml: bodyToHtml(delivery.renderedBody),
        previewText: null,
      });

    const response = await this.fetchFn(`${this.baseUrl}/emails`, {
      body: JSON.stringify({
        attachments: hasTerms
          ? [
              {
                filename: "JimBoats-booking-terms.txt",
                content: Buffer.from(terms, "utf8").toString("base64"),
              },
            ]
          : undefined,
        from: this.from,
        html: hasTerms ? appendTermsNotice(html, note) : html,
        reply_to: this.replyTo ?? undefined,
        subject: delivery.renderedSubject,
        text: hasTerms
          ? `${delivery.renderedBody}\n\n${note}`
          : delivery.renderedBody,
        to: [delivery.recipient.email],
      }),
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `${delivery.id}-${delivery.attempts + 1}`,
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(
        await providerError("Resend email send failed", response),
      );
    }

    const payload = (await response.json()) as ResendSendEmailResponse;

    return {
      provider: "RESEND",
      providerMessageId: typeof payload.id === "string" ? payload.id : null,
    };
  }
}

function appendTermsNotice(html: string, note: string) {
  const footer = `<p style="margin:16px auto;padding:0 16px;max-width:600px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#475569;">${escapeHtml(note)}</p>`;
  const closingTag = /<\/body\s*>/i.test(html)
    ? /<\/body\s*>/i
    : /<\/html\s*>/i;
  return closingTag.test(html)
    ? html.replace(closingTag, (tag) => footer + tag)
    : html + footer;
}

function bodyToHtml(body: string) {
  return body
    .split(/\n{2,}/)
    .map(
      (paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function providerError(prefix: string, response: Response) {
  const body = await response.text();

  return body ? `${prefix}: ${body}` : prefix;
}

function requireNonEmpty(value: string, label: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}
