import { NextResponse } from "next/server";

import { getContainer } from "@/container";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");
    const result =
      await getContainer().publicBooking.handleDepositPaymentWebhook({
        rawBody,
        signature,
      });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error: "Invalid Stripe webhook.",
      },
      {
        status: 400,
      },
    );
  }
}
