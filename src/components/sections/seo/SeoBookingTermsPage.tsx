import { Container } from "@/components/layout/Container";
import type { MarketingPage } from "@/content/marketing";
import { SeoSiteShell } from "./SeoSiteChrome";

type Props = {
  page: MarketingPage;
  title: string;
  operatorLabel: string;
  sections: readonly { title: string; paragraphs: readonly string[] }[];
};

export function SeoBookingTermsPage({
  page,
  title,
  operatorLabel,
  sections,
}: Props) {
  const { operator } = page;
  return (
    <SeoSiteShell page={page}>
      <Container className="py-16 lg:py-24">
        <article className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl sm:text-6xl">{title}</h1>
          <section className="mt-10 rounded-3xl border border-sand bg-white p-6 sm:p-8">
            <h2 className="font-display text-3xl">{operatorLabel}</h2>
            <address className="mt-4 space-y-2 not-italic leading-7">
              <p>
                {operator.legalName} · NIF {operator.taxId}
              </p>
              <p>{operator.registeredAddress}</p>
              <p>
                <a
                  className="break-words underline"
                  href={`mailto:${operator.email}`}
                >
                  {operator.email}
                </a>
              </p>
              <p>
                <a className="underline" href={operator.phoneLink}>
                  {operator.phone}
                </a>
                {" · "}
                <a className="underline" href={operator.whatsapp}>
                  WhatsApp
                </a>
              </p>
            </address>
          </section>
          {sections.map((section) => (
            <section key={section.title} className="mt-12">
              <h2 className="font-display text-3xl">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 leading-7">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>
      </Container>
    </SeoSiteShell>
  );
}
