import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { getAdminCouponsPreviewPage } from "@/interface/next/presenters/adminCouponsPresenter";

import { AdminCouponsWorkspace } from "./AdminCouponsWorkspace";
import type { AdminCouponActions } from "./AdminCouponTypes";

const pageData = getAdminCouponsPreviewPage();

const actions: AdminCouponActions = {
  changeStatus: async () => ({
    data: {
      state: pageData.state,
    },
    ok: true,
  }),
  createCoupon: async () => ({
    data: {
      couponId: "coupon-new",
      state: pageData.state,
    },
    ok: true,
  }),
  duplicateCoupon: async () => ({
    data: {
      couponId: "coupon-test10-copy",
      state: pageData.state,
    },
    ok: true,
  }),
  exportCsv: async () => ({
    data: {
      csv: "code,campaign\nTEST10,Initial coupon test",
    },
    ok: true,
  }),
  generateBatch: async () => ({
    data: {
      state: pageData.state,
    },
    ok: true,
  }),
  updateCoupon: async () => ({
    data: {
      state: pageData.state,
    },
    ok: true,
  }),
};

describe("AdminCouponsWorkspace", () => {
  it("renders the coupon library", () => {
    render(
      <AdminCouponsWorkspace
        actions={actions}
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="list"
      />,
    );

    expect(screen.getByRole("heading", { name: "Coupons" })).toBeInTheDocument();
    const library = screen.getByRole("region", { name: "Coupon library" });

    expect(within(library).getByText("TEST10")).toBeInTheDocument();
    expect(within(library).getByText("10% off")).toBeInTheDocument();
  });

  it("submits edited coupon rules", async () => {
    const user = userEvent.setup();
    const updateCoupon = vi.fn(actions.updateCoupon);

    render(
      <AdminCouponsWorkspace
        actions={{
          ...actions,
          updateCoupon,
        }}
        couponId="coupon-test10"
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="detail"
      />,
    );

    const percentField = screen.getByLabelText("Percent");

    await user.clear(percentField);
    await user.type(percentField, "15");
    await user.click(screen.getByRole("button", { name: "Save coupon" }));

    await waitFor(() => {
      expect(updateCoupon).toHaveBeenCalled();
    });
    expect(updateCoupon.mock.calls[0]?.[0].coupon.discountValue).toBe(15);
  });

  it("generates a coupon batch from the dashboard", async () => {
    const user = userEvent.setup();
    const generateBatch = vi.fn(actions.generateBatch);

    render(
      <AdminCouponsWorkspace
        actions={{
          ...actions,
          generateBatch,
        }}
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="list"
      />,
    );

    await user.click(screen.getByRole("button", { name: /Generate batch/i }));

    await waitFor(() => {
      expect(generateBatch).toHaveBeenCalled();
    });
    expect(generateBatch.mock.calls[0]?.[0].codePrefix).toBe("SUMMER");
  });
});
