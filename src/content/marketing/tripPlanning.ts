import copy from "./tripPlanning.json";
import { getExperienceDetailCopy } from "./experienceDetails";
import { marketingPath, type MarketingLocale } from "./routes";

export function getTripPlanning(
  locale: MarketingLocale,
  dayTrip: { formattedPrices: Record<number, string>; bookingHref: string },
  portAccess: string,
) {
  const labels = copy[locale];
  const detail = getExperienceDetailCopy(locale);
  return {
    ...labels,
    rows: [1, 2, 4].map((hours, index) => {
      const duration = `${hours} ${hours === 1 ? detail.hour : detail.hours}`;
      return {
        hours,
        duration,
        price: dayTrip.formattedPrices[hours],
        includes:
          hours === 1
            ? detail.bookingCard.drink
            : `${detail.bookingCard.drinks} · ${detail.bookingCard.snacks}`,
        reason: labels.reasons[index],
        href: `${dayTrip.bookingHref}&hours=${hours}`,
        action: labels.choose.replace("{duration}", duration),
      };
    }),
    questions: [
      [labels.childrenQuestion, labels.childrenAnswer],
      [labels.accessQuestion, `${portAccess} ${labels.accessNote}`],
      [labels.itemsQuestion, labels.itemsAnswer],
      [labels.swimmingQuestion, labels.swimmingAnswer],
      [labels.foodQuestion, labels.foodAnswer],
      [labels.allergyQuestion, labels.allergyAnswer],
    ],
    pricesHref: `${marketingPath(locale, "prices")}#choose-duration`,
  };
}
