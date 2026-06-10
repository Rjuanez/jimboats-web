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
      renderedHtmlBody: renderHtmlBody(input, allowedVariables),
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

function renderHtmlBody(
  input: TemplateRenderInput,
  allowedVariables: Set<string>,
) {
  if (!input.htmlBody) {
    return null;
  }

  const renderedHtmlBody = renderText(
    input.htmlBody,
    input.payload,
    allowedVariables,
  );

  if (isCompleteHtmlDocument(renderedHtmlBody)) {
    return renderedHtmlBody;
  }

  return renderEmailHtmlDocument({
    bodyHtml: renderedHtmlBody,
    previewText: input.previewText
      ? renderText(input.previewText, input.payload, allowedVariables)
      : null,
  });
}

function isCompleteHtmlDocument(html: string) {
  return /^\s*(?:<!doctype\s+html\b|<html\b|<body\b)/i.test(html);
}

export function renderEmailHtmlDocument(input: {
  bodyHtml: string;
  previewText: string | null;
}) {
  const previewText = input.previewText?.trim();
  const hiddenPreview = previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f7fafc;opacity:0;">${escapeHtml(previewText)}</div>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>JimBoats</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f7fb;color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
    ${hiddenPreview}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;background:#f5f7fb;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 16px 0;font-size:20px;font-weight:700;letter-spacing:0;color:#0f172a;">
                JimBoats
              </td>
            </tr>
            <tr>
              <td style="border:1px solid #dbe3ef;border-radius:8px;background:#ffffff;padding:28px;font-size:16px;line-height:1.6;color:#334155;">
                ${input.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0 0 0;font-size:12px;line-height:1.5;color:#64748b;">
                JimBoats Charter
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
