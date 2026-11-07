import { adminEs } from "@/i18n/admin/es";
import { adminNavItems } from "@/components/layout/AdminNavigation";
import type {
  AdminCalendarBlock,
  AdminCalendarPageData,
  AdminCalendarState,
} from "@/components/sections/admin-calendar/AdminCalendarTypes";
import type {
  AdminCalendarBlockDto,
  AdminCalendarDto,
} from "@/modules/boat-calendar/application/AdminCalendarDtos";
import {
  addDaysToLocalDate,
  boatCalendarTimeZone,
  todayLocalDate,
} from "@/modules/boat-calendar/application/CalendarDateTime";

const previewState: AdminCalendarState = {
  blocks: [
    {
      canRelease: true,
      bookingId: null,
      createdAt: "2026-06-01T09:00:00.000Z",
      createdByUserId: "admin-user",
      endTime: "12:00",
      experienceId: null,
      expiresAt: null,
      id: "preview-maintenance",
      localDate: "2026-06-05",
      protectedEndAt: "2026-06-05T10:00:00.000Z",
      protectedStartAt: "2026-06-05T08:00:00.000Z",
      reason: adminEs["Maintenance window"],
      source: "manual_block",
      sourceLabel: adminEs["Manual block"],
      startTime: "10:00",
      status: "active",
      statusLabel: adminEs["Active"],
      updatedAt: "2026-06-01T09:00:00.000Z",
    },
    {
      canRelease: true,
      bookingId: null,
      createdAt: "2026-06-01T11:00:00.000Z",
      createdByUserId: "admin-user",
      endTime: "18:00",
      experienceId: null,
      expiresAt: null,
      id: "preview-private-event",
      localDate: "2026-06-08",
      protectedEndAt: "2026-06-08T16:00:00.000Z",
      protectedStartAt: "2026-06-08T14:00:00.000Z",
      reason: adminEs["Private owner hold"],
      source: "manual_block",
      sourceLabel: adminEs["Manual block"],
      startTime: "16:00",
      status: "active",
      statusLabel: adminEs["Active"],
      updatedAt: "2026-06-01T11:00:00.000Z",
    },
    {
      canRelease: false,
      bookingId: null,
      createdAt: "2026-05-31T13:00:00.000Z",
      createdByUserId: "admin-user",
      endTime: "15:00",
      experienceId: null,
      expiresAt: null,
      id: "preview-released",
      localDate: "2026-06-04",
      protectedEndAt: "2026-06-04T13:00:00.000Z",
      protectedStartAt: "2026-06-04T11:00:00.000Z",
      reason: adminEs["Released cleaning hold"],
      source: "manual_block",
      sourceLabel: adminEs["Manual block"],
      startTime: "13:00",
      status: "released",
      statusLabel: adminEs["Released"],
      updatedAt: "2026-06-01T08:00:00.000Z",
    },
  ],
  fromLocalDate: "2026-06-01",
  summary: {
    activeBlocks: 2,
    bookingBlocks: 0,
    manualBlocks: 3,
    releasedBlocks: 1,
  },
  timeZone: boatCalendarTimeZone,
  toLocalDate: "2026-06-14",
};

export type AdminCalendarPageRange = {
  fromLocalDate?: string;
  toLocalDate?: string;
};

export function getAdminCalendarPreviewPage(): AdminCalendarPageData {
  return {
    navItems: adminNavItems,
    state: previewState,
  };
}

export async function getAdminCalendarPage(
  range: AdminCalendarPageRange = {},
): Promise<AdminCalendarPageData> {
  if (
    process.env.JIMBOATS_ADMIN_PREVIEW_DATA === "1" &&
    process.env.JIMBOATS_LOCAL_BOOKINGS !== "1"
  ) {
    return getAdminCalendarPreviewPage();
  }

  const resolvedRange = resolveCalendarPageRange(range);
  const { getContainer } = await import("@/container");
  const container = getContainer();
  const calendar = await container.adminCalendar.getCalendar(resolvedRange);

  return {
    navItems: adminNavItems,
    state: presentAdminCalendar(calendar),
  };
}

export function presentAdminCalendar(
  calendar: AdminCalendarDto,
): AdminCalendarState {
  return {
    blocks: calendar.blocks.map(presentCalendarBlock),
    fromLocalDate: calendar.fromLocalDate,
    summary: calendar.summary,
    timeZone: calendar.timeZone,
    toLocalDate: calendar.toLocalDate,
  };
}

export function resolveCalendarPageRange(range: AdminCalendarPageRange = {}) {
  const fromLocalDate =
    range.fromLocalDate ?? todayLocalDate(new Date(), boatCalendarTimeZone);
  const toLocalDate =
    range.toLocalDate ?? addDaysToLocalDate(fromLocalDate, 14);

  return {
    fromLocalDate,
    toLocalDate,
  };
}

function presentCalendarBlock(
  block: AdminCalendarBlockDto,
): AdminCalendarBlock {
  return {
    bookingId: block.bookingId,
    canRelease: block.canRelease,
    createdAt: block.createdAt,
    createdByUserId: block.createdByUserId,
    endTime: block.endTime,
    experienceId: block.experienceId,
    expiresAt: block.expiresAt,
    id: block.id,
    localDate: block.localDate,
    protectedEndAt: block.protectedEndAt,
    protectedStartAt: block.protectedStartAt,
    reason: block.reason,
    source: presentCalendarBlockSource(block.source),
    sourceLabel: presentCalendarBlockSourceLabel(block.source),
    startTime: block.startTime,
    status: block.status === "ACTIVE" ? "active" : "released",
    statusLabel:
      block.status === "ACTIVE" ? adminEs["Active"] : adminEs["Released"],
    updatedAt: block.updatedAt,
  };
}

function presentCalendarBlockSource(
  blockSource: AdminCalendarBlockDto["source"],
) {
  if (blockSource === "BOOKING_CONFIRMED") {
    return "booking_confirmed";
  }

  if (blockSource === "BOOKING_HOLD") {
    return "booking_hold";
  }

  return "manual_block";
}

function presentCalendarBlockSourceLabel(
  blockSource: AdminCalendarBlockDto["source"],
) {
  if (blockSource === "BOOKING_CONFIRMED") {
    return adminEs["Confirmed booking"];
  }

  if (blockSource === "BOOKING_HOLD") {
    return adminEs["Checkout hold"];
  }

  return adminEs["Manual block"];
}
