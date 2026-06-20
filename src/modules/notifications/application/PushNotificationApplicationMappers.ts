import type { PushSubscriptionDto } from "./PushNotificationDtos";
import type { PushSubscriptionRecord } from "./ports/PushSubscriptionRepository";

export function pushSubscriptionToDto(
  subscription: PushSubscriptionRecord,
): PushSubscriptionDto {
  return {
    createdAt: subscription.createdAt.toISOString(),
    disabledAt: subscription.disabledAt?.toISOString() ?? null,
    displayMode: subscription.displayMode,
    endpoint: subscription.endpoint,
    id: subscription.id,
    label: subscription.label,
    lastFailureAt: subscription.lastFailureAt?.toISOString() ?? null,
    lastFailureReason: subscription.lastFailureReason,
    lastSuccessAt: subscription.lastSuccessAt?.toISOString() ?? null,
    lastTestSentAt: subscription.lastTestSentAt?.toISOString() ?? null,
    permission: subscription.permission,
    platform: subscription.platform,
    status: subscription.status,
    updatedAt: subscription.updatedAt.toISOString(),
    userAgent: subscription.userAgent,
  };
}
