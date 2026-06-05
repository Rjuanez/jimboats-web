import type { BookingAccessRepository } from "./ports/BookingAccessRepository";
import type { BookingAccessTokenGenerator } from "./ports/BookingAccessTokenGenerator";
import type { BookingAccessTokenHasher } from "./ports/BookingAccessTokenHasher";
import type { BookingAccessUrlBuilder } from "./ports/BookingAccessUrlBuilder";

const accessValidityDaysAfterIssue = 365;

export class IssueBookingAccessLinkUseCase {
  constructor(
    private readonly accessTokens: BookingAccessRepository,
    private readonly ids: BookingAccessTokenGenerator,
    private readonly hasher: BookingAccessTokenHasher,
    private readonly urlBuilder: BookingAccessUrlBuilder,
  ) {}

  async execute(input: {
    bookingId: string;
    issuedAt: Date;
    locale: string;
    reference: string;
  }) {
    const rawToken = this.ids.newAccessToken();
    const { path, url } = this.urlBuilder.build({
      locale: input.locale,
      rawToken,
      reference: input.reference,
    });
    const expiresAt = new Date(
      input.issuedAt.getTime() +
        accessValidityDaysAfterIssue * 24 * 60 * 60_000,
    );

    await this.accessTokens.saveAccessToken({
      accessPath: path,
      algorithm: this.hasher.algorithm,
      bookingId: input.bookingId,
      expiresAt,
      id: this.ids.newAccessTokenId({ bookingId: input.bookingId }),
      issuedAt: input.issuedAt,
      status: "ACTIVE",
      tokenHash: this.hasher.hash(rawToken),
    });

    return {
      expiresAt: expiresAt.toISOString(),
      url,
    };
  }
}
