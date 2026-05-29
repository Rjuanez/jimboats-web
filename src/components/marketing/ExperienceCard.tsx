import { ArrowRight, Star } from "lucide-react";

import { cn } from "@/design/variants";

import {
  MarketingImageFrame,
  type MarketingImage,
} from "./MarketingImageFrame";

export type ExperienceCardProps = {
  ctaHref: string;
  ctaLabel: string;
  description: string;
  featured?: boolean;
  id: string;
  image: MarketingImage;
  price: string;
  reverse?: boolean;
  title: string;
};

export function ExperienceCard({
  ctaHref,
  ctaLabel,
  description,
  featured = false,
  id,
  image,
  price,
  reverse = false,
  title,
}: ExperienceCardProps) {
  return (
    <article
      className="overflow-hidden rounded-4xl border border-sand/25 bg-white shadow-soft lg:grid lg:grid-cols-12 lg:items-center lg:gap-16 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none"
      id={id}
    >
      <div
        className={cn(
          "relative h-64 overflow-hidden lg:col-span-7 lg:h-[650px] lg:rounded-5xl lg:shadow-[0_30px_60px_-15px_rgb(0_0_0_/_0.12)]",
          featured && "lg:h-[750px]",
          reverse ? "lg:order-1" : "lg:order-2",
        )}
      >
        <MarketingImageFrame
          image={image}
          imgClassName="transition-transform duration-700 hover:scale-105"
        />
      </div>

      <div
        className={cn(
          "p-6 sm:p-8 lg:col-span-5 lg:p-0",
          reverse ? "lg:order-2 lg:pl-2" : "lg:order-1 lg:pr-2",
        )}
      >
        {featured ? (
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-sand/40 bg-white px-4 py-2 text-xs font-semibold uppercase text-text-muted shadow-soft">
            <Star aria-hidden="true" className="h-4 w-4 text-accent" />
            Most Popular
          </p>
        ) : null}

        <h2 className="font-display text-4xl leading-tight text-text sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        <p className="mt-5 text-sm leading-7 text-text-muted sm:text-base lg:mt-8 lg:text-lg">
          {description}
        </p>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-sand/50 pt-5 lg:mt-10 lg:border-t-0 lg:border-b lg:pb-6 lg:pt-0">
          <div>
            <span className="block text-xs font-medium uppercase text-text-muted">
              Starting from
            </span>
            <p className="font-display text-3xl text-text sm:text-4xl">
              {price}
            </p>
          </div>
          <a
            aria-label={`${ctaLabel}: ${title}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-text px-5 text-xs font-semibold uppercase text-white transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text sm:px-6"
            href={ctaHref}
          >
            <span>{ctaLabel}</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
