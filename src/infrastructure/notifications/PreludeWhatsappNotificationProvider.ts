import type {
  NotificationProvider,
  NotificationProviderSendResult,
} from "@/modules/notifications/application/ports/NotificationProvider";
import type { NotificationDeliverySnapshot } from "@/modules/notifications/domain/NotificationDelivery";

type FetchLike = typeof fetch;

export type PreludeWhatsappNotificationProviderConfig = {
  apiKey: string;
  baseUrl?: string | null;
  callbackUrl: string | null;
  from: string | null;
};

type PreludeNotifyResponse = {
  id?: unknown;
};

export class PreludeWhatsappNotificationProvider implements NotificationProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly callbackUrl: string | null;
  private readonly from: string | null;

  constructor(
    config: PreludeWhatsappNotificationProviderConfig,
    private readonly fetchFn: FetchLike = fetch,
  ) {
    this.apiKey = requireNonEmpty(config.apiKey, "PRELUDE_API_KEY");
    this.baseUrl = (config.baseUrl ?? "https://api.prelude.dev").replace(
      /\/$/,
      "",
    );
    this.callbackUrl = config.callbackUrl?.trim() || null;
    this.from = config.from?.trim() || null;
  }

  async send(
    delivery: NotificationDeliverySnapshot,
  ): Promise<NotificationProviderSendResult> {
    if (delivery.channel !== "WHATSAPP") {
      throw new Error(
        "Prelude WhatsApp provider only supports WhatsApp deliveries.",
      );
    }

    if (!delivery.recipient.phone || !delivery.providerTemplateId) {
      throw new Error("WhatsApp delivery is missing phone or template id.");
    }

    const response = await this.fetchFn(`${this.baseUrl}/v2/notify`, {
      body: JSON.stringify({
        callback_url: this.callbackUrl ?? undefined,
        correlation_id: delivery.id.slice(0, 80),
        from: this.from ?? undefined,
        locale: delivery.locale,
        preferred_channel: "whatsapp",
        template_id: delivery.providerTemplateId,
        to: delivery.recipient.phone,
        variables: delivery.providerVariables,
      }),
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(
        await providerError("Prelude WhatsApp send failed", response),
      );
    }

    const payload = (await response.json()) as PreludeNotifyResponse;

    return {
      provider: "PRELUDE_WHATSAPP",
      providerMessageId: typeof payload.id === "string" ? payload.id : null,
    };
  }
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
