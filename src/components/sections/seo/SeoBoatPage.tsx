import { Container } from "@/components/layout/Container";
import { MarketingImageFrame } from "@/components/marketing/MarketingImageFrame";
import { Button } from "@/components/ui/Button";
import { marketingImage, type MarketingPage } from "@/content/marketing";
import { boatCopy, boatPhotos } from "@/content/marketing/boat";
import { marketingPath } from "@/content/marketing/routes";
import { SeoSiteShell } from "./SeoSiteChrome";
import { SeoBreadcrumb } from "./SeoBreadcrumb";

export function SeoBoatPage({ page }: { page: MarketingPage }) {
  const copy = boatCopy[page.locale];
  const labels = page.copy.support;
  const metres = new Intl.NumberFormat(page.locale, {
    minimumFractionDigits: 2,
  });
  const facts = [
    [labels.model, "Llaut Llevant 39 (Punta Prima)"],
    [labels.length, metres.format(7.49) + " m"],
    [labels.beam, metres.format(3.03) + " m"],
    [page.pricing.guests, page.copy.capacityLabel],
  ];
  return (
    <SeoSiteShell page={page}>
      <SeoBreadcrumb page={page} />
      <Container className="pb-16 lg:pb-24">
        <header className="grid overflow-hidden rounded-3xl bg-primary-dark text-white lg:grid-cols-[0.85fr_1.3fr]">
          <div className="order-last flex flex-col justify-center p-7 sm:p-10 lg:order-first lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">
              JimBoats · Port Olímpic
            </p>
            <h1 className="my-5 text-balance font-display text-4xl sm:text-5xl lg:text-6xl">
              {page.title}
            </h1>
            <p className="max-w-prose text-base leading-7 sm:text-lg">
              {copy.lead}
            </p>
          </div>
          <div className="aspect-[4/3] lg:aspect-auto lg:min-h-96">
            <MarketingImageFrame
              image={marketingImage(boatPhotos.hero, copy.heroAlt)}
              priority
            />
          </div>
        </header>
        <section className="my-14 grid items-center gap-8 lg:my-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl">{copy.story}</h2>
            <p className="mt-5 max-w-prose leading-8">{copy.origin}</p>
            <p className="mt-3 max-w-prose leading-8">{copy.life}</p>
            <a
              href={marketingPath(page.locale, "about")}
              className="mt-5 inline-flex min-h-11 items-center font-semibold text-primary-dark underline underline-offset-4"
            >
              {page.copy.names.about} ↗
            </a>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-3xl">
            <MarketingImageFrame
              image={marketingImage(boatPhotos.story, copy.storyAlt)}
              imgClassName="object-[center_70%]"
            />
          </div>
        </section>
        <section className="grid items-center gap-8 border-y border-sand py-10 lg:grid-cols-[0.75fr_1fr] lg:gap-16">
          <div className="order-last aspect-[4/3] overflow-hidden rounded-3xl lg:order-first lg:aspect-[5/4]">
            <MarketingImageFrame
              image={marketingImage(boatPhotos.deck, copy.deckAlt)}
              imgClassName="object-contain bg-[#063944]"
            />
          </div>
          <div>
            <h2 className="mb-5 font-display text-4xl sm:text-5xl">
              {labels.specs}
            </h2>
            <dl className="divide-y divide-sand">
              {facts.map(([name, value]) => (
                <div
                  key={name}
                  className="flex items-baseline justify-between gap-4 py-3"
                >
                  <dt className="text-text-muted">{name}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
        <section className="pt-12 lg:pt-16">
          <h2 className="mb-7 font-display text-4xl sm:text-5xl">
            {copy.gallery}
          </h2>
          <div className="grid items-start gap-6 md:grid-cols-[0.8fr_1.2fr]">
            {[
              [boatPhotos.bow, copy.morning],
              [boatPhotos.evening, copy.sunset],
            ].map(([slug, caption]) => (
              <figure key={slug}>
                <div className="aspect-[3/2] overflow-hidden rounded-2xl">
                  <MarketingImageFrame image={marketingImage(slug, caption)} />
                </div>
                <figcaption className="mt-3 text-sm text-text-muted">
                  {caption}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8">
            <Button href={page.experiencesHref}>{labels.experiences} ↗</Button>
          </div>
        </section>
      </Container>
    </SeoSiteShell>
  );
}
