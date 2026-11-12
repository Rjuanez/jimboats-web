import { Container } from "@/components/layout/Container";
import type { MarketingPage } from "@/content/marketing";
import type { PrivacyDocument } from "@/content/privacy";
import { SeoSiteShell } from "./SeoSiteChrome";

export function SeoPrivacyPage({
  page,
  document,
}: {
  page: MarketingPage;
  document: PrivacyDocument;
}) {
  return (
    <SeoSiteShell page={page}>
      <Container className="py-16 lg:py-24">
        <article className="mx-auto max-w-3xl break-words">
          <h1 className="font-display text-4xl sm:text-6xl">
            {document.title}
          </h1>
          <p className="mt-4 text-sm text-text-muted">{document.updated}</p>
          <p className="mt-6 leading-7">{document.intro}</p>
          <section
            aria-labelledby="privacy-controller"
            className="mt-10 rounded-3xl border border-sand bg-white p-6 sm:p-8"
          >
            <h2 id="privacy-controller" className="font-display text-3xl">
              {document.controller}
            </h2>
            <p className="mt-4 font-semibold">{page.operator.legalName}</p>
            <p className="mt-2">
              {document.taxId}: {page.operator.taxId}
            </p>
            <address className="mt-2 not-italic leading-7">
              {page.operator.registeredAddress}
            </address>
            <p className="mt-4 text-sm">{document.contact}</p>
            <a
              className="inline-block break-all py-2 underline underline-offset-4"
              href={`mailto:${page.operator.email}`}
            >
              {page.operator.email}
            </a>
          </section>
          {document.sections.map((section) => (
            <PrivacySection key={section.id} section={section} />
          ))}
          <section aria-labelledby="privacy-retention" className="mt-12">
            <h2 id="privacy-retention" className="font-display text-3xl">
              {document.retention.title}
            </h2>
            <p className="mt-4 leading-7">{document.retention.intro}</p>
            <dl className="mt-6 divide-y divide-sand rounded-3xl border border-sand bg-white px-6 sm:px-8">
              {document.retention.rows.map(([label, period]) => (
                <div className="py-5" key={label}>
                  <dt className="font-semibold">{label}</dt>
                  <dd className="mt-2 text-sm leading-7 text-text-muted">
                    {period}
                  </dd>
                </div>
              ))}
            </dl>
            {document.retention.notes.map((paragraph) => (
              <p className="mt-4 leading-7" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </section>
          {document.after.map((section) => (
            <PrivacySection key={section.id} section={section} />
          ))}
          <ul className="mt-8 space-y-3 text-sm leading-6">
            {[
              [document.authority, "https://www.aepd.es/"],
              [document.adsPrivacy, "https://openai.com/policies/eu-privacy-policy/"],
              [document.adsDataTerms, "https://openai.com/policies/ad-tools-dpa/"],
              [
                document.legalBasis,
                "https://www.boe.es/buscar/act.php?id=BOE-A-1885-6627#art30",
              ],
              [
                document.blocking,
                "https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673#a32",
              ],
            ].map(([label, href]) => (
              <li key={href}>
                <a
                  className="inline-block py-1 underline underline-offset-4"
                  href={href}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </article>
      </Container>
    </SeoSiteShell>
  );
}

function PrivacySection({
  section,
}: {
  section: PrivacyDocument["sections"][number];
}) {
  return (
    <section aria-labelledby={`privacy-${section.id}`} className="mt-12">
      <h2 id={`privacy-${section.id}`} className="font-display text-3xl">
        {section.title}
      </h2>
      {section.paragraphs.map((paragraph) => (
        <p className="mt-4 leading-7" key={paragraph}>
          {paragraph}
        </p>
      ))}
    </section>
  );
}
