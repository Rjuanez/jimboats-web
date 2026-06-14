import { AdminCouponsWorkspace } from "@/components/sections/admin-coupons/AdminCouponsWorkspace";
import type { AdminCouponActions } from "@/components/sections/admin-coupons/AdminCouponTypes";
import {
  changeAdminCouponStatusAction,
  createAdminCouponAction,
  updateAdminCouponAction,
} from "@/interface/next/actions/adminCouponActions";
import { getAdminCouponsPage } from "@/interface/next/presenters/adminCouponsPresenter";

export const dynamic = "force-dynamic";

const actions = {
  changeStatus: changeAdminCouponStatusAction,
  createCoupon: createAdminCouponAction,
  updateCoupon: updateAdminCouponAction,
} satisfies AdminCouponActions;

export default async function AdminCouponsPage() {
  const pageData = await getAdminCouponsPage();

  return (
    <AdminCouponsWorkspace
      actions={actions}
      initialState={pageData.state}
      navItems={pageData.navItems}
      view="list"
    />
  );
}
