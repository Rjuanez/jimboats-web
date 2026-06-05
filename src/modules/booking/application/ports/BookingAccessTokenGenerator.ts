export type BookingAccessTokenGenerator = {
  newAccessToken(): string;
  newAccessTokenId(input: { bookingId: string }): string;
};
