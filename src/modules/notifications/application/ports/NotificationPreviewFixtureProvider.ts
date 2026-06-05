import type { NotificationPayload } from "../../domain/NotificationDelivery";

export type NotificationPreviewFixtureProvider = {
  findByKey(key: string): Promise<NotificationPayload | null>;
};
