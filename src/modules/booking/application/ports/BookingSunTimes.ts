export interface BookingSunTimes {
  sunset(localDate: string): Date;
  sunrise?(localDate: string): Date;
}

export interface BookingSolarTimes extends BookingSunTimes {
  sunrise(localDate: string): Date;
}
