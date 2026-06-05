import { createHash, randomBytes, randomUUID } from "node:crypto";

import type { BookingAccessTokenGenerator } from "@/modules/booking/application/ports/BookingAccessTokenGenerator";
import type { BookingAccessTokenHasher } from "@/modules/booking/application/ports/BookingAccessTokenHasher";

export class CryptoBookingAccessTokenService
  implements BookingAccessTokenGenerator, BookingAccessTokenHasher
{
  readonly algorithm = "SHA256" as const;

  hash(rawToken: string) {
    return createHash("sha256").update(rawToken).digest("base64url");
  }

  newAccessToken() {
    return randomBytes(32).toString("base64url");
  }

  newAccessTokenId(input: { bookingId: string }) {
    return `booking-access-token-${input.bookingId}-${randomUUID()}`;
  }
}
