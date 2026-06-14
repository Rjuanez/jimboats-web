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

type AdminCouponPageProps = {
  params: Promise<{
    couponId: string;
  }>;
};

export default async function AdminCouponPage({ params }: AdminCouponPageProps) {
  const [{ couponId }, pageData] = await Promise.all([
    params,
    getAdminCouponsPage(),
  ]);

  return (
    <AdminCouponsWorkspace
      actions={actions}
      couponId={couponId}
      initialState={pageData.state}
      navItems={pageData.navItems}
      view="detail"
    />
  );
}
