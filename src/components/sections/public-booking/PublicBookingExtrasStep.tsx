import { Check } from "lucide-react";

import { MarketingImageFrame } from "@/components/marketing/MarketingImageFrame";
import { cn } from "@/design/variants";
import { getPublicDictionary } from "@/i18n/public";

import type {
  PublicBookingContent,
  PublicBookingExtra,
} from "./PublicBookingTypes";

type PublicBookingExtrasStepProps = {
  content: PublicBookingContent;
  extras: readonly PublicBookingExtra[];
  formatPrice: (amount: number) => string;
  onSkipExtras: () => void;
  onToggleExtra: (extraId: string) => void;
  selectedExtraIds: readonly string[];
};

export function PublicBookingExtrasStep({
  content,
  extras,
  formatPrice,
  onSkipExtras,
  onToggleExtra,
  selectedExtraIds,
}: PublicBookingExtrasStepProps) {
  const copy = getPublicDictionary(content.locale).booking.extrasStep;

  return (
    <div className="space-y-6 lg:space-y-16">
      <header className="px-1 lg:px-0">
        <h1 className="font-display text-4xl leading-tight text-text lg:text-6xl">
          {copy.title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm font-light leading-6 text-text-muted lg:mt-4 lg:text-lg lg:leading-8">
          {copy.subtitle}
        </p>
      </header>

      <section
        aria-labelledby="extras-selection-title"
        className="px-1 lg:px-0"
      >
        <h2
          className="font-display text-2xl leading-none text-text lg:text-3xl"
          id="extras-selection-title"
        >
          {copy.selectionTitle}
        </h2>
        <div className="mt-4 grid gap-5 lg:mt-8 lg:grid-cols-2 lg:gap-6">
          {extras.length > 0 ? (
            extras.map((extra) => (
              <ExtraOption
                extra={extra}
                formatPrice={formatPrice}
                key={extra.id}
                onToggle={onToggleExtra}
                selected={selectedExtraIds.includes(extra.id)}
                labels={{ add: copy.add, remove: copy.remove }}
              />
            ))
          ) : (
            <div className="rounded-3xl border border-sand/35 bg-white px-5 py-8 text-sm text-text-muted shadow-soft lg:col-span-2">
              {copy.emptyExtras}
            </div>
          )}
        </div>
      </section>

      <div className="flex justify-center px-1 text-center lg:px-0">
        <button
          className="text-sm font-light uppercase tracking-widest text-text-muted underline underline-offset-4 transition hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
          onClick={onSkipExtras}
          type="button"
        >
          {copy.skip}
        </button>
      </div>
    </div>
  );
}

function ExtraOption({
  extra,
  formatPrice,
  onToggle,
  selected,
  labels,
}: {
  extra: PublicBookingExtra;
  formatPrice: (amount: number) => string;
  labels: {
    add: string;
    remove: string;
  };
  onToggle: (extraId: string) => void;
  selected: boolean;
}) {
  return (
    <button
      aria-pressed={selected}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border-2 bg-white text-left shadow-soft transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text",
        selected
          ? "border-primary shadow-floating lg:-translate-y-1"
          : "border-transparent hover:border-sand/60 lg:hover:-translate-y-0.5",
      )}
      onClick={() => onToggle(extra.id)}
      type="button"
    >
      <span className="relative block h-[220px] overflow-hidden bg-sand/25 lg:h-[240px]">
        <MarketingImageFrame image={extra.image} />
        <span
          className={cn(
            "absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-full border transition",
            selected
              ? "border-primary bg-primary text-white"
              : "border-white/80 bg-white/85 text-transparent",
          )}
        >
          <Check aria-hidden="true" className="size-4" />
        </span>
      </span>
      <span className="block p-5">
        <span className="flex items-start justify-between gap-4">
          <span className="font-display text-3xl leading-none text-text">
            {extra.title}
          </span>
          <span className="font-display text-2xl leading-none text-primary">
            +{formatPrice(extra.price)}
          </span>
        </span>
        <span className="mt-3 block text-sm font-light leading-6 text-text-muted">
          {extra.description}
        </span>
        <span className="mt-5 flex items-center justify-between gap-3">
          {extra.notice ? (
            <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              {extra.notice}
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex min-h-9 items-center rounded-full bg-sand/35 px-4 text-xs font-semibold uppercase tracking-widest text-text transition group-hover:bg-sand">
            {selected ? labels.remove : labels.add}
          </span>
        </span>
      </span>
    </button>
  );
}
