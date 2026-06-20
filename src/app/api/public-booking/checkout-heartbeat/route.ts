import { NextResponse } from "next/server";

import { getContainer } from "@/container";
import { parsePublicBookingCheckoutHeartbeat } from "@/interface/next/validators/publicBookingValidators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const command = parsePublicBookingCheckoutHeartbeat(payload);
    const result =
      await getContainer().publicBooking.recordCheckoutHeartbeat(command);

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
