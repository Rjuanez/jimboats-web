import { NextResponse } from "next/server";

import { getContainer } from "@/container";

const finalStatuses = new Set([
  "CANCELLED",
  "CONFIRMED",
  "EXITED",
  "EXPIRED",
  "PAYMENT_FAILED",
]);
const pollIntervalMs = 1000;
const waitTimeoutMs = 20000;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const providerSessionId = url.searchParams.get("session_id")?.trim();

  if (!providerSessionId) {
    return NextResponse.json({ content: null, timedOut: false });
  }

  const deadline = Date.now() + waitTimeoutMs;
  let lastContent = await getReturnContent(providerSessionId);

  while (lastContent?.status === "PENDING_PAYMENT" && Date.now() < deadline) {
    await delay(pollIntervalMs);
    lastContent = await getReturnContent(providerSessionId);

    if (lastContent && finalStatuses.has(lastContent.status)) {
      return NextResponse.json({ content: lastContent, timedOut: false });
    }
  }

  return NextResponse.json({
    content: lastContent,
    timedOut: lastContent?.status === "PENDING_PAYMENT",
  });
}

async function getReturnContent(providerSessionId: string) {
  try {
    return await getContainer().publicBooking.getCheckoutReturn({
      providerSessionId,
    });
  } catch {
    return null;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
