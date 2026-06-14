"use server";

import { ZodError } from "zod";

import { getContainer } from "@/container";
import type {
  AdminCouponActionResult,
  AdminCouponBatchInput,
  AdminCouponInput,
  AdminCouponsState,
} from "@/components/sections/admin-coupons/AdminCouponTypes";
import { ApplicationError } from "@/shared/application/ApplicationError";
import { DomainError } from "@/shared/domain/DomainError";

import { presentAdminCouponsWorkspace } from "../presenters/adminCouponsPresenter";
import {
  parseAdminCouponBatch,
  parseAdminCouponDuplicate,
  parseAdminCouponInput,
  parseAdminCouponStatusChange,
  parseAdminCouponUpdate,
} from "../validators/adminCouponValidators";

export async function createAdminCouponAction(
  input: AdminCouponInput,
): Promise<
  AdminCouponActionResult<{ couponId: string; state: AdminCouponsState }>
> {
  try {
    const coupon = parseAdminCouponInput(input);
    const container = getContainer();
    const couponId = makeCouponId(coupon.code);

    await container.adminCoupons.createCoupon({
      ...toCouponRulesCommand(coupon),
      actorId: "admin",
      campaignName: coupon.campaignName,
      code: coupon.code,
      couponId,
      name: coupon.name,
      now: new Date(),
      status: coupon.status,
    });

    return ok({
      couponId,
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function updateAdminCouponAction(input: {
  coupon: AdminCouponInput;
  couponId: string;
}): Promise<AdminCouponActionResult<{ state: AdminCouponsState }>> {
  try {
    const parsed = parseAdminCouponUpdate(input);
    const container = getContainer();

    await container.adminCoupons.updateCoupon({
      ...toCouponRulesCommand(parsed.coupon),
      actorId: "admin",
      campaignName: parsed.coupon.campaignName,
      couponId: parsed.couponId,
      name: parsed.coupon.name,
      now: new Date(),
      status: parsed.coupon.status,
    });

    return ok({
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function changeAdminCouponStatusAction(input: {
  couponId: string;
  status: AdminCouponInput["status"];
}): Promise<AdminCouponActionResult<{ state: AdminCouponsState }>> {
  try {
    const command = parseAdminCouponStatusChange(input);
    const container = getContainer();

    await container.adminCoupons.changeStatus({
      actorId: "admin",
      couponId: command.couponId,
      now: new Date(),
      status: command.status,
    });

    return ok({
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function duplicateAdminCouponAction(input: {
  couponId: string;
  newCode: string;
}): Promise<
  AdminCouponActionResult<{ couponId: string; state: AdminCouponsState }>
> {
  try {
    const command = parseAdminCouponDuplicate(input);
    const container = getContainer();
    const couponId = makeCouponId(command.newCode);

    await container.adminCoupons.duplicateCoupon({
      actorId: "admin",
      couponId: command.couponId,
      newCode: command.newCode,
      newCouponId: couponId,
      now: new Date(),
    });

    return ok({
      couponId,
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function generateAdminCouponBatchAction(
  input: AdminCouponBatchInput,
): Promise<AdminCouponActionResult<{ state: AdminCouponsState }>> {
  try {
    const batch = parseAdminCouponBatch(input);
    const container = getContainer();

    await container.adminCoupons.generateBatch({
      ...toCouponRulesCommand({
        ...batch,
        code: batch.codePrefix,
        name: batch.namePrefix,
      }),
      actorId: "admin",
      campaignName: batch.campaignName,
      codePrefix: batch.codePrefix,
      count: batch.count,
      namePrefix: batch.namePrefix,
      now: new Date(),
      status: batch.status,
    });

    return ok({
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function exportAdminCouponsCsvAction(): Promise<
  AdminCouponActionResult<{ csv: string }>
> {
  try {
    const csv = await getContainer().adminCoupons.exportCsv();

    return ok({
      csv,
    });
  } catch (error) {
    return failure(error);
  }
}

async function loadState(container: ReturnType<typeof getContainer>) {
  return presentAdminCouponsWorkspace(await container.adminCoupons.getWorkspace());
}

function toCouponRulesCommand(input: AdminCouponInput) {
  return {
    discountAmountMinor:
      input.discountType === "FIXED_AMOUNT"
        ? Math.round(input.discountValue * 100)
        : null,
    discountPercentageBps:
      input.discountType === "PERCENTAGE"
        ? Math.round(input.discountValue * 100)
        : null,
    discountType: input.discountType,
    experienceIds: input.experienceIds,
    maxTotalRedemptions: input.maxTotalRedemptions,
    validFrom: startOfDayUtc(input.validFrom),
    validUntil: input.validUntil ? endOfDayUtc(input.validUntil) : null,
  };
}

function startOfDayUtc(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function endOfDayUtc(value: string) {
  return new Date(`${value}T23:59:59.999Z`);
}

function makeCouponId(code: string) {
  const normalized = code
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `coupon-${normalized || "new"}`;
}

function ok<TData>(data: TData): AdminCouponActionResult<TData> {
  return {
    data,
    ok: true,
  };
}

function failure<TData = never>(
  error: unknown,
): AdminCouponActionResult<TData> {
  if (error instanceof ApplicationError || error instanceof DomainError) {
    return {
      message: error.message,
      ok: false,
    };
  }

  if (error instanceof ZodError) {
    return {
      message: error.issues[0]?.message ?? "Invalid admin coupon input.",
      ok: false,
    };
  }

  return {
    message: "Unexpected error while saving the coupon.",
    ok: false,
  };
}
