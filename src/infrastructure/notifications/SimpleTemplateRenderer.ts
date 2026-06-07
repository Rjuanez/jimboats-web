import type {
  TemplateRenderer,
  TemplateRenderInput,
  TemplateRenderResult,
} from "@/modules/notifications/application/ports/TemplateRenderer";
import type {
  NotificationPayload,
  NotificationPayloadValue,
} from "@/modules/notifications/domain/NotificationDelivery";

const templateVariablePattern = /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g;

export class SimpleTemplateRenderer implements TemplateRenderer {
  async render(input: TemplateRenderInput): Promise<TemplateRenderResult> {
    const variables = uniqueVariables([
      ...extractVariables(input.subject),
      ...extractVariables(input.previewText),
      ...extractVariables(input.body),
      ...extractVariables(input.htmlBody),
    ]);
    const allowedVariables = new Set(input.allowedVariables);
    const missingVariables = variables.filter((variable) => {
      return (
        !allowedVariables.has(variable) ||
        resolvePayloadPath(input.payload, variable) === undefined
      );
    });

    return {
      missingVariables,
      renderedBody: renderText(input.body, input.payload, allowedVariables),
      renderedHtmlBody: input.htmlBody
        ? renderText(input.htmlBody, input.payload, allowedVariables)
        : null,
      renderedPreviewText: input.previewText
        ? renderText(input.previewText, input.payload, allowedVariables)
        : null,
      renderedSubject: input.subject
        ? renderText(input.subject, input.payload, allowedVariables)
        : null,
      variables,
    };
  }
}

function extractVariables(text: string | null) {
  if (!text) {
    return [];
  }

  return [...text.matchAll(templateVariablePattern)].map((match) => match[1]);
}

function renderText(
  text: string,
  payload: NotificationPayload,
  allowedVariables: Set<string>,
) {
  return text.replace(templateVariablePattern, (_match, variable) => {
    if (!allowedVariables.has(variable)) {
      return "";
    }

    const value = resolvePayloadPath(payload, variable);

    return value === undefined || value === null ? "" : String(value);
  });
}

function resolvePayloadPath(payload: NotificationPayload, path: string) {
  let current: NotificationPayloadValue | NotificationPayload | undefined =
    payload;

  for (const segment of path.split(".")) {
    if (!isRecord(current) || !(segment in current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

function isRecord(
  value: NotificationPayloadValue | NotificationPayload | undefined,
): value is Record<string, NotificationPayloadValue> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function uniqueVariables(values: string[]) {
  return [...new Set(values)];
}
