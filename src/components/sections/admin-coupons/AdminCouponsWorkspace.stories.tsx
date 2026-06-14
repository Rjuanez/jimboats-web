import type { Meta, StoryObj } from "@storybook/nextjs-vite";

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
  updateCoupon: async () => ({
    data: {
      state: pageData.state,
    },
    ok: true,
  }),
};

const meta = {
  title: "Sections/Admin Coupons Workspace",
  component: AdminCouponsWorkspace,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AdminCouponsWorkspace>;

export default meta;

type Story = StoryObj<typeof meta>;

export const List: Story = {
  args: {
    actions,
    initialState: pageData.state,
    navItems: pageData.navItems,
    view: "list",
  },
};

export const Detail: Story = {
  args: {
    actions,
    couponId: "coupon-test10",
    initialState: pageData.state,
    navItems: pageData.navItems,
    view: "detail",
  },
};

export const Create: Story = {
  args: {
    actions,
    initialState: pageData.state,
    navItems: pageData.navItems,
    view: "create",
  },
};
