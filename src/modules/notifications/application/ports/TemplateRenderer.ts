import type { NotificationPayload } from "../../domain/NotificationDelivery";

export type TemplateRenderInput = {
  allowedVariables: string[];
  body: string;
  htmlBody: string | null;
  payload: NotificationPayload;
  previewText: string | null;
  subject: string | null;
};

export type TemplateRenderResult = {
  missingVariables: string[];
  renderedBody: string;
  renderedHtmlBody: string | null;
  renderedPreviewText: string | null;
  renderedSubject: string | null;
  variables: string[];
};

export type TemplateRenderer = {
  render(input: TemplateRenderInput): Promise<TemplateRenderResult>;
};
