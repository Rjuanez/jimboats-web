import type {
  PushSubscriptionDto,
} from "@/modules/notifications/application/PushNotificationDtos";
import type {
  PushSubscriptionInput,
  PushTestInput,
} from "@/interface/next/validators/pushNotificationValidators";

export type PushNotificationActionResult<TData> =
  | {
      data: TData;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type AdminPushNotificationActions = {
  registerSubscription(
    input: PushSubscriptionInput,
  ): Promise<PushNotificationActionResult<{ subscription: PushSubscriptionDto }>>;
  sendTest(
    input: PushTestInput,
  ): Promise<PushNotificationActionResult<{ status: "FAILED" | "SENT" }>>;
};
