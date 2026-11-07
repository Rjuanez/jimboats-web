import { Container } from "@/components/layout/Container";
import type { MarketingPage } from "@/content/marketing";
import { legalCopy } from "@/content/marketing/legal";
import { SeoSiteShell } from "./SeoSiteChrome";

export function SeoLegalPage({ page }: { page: MarketingPage }) {
  const copy = legalCopy[page.locale];
  return (
    <SeoSiteShell page={page}>
      <Container className="py-16 lg:py-24">
        <h1 className="font-display text-4xl sm:text-6xl">{copy[0]}</h1>
        <section className="mt-10 max-w-3xl rounded-3xl border border-sand bg-white p-6 sm:p-10">
          <h2 className="font-display text-3xl">{copy[1]}</h2>
          <dl className="mt-6 space-y-5">
            {[
              [copy[2], page.operator.legalName],
              [copy[3], page.operator.taxId],
              [copy[4], page.operator.registeredAddress],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-text-muted">{label}</dt>
                <dd className="mt-1 font-semibold">{value}</dd>
              </div>
            ))}
            <div>
              <dt className="text-sm text-text-muted">{copy[5]}</dt>
              <dd className="mt-2 flex flex-col gap-2">
                <a className="underline" href={`mailto:${page.operator.email}`}>
                  {page.operator.email}
                </a>
                <a className="underline" href={page.operator.phoneLink}>
                  {page.operator.phone}
                </a>
              </dd>
            </div>
          </dl>
        </section>
        <section className="mt-12 max-w-3xl">
          <h2 className="font-display text-3xl">{copy[6]}</h2>
          <p className="mt-4 leading-7">{copy[7]}</p>
          <a
            href={page.operator.directions}
            className="mt-3 inline-block py-2 font-semibold underline"
          >
            {page.operator.address} ↗
          </a>
        </section>
      </Container>
    </SeoSiteShell>
  );
}
