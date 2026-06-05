"use server";

import { ZodError } from "zod";

import { getContainer } from "@/container";
import type {
  AdminCalendarActionResult,
  AdminCalendarManualBlockInput,
  AdminCalendarReleaseBlockInput,
  AdminCalendarState,
} from "@/components/sections/admin-calendar/AdminCalendarTypes";
import { ApplicationError } from "@/shared/application/ApplicationError";
import { DomainError } from "@/shared/domain/DomainError";

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
  if (error instanceof ApplicationError || error instanceof DomainError) {
    return {
      message: error.message,
      ok: false,
    };
  }

  if (error instanceof ZodError) {
    return {
      message: error.issues[0]?.message ?? "Invalid calendar input.",
      ok: false,
    };
  }

  return {
    message: "Unexpected error while saving calendar.",
    ok: false,
  };
}
