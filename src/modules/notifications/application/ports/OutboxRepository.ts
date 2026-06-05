import type { NotificationPayload } from "../../domain/NotificationDelivery";

export type NotificationOutboxMessageStatus =
  | "FAILED"
  | "PENDING"
  | "PUBLISHED";

export type NotificationOutboxMessageReadModel = {
  aggregateId: string;
  aggregateType: "BOOKING";
  eventType: string;
  id: string;
  payload: NotificationPayload;
  status: NotificationOutboxMessageStatus;
};

export type OutboxRepository = {
  findById(id: string): Promise<NotificationOutboxMessageReadModel | null>;
  findNextPending(): Promise<NotificationOutboxMessageReadModel | null>;
  markFailed(id: string, failedAt: Date, reason: string): Promise<void>;
  markPublished(id: string, publishedAt: Date): Promise<void>;
};
