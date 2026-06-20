import type {
  PushSubscriptionPermission,
  PushSubscriptionPlatform,
  PushSubscriptionStatus,
} from "../PushNotificationDtos";

export type PushSubscriptionRecord = {
  auth: string;
  createdAt: Date;
  disabledAt: Date | null;
  displayMode: string | null;
  endpoint: string;
  id: string;
  label: string;
  lastFailureAt: Date | null;
  lastFailureReason: string | null;
  lastSuccessAt: Date | null;
  lastTestSentAt: Date | null;
  p256dh: string;
  permission: PushSubscriptionPermission;
  platform: PushSubscriptionPlatform;
  status: PushSubscriptionStatus;
  updatedAt: Date;
  userAgent: string | null;
};

export type PushSubscriptionUpsert = {
  auth: string;
  displayMode: string | null;
  endpoint: string;
  label: string;
  p256dh: string;
  permission: PushSubscriptionPermission;
  platform: PushSubscriptionPlatform;
  userAgent: string | null;
};

export type PushDeliveryAttemptWriteModel = {
  body: string;
  bookingId: string | null;
  eventType: string;
  failureReason: string | null;
  provider: string;
  sentAt: Date;
  status: "FAILED" | "SENT";
  subscriptionId: string;
  title: string;
  url: string;
};

export type PushSubscriptionRepository = {
  disable(input: {
    disabledAt: Date;
    endpoint: string;
    reason: string;
  }): Promise<void>;
  findByEndpoint(endpoint: string): Promise<PushSubscriptionRecord | null>;
  listActive(): Promise<PushSubscriptionRecord[]>;
  listAll(): Promise<PushSubscriptionRecord[]>;
  markFailure(input: {
    failedAt: Date;
    reason: string;
    subscriptionId: string;
  }): Promise<void>;
  markSuccess(input: {
    sentAt: Date;
    subscriptionId: string;
  }): Promise<void>;
  markTestSent(input: {
    sentAt: Date;
    subscriptionId: string;
  }): Promise<void>;
  recordAttempt(input: PushDeliveryAttemptWriteModel): Promise<void>;
  upsert(input: PushSubscriptionUpsert): Promise<PushSubscriptionRecord>;
};
