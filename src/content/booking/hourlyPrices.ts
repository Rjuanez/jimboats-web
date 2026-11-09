// Final EUR totals per private boat. Additional hours start after baseHours.
const twilight = {
  baseHours: 2,
  basePrice: 220,
  extraHourPrice: 90,
  maxHours: 6,
};
export const hourlyPriceRules: Record<
  string,
  {
    baseHours: number;
    basePrice: number;
    extraHourPrice: number;
    maxHours: number;
  }
> = {
  daytrip: { baseHours: 1, basePrice: 120, extraHourPrice: 90, maxHours: 6 },
  "ex-sunset": twilight,
  sunrise: twilight,
  romantic: { baseHours: 1, basePrice: 250, extraHourPrice: 100, maxHours: 4 },
};

export const hourlyPrices: Record<
  string,
  Record<number, number>
> = Object.fromEntries(
  Object.entries(hourlyPriceRules).map(([id, rule]) => [
    id,
    Object.fromEntries(
      Array.from(
        { length: rule.maxHours - rule.baseHours + 1 },
        (_, extraHours) => [
          rule.baseHours + extraHours,
          rule.basePrice + extraHours * rule.extraHourPrice,
        ],
      ),
    ),
  ]),
);

export const confirmedPriceIds = [
  "daytrip",
  "ex-sunset",
  "sunrise",
  "romantic",
];
export const hourlyDurationOptions = Object.fromEntries(
  Object.entries(hourlyPrices).map(([id, prices]) => [
    id,
    Object.keys(prices).map(Number),
  ]),
);
