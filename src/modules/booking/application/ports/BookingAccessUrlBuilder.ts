export type BookingAccessUrlBuilder = {
  build(input: {
    locale: string;
    rawToken: string;
    reference: string;
  }): {
    path: string;
    url: string;
  };
};
