import { describe, expect, it } from "vitest";

import { SimpleTemplateRenderer } from "./SimpleTemplateRenderer";

describe("SimpleTemplateRenderer", () => {
  it("renders allowed payload variables", async () => {
    const renderer = new SimpleTemplateRenderer();

    const result = await renderer.render({
      allowedVariables: ["booking.reference", "customer.name"],
      body: "Hello {{ customer.name }}, booking {{ booking.reference }}.",
      htmlBody:
        "<p>Hello {{ customer.name }}, booking <strong>{{ booking.reference }}</strong>.</p>",
      payload: {
        booking: {
          reference: "JB-2026-0001",
        },
        customer: {
          name: "Sailor Guest",
        },
      },
      previewText: "Booking {{ booking.reference }}",
      subject: "Booking {{ booking.reference }} confirmed",
    });

    expect(result).toEqual({
      missingVariables: [],
      renderedBody: "Hello Sailor Guest, booking JB-2026-0001.",
      renderedHtmlBody:
        "<p>Hello Sailor Guest, booking <strong>JB-2026-0001</strong>.</p>",
      renderedPreviewText: "Booking JB-2026-0001",
      renderedSubject: "Booking JB-2026-0001 confirmed",
      variables: ["booking.reference", "customer.name"],
    });
  });

  it("reports missing and unsupported variables", async () => {
    const renderer = new SimpleTemplateRenderer();

    const result = await renderer.render({
      allowedVariables: ["booking.reference"],
      body:
        "Booking {{ booking.reference }} for {{ customer.name }} with {{ skipper.name }}.",
      htmlBody: null,
      payload: {
        booking: {
          reference: "JB-2026-0001",
        },
        customer: {},
      },
      previewText: null,
      subject: "Booking {{ booking.reference }}",
    });

    expect(result).toMatchObject({
      missingVariables: ["customer.name", "skipper.name"],
      renderedBody: "Booking JB-2026-0001 for  with .",
    });
  });
});
