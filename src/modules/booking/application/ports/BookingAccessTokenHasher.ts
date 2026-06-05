export type BookingAccessTokenHasher = {
  algorithm: "SHA256";
  hash(rawToken: string): string;
};
