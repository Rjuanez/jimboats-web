import { afterEach, describe, expect, it, vi } from "vitest";

import { getAdminCouponsPage } from "./adminCouponsPresenter";

describe("admin coupons presenter", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses preview data without requiring a database connection", async () => {
    vi.stubEnv("JIMBOATS_ADMIN_PREVIEW_DATA", "1");
    vi.stubEnv("DATABASE_URL", "");

    const pageData = await getAdminCouponsPage();

    expect(pageData.state.coupons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "TEST10",
        }),
      ]),
    );
  });
});
