"use server";

import { presentAdminError } from "../presenters/adminErrorPresenter";

import { getContainer } from "@/container";
import type {
  AdminCalendarActionResult,
  AdminCalendarManualBlockInput,
  AdminCalendarReleaseBlockInput,
  AdminCalendarState,
} from "@/components/sections/admin-calendar/AdminCalendarTypes";

import {
  presentAdminCalendar,
  resolveCalendarPageRange,
} from "../presenters/adminCalendarPresenter";
import {
  parseAdminManualCalendarBlock,
  parseAdminReleaseCalendarBlock,
} from "../validators/adminCalendarValidators";

const currentAdminUserId = "admin-user";

export async function createAdminManualCalendarBlockAction(
  input: AdminCalendarManualBlockInput,
): Promise<
  AdminCalendarActionResult<{
    state: AdminCalendarState;
  }>
> {
  try {
    const commandInput = parseAdminManualCalendarBlock(input);
    const container = getContainer();

    await container.adminCalendar.createManualBlock({
      createdByUserId: currentAdminUserId,
      endTime: commandInput.endTime,
      localDate: commandInput.localDate,
      reason: commandInput.reason,
      startTime: commandInput.startTime,
    });

    return ok({
      state: await loadState(container, {
        fromLocalDate: commandInput.fromLocalDate,
        toLocalDate: commandInput.toLocalDate,
      }),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function releaseAdminManualCalendarBlockAction(
  input: AdminCalendarReleaseBlockInput,
): Promise<
  AdminCalendarActionResult<{
    state: AdminCalendarState;
  }>
> {
  try {
    const commandInput = parseAdminReleaseCalendarBlock(input);
    const container = getContainer();

    await container.adminCalendar.releaseManualBlock({
      calendarBlockId: commandInput.calendarBlockId,
    });

    return ok({
      state: await loadState(container, {
        fromLocalDate: commandInput.fromLocalDate,
        toLocalDate: commandInput.toLocalDate,
      }),
    });
  } catch (error) {
    return failure(error);
  }
}

async function loadState(
  container: ReturnType<typeof getContainer>,
  range: { fromLocalDate: string; toLocalDate: string },
) {
  const calendar = await container.adminCalendar.getCalendar(
    resolveCalendarPageRange(range),
  );

  return presentAdminCalendar(calendar);
}

function ok<TData>(data: TData): AdminCalendarActionResult<TData> {
  return {
    data,
    ok: true,
  };
}

function failure<TData = never>(
  error: unknown,
): AdminCalendarActionResult<TData> {
  return {
    message: presentAdminError(error),
    ok: false,
  };
}
