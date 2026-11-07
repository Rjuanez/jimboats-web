// EUR per private boat, keyed by duration in hours.
const twilight = { 2: 220, 3: 310, 4: 400, 5: 490, 6: 580 };
export const hourlyPrices: Record<string, Record<number, number>> = {
  daytrip: { 1: 120, 2: 210, 3: 300, 4: 390, 5: 480, 6: 570 },
  "ex-sunset": twilight,
  sunrise: twilight,
  romantic: { 1: 250, 2: 350, 3: 450, 4: 550 },
};

export const confirmedPriceIds = ["daytrip", "ex-sunset", "sunrise", "romantic"];
export const hourlyDurationOptions = Object.fromEntries(
  Object.entries(hourlyPrices).map(([id, prices]) => [id, Object.keys(prices).map(Number)]),
);
