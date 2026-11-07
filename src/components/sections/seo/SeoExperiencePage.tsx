import { ArrowUpRight, Clock, MapPin, Users, Check } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { MarketingImageFrame } from "@/components/marketing/MarketingImageFrame";
import { Button } from "@/components/ui/Button";
import {
  marketingImage,
  type MarketingPage,
  type MarketingExperience,
} from "@/content/marketing";
import { PortSunTime } from "@/components/marketing/PortSunTime";
import { SeoSiteShell } from "./SeoSiteChrome";
import { SeoReviews } from "./SeoReviews";
import { SeoExperienceBookingCard } from "./SeoExperienceBookingCard";
import { SeoSolarCalendar } from "./SeoSolarCalendar";
import { SeoFaq } from "./SeoTrustSections";
import { SeoGuideLinks } from "../blog/SeoGuideLinks";
import { SeoTripPreparation } from "./SeoTripPreparation";

export function SeoExperiencePage({
  page,
  experience,
}: {
  page: MarketingPage;
  experience: MarketingExperience;
}) {
  const detail = page.detail!;
  const labels = detail.labels;
  const bookingHref = `${experience.bookingHref}&hours=${experience.featuredHours}`;
  const price = experience.formattedPrices[experience.featuredHours];
  return (
    <SeoSiteShell page={page}>
      <section className="relative isolate overflow-hidden bg-primary-dark text-white">
        <div className="absolute inset-0 -z-20">
          <MarketingImageFrame
            image={{
              ...marketingImage(experience.imageSlug, experience.title),
              sizes: "100vw",
            }}
            mobileImage={
              experience.id === "sunset"
                ? {
                    ...marketingImage("production-sunset-mobile", experience.title),
                    sizes: "100vw",
                  }
                : undefined
            }
            priority
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/60 to-black/25" />
        <Container className="pb-14 pt-6 sm:pb-20 lg:pb-24">
          <nav
            aria-label={labels.breadcrumbLabel}
            className="text-xs leading-6 text-white/90"
          >
            <ol className="flex flex-wrap items-center gap-x-2">
              <li>
                <a
                  className="underline underline-offset-4"
                  href={`/${page.locale}`}
                >
                  {page.copy.home}
                </a>
              </li>
              <li aria-hidden="true">›</li>
              <li>
                <a
                  className="underline underline-offset-4"
                  href={page.experiencesHref}
                >
                  {labels.breadcrumb}
                </a>
              </li>
              <li aria-hidden="true">›</li>
              <li aria-current="page">{experience.title}</li>
            </ol>
          </nav>
          <p className="mt-14 text-xs font-semibold uppercase tracking-[0.2em] sm:mt-20">
            JimBoats · {experience.shortName}
          </p>
          <h1 className="mt-5 max-w-4xl text-balance font-display text-4xl leading-[1.12] sm:text-5xl lg:text-6xl">
            {page.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/95 sm:text-lg">
            {page.description}
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Users className="size-4" aria-hidden="true" />
              {experience.capacityLabel}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4" aria-hidden="true" />
              {experience.durationLabel}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden="true" />
              Port Olímpic · Barcelona
            </li>
          </ul>
          {(experience.id === "sunrise" || experience.id === "sunset") && (
            <PortSunTime
              locale={page.locale}
              event={experience.id}
              copy={labels.sunTimes}
            />
          )}
          <Button
            href={bookingHref}
            variant="accent"
            shape="pill"
            className="mt-9"
          >
            {labels.reserve}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Button>
        </Container>
      </section>

      <section aria-labelledby="experience-included" className="pt-8">
        <Container>
          <div className="rounded-2xl bg-[#f3f0e9] px-4 py-[18px] sm:px-6 sm:py-[22px]">
            <h2
              id="experience-included"
              className="mb-3.5 text-[13px] font-semibold uppercase tracking-wider text-[#213e54] sm:mb-4"
            >
              {labels.bookingCard.includedLabel}
            </h2>
            <ul className="flex flex-wrap gap-[9px]">
              {detail.includedItems.map((item) => (
                <li
                  key={item}
                  className="inline-flex max-w-full items-center gap-2 rounded-xl border border-[#e3ded2] bg-[#fdfcf9] px-3 py-2 text-sm font-medium leading-6 text-[#213e54] sm:gap-[9px] sm:px-3.5 sm:text-[15px]"
                >
                  <Check
                    className="size-[15px] shrink-0 text-[#4d806c] stroke-[1.8]"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 max-w-3xl border-t border-sand pt-4 text-sm leading-6 text-text-muted">
              <p className="font-semibold text-text">{page.onboard.title}</p>
              <p className="mt-2">{page.onboard.drinks}</p><p>{page.onboard.food}</p>
            </div>
          </div>
        </Container>
      </section>

      <Container className="grid items-start gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16 lg:py-16">
        <div className="min-w-0 divide-y divide-sand/80 [&>section]:py-10 [&>section:first-child]:pt-0 [&>section:last-child]:pb-0">
          <section aria-labelledby="experience-about">
            <h2
              id="experience-about"
              className="font-display text-3xl leading-tight sm:text-4xl"
            >
              {labels.about}
            </h2>
            {detail.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-5 leading-8 text-text-muted">
                {paragraph}
              </p>
            ))}
          </section>
          <section aria-labelledby="experience-itinerary">
            <h2
              id="experience-itinerary"
              className="font-display text-3xl sm:text-4xl"
            >
              {labels.itinerary}
            </h2>
            <ol className="mt-7 space-y-6">
              {detail.steps.map((step, i) => (
                <li key={step} className="flex gap-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-light text-xs font-semibold text-primary-dark">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="leading-8 text-text-muted">{step}</p>
                </li>
              ))}
            </ol>
          </section>
          <section aria-labelledby="experience-audience">
            <h2
              id="experience-audience"
              className="font-display text-3xl sm:text-4xl"
            >
              {labels.audience}
            </h2>
            <p className="mt-5 leading-8 text-text-muted">{detail.audience}</p>
          </section>
          {detail.solarCalendar && (
            <SeoSolarCalendar calendar={detail.solarCalendar} />
          )}
          <SeoReviews page={page} compact />
          <SeoFaq page={page} compact />
          <SeoTripPreparation page={page} />
          <SeoGuideLinks page={page} compact />
          <section className="" aria-labelledby="experience-gallery">
            <div>
              <h2
                id="experience-gallery"
                className="font-display text-3xl sm:text-4xl"
              >
                {labels.gallery}
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-text-muted">
                {labels.galleryNote}
              </p>
              <div className="mt-8 grid grid-cols-2 items-start gap-3 sm:gap-5 ">
                {detail.gallerySlugs.map((slug, i) => (
                  <div
                    key={slug}
                    className={`overflow-hidden rounded-2xl sm:rounded-3xl ${experience.id === "sunrise" || experience.id === "romantic" ? (i === 0 ? "col-span-2" : "") : experience.id === "sunset" && i === 0 ? "col-span-2 aspect-[16/10]" : experience.id === "sunset" && (i === 1 || i === 2) ? "aspect-[3/4]" : "aspect-[4/3]"}`}
                  >
                    <MarketingImageFrame
                      image={{
                        ...marketingImage(slug, detail.galleryAlts[i]),
                        sizes: experience.id !== "private" && i === 0 ? "(min-width: 1024px) 65vw, 100vw" : "(min-width: 1024px) 35vw, 50vw",
                      }}
                      imgClassName={experience.id === "sunrise" || experience.id === "romantic" ? "h-auto" : experience.id === "sunset" && i === 1 ? "object-[center_75%]" : undefined}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
        <SeoExperienceBookingCard page={page} experience={experience} />
      </Container>
      <SeoExperienceCards page={page} />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand bg-white/95 px-5 py-3 shadow-floating backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            {labels.from}
            <span className="mt-1 block whitespace-nowrap font-display text-2xl text-text">
              {price}{" "}
              <span className="font-sans text-xs">
                / {experience.featuredHours} h
              </span>
            </span>
          </p>
          <Button href={bookingHref} variant="accent" shape="pill" size="sm">
            {labels.reserve}
          </Button>
        </div>
      </div>
    </SeoSiteShell>
  );
}

export function SeoExperienceCards({ page }: { page: MarketingPage }) {
  return (
    <section id="experiences" className="bg-background py-16 lg:py-24">
      <Container>
        <h2 className="font-display text-4xl sm:text-5xl">
          {page.copy.otherExperiences}
        </h2>
        <div className="mt-9 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {page.experiences
            .filter((item) => item.id !== page.key)
            .map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-3xl border border-sand/60 bg-white"
              >
                <a
                  href={item.href}
                  className="block aspect-[4/3] overflow-hidden"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <MarketingImageFrame
                    image={marketingImage(item.imageSlug, "")}
                  />
                </a>
                <div className="p-6 sm:p-7">
                  <p className="text-xs text-text-muted">
                    {item.capacityLabel} · {item.durationLabel}
                  </p>
                  <h3 className="mt-3 font-display text-2xl leading-tight">
                    <a
                      href={item.href}
                      className="hover:underline underline-offset-4"
                    >
                      {item.title}
                    </a>
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-text-muted">
                    {item.description}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm">
                      {page.detailCopy.from}{" "}
                      <strong>
                        {item.formattedPrices[item.featuredHours]}
                      </strong>{" "}
                      / {item.featuredHours} h
                    </p>
                    <a
                      className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-dark underline underline-offset-4"
                      href={item.href}
                    >
                      {page.copy.details}
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </Container>
    </section>
  );
}
