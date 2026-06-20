export type PushSubscriptionPlatform = "ANDROID" | "DESKTOP" | "IOS" | "UNKNOWN";
export type PushSubscriptionPermission = "DEFAULT" | "DENIED" | "GRANTED";
export type PushSubscriptionStatus = "ACTIVE" | "DISABLED";

export type PushSubscriptionDto = {
  createdAt: string;
  disabledAt: string | null;
  displayMode: string | null;
  endpoint: string;
  id: string;
  label: string;
  lastFailureAt: string | null;
  lastFailureReason: string | null;
  lastSuccessAt: string | null;
  lastTestSentAt: string | null;
  permission: PushSubscriptionPermission;
  platform: PushSubscriptionPlatform;
  status: PushSubscriptionStatus;
  updatedAt: string;
  userAgent: string | null;
};

export type PushNotificationsSetupDto = {
  activationRequired: boolean;
  subscriptions: PushSubscriptionDto[];
  vapidPublicKey: string | null;
};

export type RegisterPushSubscriptionCommand = {
  activationCode: string;
  auth: string;
  displayMode: string | null;
  endpoint: string;
  label: string;
  p256dh: string;
  permission: PushSubscriptionPermission;
  platform: PushSubscriptionPlatform;
  userAgent: string | null;
};

export type SendPushTestNotificationCommand = {
  activationCode: string;
  endpoint: string;
};

export type BroadcastPushTestNotificationResultDto = {
  failed: number;
  sent: number;
  total: number;
};

export type OperationalBookingPushCommand = {
  bookingId: string;
  bookingReference: string;
  customerName: string | null;
  eventType: string;
  experienceName: string | null;
  localDate: string | null;
  startTime: string | null;
};
