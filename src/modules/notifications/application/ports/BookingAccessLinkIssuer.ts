export type BookingAccessLinkIssuer = {
  execute(input: {
    bookingId: string;
    issuedAt: Date;
    locale: string;
    reference: string;
  }): Promise<{
    expiresAt: string;
    url: string;
  }>;
};
