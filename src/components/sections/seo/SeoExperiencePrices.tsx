import type { MarketingPage } from "@/content/marketing";

export function SeoExperiencePrices({
  detail,
  capacityLabel,
}: {
  detail: NonNullable<MarketingPage["detail"]>;
  capacityLabel: string;
}) {
  return (
    <div
      id="experience-prices"
      className="mt-6 scroll-mt-24 border-l-2 border-sand pl-5"
    >
      <p className="leading-7 text-text-muted">
        {detail.pricing.summary} {detail.pricing.decoration}
      </p>
      <p className="mt-2 text-sm font-semibold leading-6 text-primary-dark">
        {detail.pricing.nextDurationLabel}.
      </p>
      <p className="mt-2 text-sm leading-6 text-text-muted">
        {detail.labels.finalPrice} {capacityLabel}.
      </p>
    </div>
  );
}
