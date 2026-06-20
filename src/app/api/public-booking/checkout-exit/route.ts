import { NextResponse } from "next/server";

import { getContainer } from "@/container";
import { parsePublicBookingCheckoutExit } from "@/interface/next/validators/publicBookingValidators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const command = parsePublicBookingCheckoutExit(payload);
    const result = await getContainer().publicBooking.exitCheckout(command);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        action: "IGNORED",
        bookingId: null,
      },
      {
        status: 202,
      },
    );
  }
}
