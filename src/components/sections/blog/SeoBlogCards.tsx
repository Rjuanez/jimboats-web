import { ArrowUpRight } from "lucide-react";
import { MarketingImageFrame } from "@/components/marketing/MarketingImageFrame";
import { marketingImage } from "@/content/marketing";
import type { BlogCard } from "@/content/blog/catalog";

export function SeoBlogCards({
  cards,
  readLabel,
}: {
  cards: BlogCard[];
  readLabel: string;
}) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <article key={card.key} className="min-w-0">
          <a
            href={card.href}
            tabIndex={-1}
            aria-hidden="true"
            className="group block aspect-[4/3] overflow-hidden rounded-3xl"
          >
            <MarketingImageFrame
              image={{
                ...marketingImage(card.imageSlug, ""),
                sizes:
                  "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
              }}
              imgClassName="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
            />
          </a>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
            {card.category}
          </p>
          <h3 className="mt-3 font-display text-3xl leading-tight">
            <a
              href={card.href}
              className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {card.title}
            </a>
          </h3>
          <p className="mt-4 text-sm leading-7 text-text-muted">
            {card.description}
          </p>
          <a
            href={card.href}
            aria-label={`${readLabel}: ${card.title}`}
            className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-dark underline underline-offset-4"
          >
            {readLabel}
            <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
          </a>
        </article>
      ))}
    </div>
  );
}
