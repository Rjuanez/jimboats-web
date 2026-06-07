"use server";

import { ZodError } from "zod";

import { getContainer } from "@/container";
import type {
  PublicBookingCheckoutActionResult,
  PublicBookingCheckoutInput,
} from "@/components/sections/public-booking/PublicBookingTypes";
import { ApplicationError } from "@/shared/application/ApplicationError";
import { DomainError } from "@/shared/domain/DomainError";

import { parsePublicBookingCheckout } from "../validators/publicBookingValidators";

export async function startPublicBookingCheckoutAction(
  input: PublicBookingCheckoutInput,
): Promise<
  PublicBookingCheckoutActionResult<{
    checkoutClientSecret: string;
    paymentProviderSessionId: string;
  }>
> {
  try {
    const commandInput = parsePublicBookingCheckout(input);
    const baseUrl = publicSiteUrlFromEnv();
    const checkout = await getContainer().publicBooking.createCheckout({
      consents: commandInput.consents,
      customer: {
        email: commandInput.customer.email,
        fullName: commandInput.customer.fullName,
        phone: commandInput.customer.phone || null,
        preferredLocale: commandInput.locale,
      },
      endTime: commandInput.endTime,
      experienceId: commandInput.experienceId,
      guestCount: commandInput.guestCount,
      localDate: commandInput.localDate,
      selectedExtras: [...commandInput.selectedExtras],
      slotKey: commandInput.slotKey,
      startTime: commandInput.startTime,
      returnUrl: `${baseUrl}/${commandInput.locale}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    });

    return {
      data: {
        checkoutClientSecret: checkout.checkoutClientSecret,
        paymentProviderSessionId: checkout.paymentProviderSessionId,
      },
      ok: true,
    };
  } catch (error) {
    return failure(error);
  }
}

function publicSiteUrlFromEnv() {
  const explicitUrl = process.env.PUBLIC_SITE_URL?.trim();

  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, "");
  }

  const appDomain = process.env.APP_DOMAIN?.trim();

  if (appDomain) {
    return `https://${appDomain}`.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}

function failure<TData = never>(
  error: unknown,
): PublicBookingCheckoutActionResult<TData> {
  if (error instanceof ApplicationError || error instanceof DomainError) {
    return {
      message: error.message,
      ok: false,
    };
  }

  if (error instanceof ZodError) {
    return {
      message: error.issues[0]?.message ?? "Invalid booking input.",
      ok: false,
    };
  }

  return {
    message: "Unexpected error while starting secure checkout.",
    ok: false,
  };
}
