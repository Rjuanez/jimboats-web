import {
  Check,
  Clock,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { MarketingPage, MarketingExperience } from "@/content/marketing";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function SeoExperienceBookingCard({
  page,
  experience,
}: {
  page: MarketingPage;
  experience: MarketingExperience;
}) {
  const detail = page.detail!;
  const labels = detail.labels;
  const copy = labels.bookingCard;
  const facts = [
    { Icon: Clock, label: copy.durationLabel, value: experience.durationLabel },
    { Icon: Users, label: labels.people, value: experience.capacityLabel },
    { Icon: MapPin, label: labels.location, value: "Port Olímpic, Barcelona" },
    { Icon: Check, label: copy.includedLabel, value: detail.includedSummary },
  ];
  return (
    <aside
      aria-label={labels.reserve}
      className="rounded-4xl border border-sand/70 bg-white p-6 shadow-soft lg:sticky lg:top-8 lg:max-h-[calc(100dvh-4rem)] lg:overflow-y-auto"
    >
      <p className="inline-flex max-w-full rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase leading-5 tracking-wide text-emerald-800">
        {experience.confirmedPrice ? copy.bestPrice : page.copy.provisionalPrice}
      </p>
      <p className="mt-5 text-xs font-medium uppercase tracking-wider text-text-muted">
        {labels.from}
      </p>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-2 font-display text-5xl leading-tight text-primary-dark">
        {experience.formattedPrices[experience.featuredHours]}
        <span className="font-sans text-lg font-semibold">
          ({experience.featuredHours} h)
        </span>
      </p>
      <p className="mt-3 text-base font-semibold leading-6 text-emerald-800">
        {detail.priceHighlight}
      </p>
      <p className="mt-2 text-xs leading-5 text-text-muted">
        {labels.finalPrice}
      </p>
      <dl className="my-5 divide-y divide-sand/60 text-sm">
        {facts.map(({ Icon, label, value }) => (
          <div
            key={label}
            className="flex items-start justify-between gap-3 py-3.5"
          >
            <dt className="flex items-center gap-2 font-semibold text-primary-dark">
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {label}
            </dt>
            <dd className="max-w-[58%] text-right leading-6 text-text-muted">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="space-y-3">
        <Button
          href={`${experience.bookingHref}&hours=${experience.featuredHours}`}
          variant="accent"
          shape="pill"
          size="lg"
          className="min-h-14 w-full text-center"
        >
          <LockKeyhole className="size-4 shrink-0" aria-hidden="true" />
          {copy.bookNow}
        </Button>
        <Button
          href={page.operator.whatsapp}
          variant="secondary"
          shape="pill"
          size="lg"
          className="min-h-14 w-full border-emerald-200 text-center text-emerald-800 hover:bg-emerald-50 focus-visible:outline-emerald-700"
        >
          <WhatsAppIcon className="size-5 shrink-0" />
          {copy.whatsappBooking}
        </Button>
      </div>
      <p className="mt-5 flex items-start gap-2 text-xs leading-6 text-text-muted">
        <ShieldCheck
          className="mt-1 size-4 shrink-0 text-emerald-600"
          aria-hidden="true"
        />
        {copy.weatherAssurance}
      </p>
    </aside>
  );
}
