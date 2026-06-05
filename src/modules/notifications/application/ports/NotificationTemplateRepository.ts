import type { NotificationTemplate } from "../../domain/NotificationTemplate";

export type NotificationTemplateRepository = {
  findById(id: string): Promise<NotificationTemplate | null>;
  list(): Promise<NotificationTemplate[]>;
  save(template: NotificationTemplate): Promise<void>;
};
