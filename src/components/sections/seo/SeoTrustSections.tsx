import { PortWeather } from "@/components/marketing/PortWeather";
import { ArrowUpRight, MapPin, Plus } from "lucide-react";
import { Container } from "@/components/layout/Container";
import type { MarketingPage } from "@/content/marketing";

export function SeoFaq({
  page,
  compact = false,
}: {
  page: MarketingPage;
  compact?: boolean;
}) {
  const Wrapper = compact ? "div" : Container;
  return (
    <section
      id="faq"
      className={compact ? "" : "bg-background py-20 lg:py-28"}
      aria-labelledby="faq-title"
    >
      <Wrapper
        className={
          compact
            ? "space-y-7"
            : "grid items-start gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-20"
        }
      >
        <div className={compact ? "" : "lg:sticky lg:top-12"}>
          {!compact && (
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-dark">
              FAQ · JimBoats
            </p>
          )}
          <h2
            id="faq-title"
            className={
              compact
                ? "font-display text-3xl leading-tight sm:text-4xl"
                : "font-display text-4xl leading-tight sm:text-5xl lg:text-6xl"
            }
          >
            {page.detail?.labels.faq ?? page.copy.faqTitle}
          </h2>
          {!compact && (
            <p className="mt-6 max-w-sm leading-8 text-text-muted">
              {page.detail
                ? page.experiences.find((item) => item.id === page.key)?.title
                : page.copy.faqIntro}
            </p>
          )}
        </div>
        <div
          className={
            compact
              ? "divide-y divide-sand/70 border-y border-sand/70"
              : "space-y-3"
          }
        >
          {(page.detail?.faqs ?? page.copy.faqs).map(
            ([question, answer], index) => (
              <details
                key={question}
                className={
                  compact
                    ? "group"
                    : "group rounded-2xl border border-sand/60 bg-white/75 px-5 transition-colors open:bg-white sm:px-7"
                }
              >
                <summary className="flex min-h-20 cursor-pointer list-none items-center gap-4 py-5 focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden">
                  <span aria-hidden="true" className="text-xs text-text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="flex-1 text-base font-semibold leading-7">
                    {question}
                  </h3>
                  <Plus
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-primary-dark transition-transform group-open:rotate-45 motion-reduce:transition-none"
                  />
                </summary>
                <p className="pb-7 text-sm leading-7 text-text-muted sm:pl-8">
                  {answer}
                </p>
              </details>
            ),
          )}
        </div>
      </Wrapper>
    </section>
  );
}

export function SeoFindUs({ page }: { page: MarketingPage }) {
  return (
    <section
      id="find-us"
      className="bg-background py-16 lg:py-28"
      aria-labelledby="find-us-title"
    >
      <Container className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10">
        <div className="min-w-0">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
            Barcelona · Port Olímpic
          </p>
          <h2
            id="find-us-title"
            className="max-w-sm font-display text-4xl leading-tight sm:text-5xl"
          >
            {page.copy.findTitle}
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-text-muted">
            {page.copy.findText}
          </p>
          <a
            href={page.operator.directions}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-7 flex items-center gap-4 rounded-3xl border border-sand/60 bg-white p-5 shadow-soft transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transform-none motion-reduce:transition-none"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-light text-primary-dark">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-6">
                {page.operator.address}
              </span>
              <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary-dark">
                {page.copy.directions}
                <ArrowUpRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                  aria-hidden="true"
                />
              </span>
            </span>
          </a>
          <PortWeather
            key={page.locale}
            copy={page.weather}
            locale={page.locale}
          />
        </div>
        <div className="group relative min-w-0 rounded-4xl bg-white p-2 shadow-[0_18px_60px_-20px_rgb(23_55_75_/_0.25)] ring-1 ring-sand/50 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_-20px_rgb(23_55_75_/_0.32)] motion-reduce:transform-none motion-reduce:transition-none lg:sticky lg:top-8">
          <iframe
            src={page.operator.mapEmbed}
            title={page.copy.mapTitle}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="h-[420px] w-full rounded-[1.6rem] border-0 sm:h-[520px] lg:h-[660px]"
          />
        </div>
      </Container>
    </section>
  );
}
