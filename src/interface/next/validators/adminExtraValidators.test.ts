import { describe, expect, it } from "vitest";

import { parseAdminCreateExtra, parseAdminExtra } from "./adminExtraValidators";

describe("adminExtraValidators", () => {
  it("parses a valid extra creation input", () => {
    const input = parseAdminCreateExtra({
      defaultNoticeHours: 24,
      name: "Premium champagne",
      price: 90,
    });

    expect(input).toMatchObject({
      defaultNoticeHours: 24,
      name: "Premium champagne",
      price: 90,
    });
  });

  it("rejects an extra without a name", () => {
    expect(() =>
      parseAdminCreateExtra({
        defaultNoticeHours: 0,
        name: "",
        price: 90,
      }),
    ).toThrow();
  });

  it("parses an editable extra with nullable media", () => {
    const input = parseAdminExtra({
      defaultNoticeHours: 0,
      id: "premium-champagne",
      media: {
        assetId: null,
        filename: "",
        primaryImageUrl: "",
        status: "missing",
        title: "",
        variants: [],
      },
      name: "Premium champagne",
      price: 90,
      status: "draft",
    });

    expect(input.media.assetId).toBeNull();
  });
});
