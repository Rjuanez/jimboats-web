import { MapPin, Navigation, Mail, Phone } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { Container } from "@/components/layout/Container";
import { SeoBoatPage } from "./SeoBoatPage";
import type { MarketingPage } from "@/content/marketing";
import { SeoTeam } from "./SeoTeam";
import { blogPath } from "@/content/blog/catalog";
import { SeoSiteShell } from "./SeoSiteChrome";
import { SeoBreadcrumb } from "./SeoBreadcrumb";
import { SeoDurationGuide } from "./SeoDurationGuide";
import { SeoTripPreparation } from "./SeoTripPreparation";

const heading = "mb-4 font-display text-3xl sm:text-4xl";
const link =
  "inline-flex min-h-11 items-center font-semibold text-primary-dark underline underline-offset-4";
type Props = { page: MarketingPage };

function Prices({ page }: Props) {
  const copy = page.pricing;
  const groups = [
    {
      label: copy.dayTrip,
      experience: page.experiences.find((item) => item.id === "private")!,
    },
    {
      label: copy.twilight,
      experience: page.experiences.find((item) => item.id === "sunset")!,
    },
    {
      label: copy.romantic,
      experience: page.experiences.find((item) => item.id === "romantic")!,
    },
  ];
  return (
    <>
      <SeoDurationGuide planning={page.planning} />
      <section>
        <h2 className={heading}>{page.copy.pricesHeading}</h2>
        <p className="mb-6 max-w-3xl text-text-muted">{page.copy.priceNote}</p>
        <div className="max-w-3xl divide-y divide-sand" id="pricing-rules">
          {groups.map(({ label, experience }) => (
            <div key={label} className="py-5 first:pt-0">
              <h3 className="text-lg font-semibold text-primary-dark">
                {label}
              </h3>
              <p className="mt-2 text-text-muted">
                {experience.pricing.summary}
              </p>
              {experience.pricing.decoration && (
                <p className="mt-1 text-text-muted">
                  {experience.pricing.decoration}
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-sm text-text-muted">
          {copy.boatNote}
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6">
          {page.experiences.map((item) => (
            <a key={item.id} className={link} href={item.href}>
              {item.title} ↗
            </a>
          ))}
        </div>
      </section>
      <section>
        <h2 className={heading}>{page.onboard.title}</h2>
        <p>{page.onboard.drinks}</p>
        <p className="mt-3">{page.onboard.food}</p>
        <a className={link} href={blogPath(page.locale, "food")}>
          {page.guides.find((guide) => guide.key === "food")?.title} ↗
        </a>
      </section>
      <section>
        <h2 className={heading}>{page.copy.support.optional}</h2>
        <dl className="max-w-2xl divide-y divide-sand">
          {page.pricing.extrasRows.map((row) => (
            <div key={row.name} className="flex justify-between gap-4 py-3">
              <dt>{row.name}</dt>
              <dd>
                {row.price
                  ? row.price + " · " + page.pricing.perBooking
                  : page.pricing.consult}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

function Contact({ page }: Props) {
  const support = page.copy.support;
  const portGuide = {
    es: "es/contacto/como-llegar",
    fr: "fr/contact/comment-sy-rendre",
    en: "en/contact/how-to-get-there",
    de: "en/contact/how-to-get-there",
    nl: "en/contact/how-to-get-there",
  }[page.locale];
  return (
    <>
      <section
        aria-labelledby="meeting-point"
        className="grid overflow-hidden rounded-3xl border border-sand bg-white lg:grid-cols-2"
      >
        <div className="p-5 sm:p-8 lg:p-10">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
            <MapPin aria-hidden="true" size={18} />
            {support.meeting}
          </p>
          <h2
            id="meeting-point"
            className="mb-2 mt-3 font-display text-4xl sm:text-5xl"
          >
            Port Olímpic
          </h2>
          <address className="text-base not-italic font-semibold">
            {page.operator.address}
          </address>
          <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
            <a
              href={page.operator.directions}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-dark px-5 py-2 font-semibold text-white"
            >
              <Navigation aria-hidden="true" size={18} />
              {page.copy.directions}
            </a>
            <a
              href={page.operator.whatsapp}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-2 font-semibold text-white"
            >
              <WhatsAppIcon className="size-5" />
              {page.copy.whatsapp}
            </a>
          </div>
          <p className="mt-5 text-sm text-text-muted">{support.arrival}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 text-sm">
            <a className={link + " gap-2"} href={page.operator.phoneLink}>
              <Phone size={15} aria-hidden="true" />
              {page.operator.phone}
            </a>
            <a
              className={link + " gap-2"}
              href={"mailto:" + page.operator.email}
            >
              <Mail size={15} aria-hidden="true" />
              {page.operator.email}
            </a>
          </div>
        </div>
        <iframe
          className="h-72 w-full border-0 sm:h-80 lg:h-full lg:min-h-96"
          src={page.operator.mapEmbed + "&hl=" + page.locale}
          title={page.copy.mapTitle}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
      <section aria-labelledby="port-access">
        <h2 id="port-access" className={heading}>
          {page.copy.directions}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            [support.metro, support.metroRoute],
            [support.access, support.accessRoute],
          ].map(([title, body]) => (
            <div key={title} className="border-t border-sand pt-4">
              <h3 className="font-display text-2xl">{title}</h3>
              <p className="mt-2 text-text-muted">{body}</p>
            </div>
          ))}
        </div>
        <a
          className={link + " mt-3"}
          href={"https://portolimpic.barcelona/" + portGuide}
        >
          {support.portGuide} ↗
        </a>
      </section>
      <section id="faq" className="max-w-3xl">
        <h2 className={heading}>{page.copy.support.conditions}</h2>
        <dl>
          {[
            [
              page.cancellationPolicy.question,
              page.cancellationPolicy.cancellation,
            ],
            [
              page.cancellationPolicy.weatherQuestion,
              page.cancellationPolicy.weather,
            ],
          ].map(([q, a]) => (
            <div key={q} className="mb-4">
              <dt className="font-semibold">{q}</dt>
              <dd className="mt-1">{a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

export function SeoSupportPage({ page }: Props) {
  if (page.key === "boat") return <SeoBoatPage page={page} />;
  return (
    <SeoSiteShell page={page}>
      <SeoBreadcrumb page={page} />
      <Container className="pb-16 lg:pb-24">
        <header className="max-w-4xl pb-9 pt-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">
            JimBoats · Barcelona
          </p>
          <h1 className="mt-4 text-balance font-display text-4xl sm:text-6xl">
            {page.title}
          </h1>
          {page.key !== "contact" && (
            <p className="mt-5 max-w-3xl text-lg leading-8 text-text-muted">
              {page.description}
            </p>
          )}
        </header>
        <div className="space-y-12 border-t border-sand pt-8 leading-7">
          {page.key === "prices" ? (
            <Prices page={page} />
          ) : page.key === "about" ? (
            <SeoTeam page={page} />
          ) : (
            <Contact page={page} />
          )}
          {(page.key === "prices" || page.key === "contact") && (
            <SeoTripPreparation page={page} />
          )}
        </div>
      </Container>
    </SeoSiteShell>
  );
}
