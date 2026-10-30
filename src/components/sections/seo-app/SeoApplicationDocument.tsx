import Link from "next/link";

import { Container } from "@/components/layout/Container";

export type SeoApplicationContent = {
  title: string;
  description: string;
  introduction: string;
  updated?: string;
  navigation: { label: string; href: string }[];
  sections: {
    title: string;
    paragraphs: string[];
    links?: { label: string; href: string }[];
  }[];
  contactLabel: string;
  contactEmail: string;
  siteLabel: string;
  siteHref: string;
};

const linkStyle =
  "inline-block rounded-sm py-2 text-primary-dark underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

export function SeoApplicationDocument({
  content,
}: {
  content: SeoApplicationContent;
}) {
  return (
    <div lang="es" className="min-h-screen bg-background text-text">
      <header className="border-b border-sand bg-white">
        <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-4">
          <Link
            className={`${linkStyle} font-semibold`}
            href="/es/jimboats-seo"
          >
            JimBoats SEO
          </Link>
          <nav aria-label="JimBoats SEO" className="flex flex-wrap gap-x-6">
            {content.navigation.map((link) => (
              <a className={linkStyle} href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </Container>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {content.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-text-muted">
          {content.introduction}
        </p>
        {content.updated ? (
          <p className="mt-4 text-sm text-text-muted">{content.updated}</p>
        ) : null}
        <div className="mt-10 space-y-9">
          {content.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p className="mt-3 leading-7" key={paragraph}>
                  {paragraph}
                </p>
              ))}
              {section.links?.map((link) => (
                <p className="mt-2" key={link.href}>
                  <a className={linkStyle} href={link.href}>
                    {link.label}
                  </a>
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <footer className="border-t border-sand bg-white">
        <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-5 text-sm">
          <p>
            {content.contactLabel}{" "}
            <a
              className={`${linkStyle} break-all`}
              href={`mailto:${content.contactEmail}`}
            >
              {content.contactEmail}
            </a>
          </p>
          <a className={linkStyle} href={content.siteHref}>
            {content.siteLabel}
          </a>
        </Container>
      </footer>
    </div>
  );
}
