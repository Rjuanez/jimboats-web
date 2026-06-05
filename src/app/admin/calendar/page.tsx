import { AdminCalendarWorkspace } from "@/components/sections/admin-calendar/AdminCalendarWorkspace";
import type { AdminCalendarActions } from "@/components/sections/admin-calendar/AdminCalendarTypes";
import {
  createAdminManualCalendarBlockAction,
  releaseAdminManualCalendarBlockAction,
} from "@/interface/next/actions/adminCalendarActions";
import { getAdminCalendarPage } from "@/interface/next/presenters/adminCalendarPresenter";
import { parseAdminCalendarSearchParams } from "@/interface/next/validators/adminCalendarValidators";

export const dynamic = "force-dynamic";

const actions = {
  createManualBlock: createAdminManualCalendarBlockAction,
  releaseManualBlock: releaseAdminManualCalendarBlockAction,
} satisfies AdminCalendarActions;

type AdminCalendarPageProps = {
  searchParams: Promise<{
    from?: string | string[];
    to?: string | string[];
  }>;
};

export default async function AdminCalendarPage({
  searchParams,
}: AdminCalendarPageProps) {
  const range = await getCalendarRange(searchParams);
  const pageData = await getAdminCalendarPage(range);

  return <AdminCalendarWorkspace actions={actions} pageData={pageData} />;
}

async function getCalendarRange(
  searchParams: AdminCalendarPageProps["searchParams"],
) {
  try {
    return parseAdminCalendarSearchParams(await searchParams);
  } catch {
    return {};
  }
}
