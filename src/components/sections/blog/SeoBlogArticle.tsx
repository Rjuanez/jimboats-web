import { Container } from "@/components/layout/Container";
import { MarketingImageFrame } from "@/components/marketing/MarketingImageFrame";
import { Button } from "@/components/ui/Button";
import type { BlogPage } from "@/interface/next/presenters/blogPresenter";
import { SeoSiteShell } from "../seo/SeoSiteChrome";
import { SeoBlogBreadcrumb } from "./SeoBlogBreadcrumb";
import { SeoBlogCards } from "./SeoBlogCards";

export function SeoBlogArticle({ page }: { page: BlogPage }) {
  const article = page.article!;
  return (
    <SeoSiteShell page={page.shell}>
      <Container>
        <SeoBlogBreadcrumb page={page} />
      </Container>
      <article>
        <header className="border-b border-sand/70 pb-12 pt-4 lg:pb-16">
          <Container className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
                {article.category}
              </p>
              <h1 className="mt-5 text-balance font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
                {article.title}
              </h1>
              <p className="mt-6 text-lg leading-8 text-text-muted">
                {article.lead}
              </p>
              <p className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-xs leading-6 text-text-muted">
                {page.author && <span>
                  {page.labels.by}{" "}
                  <a href={page.author.href} className="underline underline-offset-4">{page.author.name}</a>
                </span>}
                <span>
                  {page.labels.updated}{" "}
                  <time dateTime={page.date}>{page.dateLabel}</time>
                </span>
              </p>
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-3xl shadow-soft lg:aspect-[4/5]">
              <MarketingImageFrame image={article.image} priority />
            </div>
          </Container>
        </header>
        <Container className="grid items-start gap-12 py-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-20 lg:py-16">
          <div className="rounded-2xl border border-sand/70 bg-white p-6 lg:sticky lg:top-8">
            <nav aria-label={page.labels.toc}>
              <p className="text-xs font-semibold uppercase tracking-wider">
                {page.labels.toc}
              </p>
              <ol className="mt-4 space-y-2">
                {article.sections.map((section, i) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex min-h-10 gap-3 py-1.5 text-sm leading-6 text-text-muted hover:text-primary-dark hover:underline"
                    >
                      <span className="text-xs tabular-nums" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          <div className="min-w-0 max-w-3xl">
            <div className="space-y-12 sm:space-y-16">
              {article.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-title`}
                  className="scroll-mt-8"
                >
                  <h2
                    id={`${section.id}-title`}
                    className="text-balance font-display text-3xl leading-tight sm:text-4xl"
                  >
                    {section.title}
                  </h2>
                  {section.paragraphs.map((p) => (
                    <p key={p} className="mt-5 leading-8 text-text-muted">
                      {p}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="mt-6 space-y-3 border-l-2 border-accent pl-6">
                      {section.bullets.map((item) => (
                        <li
                          key={item}
                          className="list-inside list-disc leading-7 text-text-muted"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.image && (
                    <figure className="mt-7">
                      <div className="mx-auto max-w-xl overflow-hidden rounded-2xl">
                        <MarketingImageFrame image={section.image} imgClassName="h-auto object-contain" />
                      </div>
                      <figcaption className="mt-3 text-sm leading-6 text-text-muted">{section.image.alt}</figcaption>
                    </figure>
                  )}
                  {section.sources.length > 0 && (
                    <p className="mt-4 text-xs leading-6 text-text-muted">
                      {page.labels.source}:{" "}
                      {section.sources.map((source, i) => (
                        <span key={source.href}>
                          {i > 0 && " · "}
                          <a
                            href={source.href}
                            className="underline underline-offset-4"
                          >
                            {source.title}
                          </a>
                        </span>
                      ))}
                    </p>
                  )}
                </section>
              ))}
            </div>
            <section
              className="mt-14 border-t border-sand pt-10"
              aria-labelledby="article-faq"
            >
              <h2
                id="article-faq"
                className="font-display text-3xl sm:text-4xl"
              >
                {page.labels.faq}
              </h2>
              <div className="mt-6 divide-y divide-sand">
                {article.faqs.map(([question, answer]) => (
                  <details key={question} className="py-5">
                    <summary className="cursor-pointer py-2 font-semibold leading-7">
                      <h3 className="inline">{question}</h3>
                    </summary>
                    <p className="pt-3 leading-8 text-text-muted">{answer}</p>
                  </details>
                ))}
              </div>
            </section>
            <section
              aria-labelledby="article-experience"
              className="mt-12 rounded-3xl bg-sky-light/60 p-6 sm:p-9"
            >
              <p className="text-xs font-semibold uppercase tracking-wider">
                {page.labels.relatedExperience}
              </p>
              <h2
                id="article-experience"
                className="mt-4 font-display text-3xl sm:text-4xl"
              >
                {article.cta.title}
              </h2>
              <p className="mt-4 leading-8 text-text-muted">
                {article.cta.text}
              </p>
              <div className="mt-6 flex flex-col items-start gap-3">
                {page.experiences.map((experience, i) => (
                  <Button
                    key={experience.id}
                    href={experience.href}
                    variant={i === 0 ? "accent" : "secondary"}
                    shape="pill"
                    className="max-w-full whitespace-normal text-left"
                  >
                    {experience.title} ↗
                  </Button>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <a
                  href={page.pricesHref}
                  className="inline-flex min-h-11 items-center underline underline-offset-4"
                >
                  {page.labels.prices}
                </a>
                <a
                  href={page.contactHref}
                  className="inline-flex min-h-11 items-center underline underline-offset-4"
                >
                  {page.labels.contact}
                </a>
              </div>
            </section>
          </div>
        </Container>
      </article>
      <section
        aria-labelledby="related-guides"
        className="border-t border-sand/70 py-16 lg:py-24"
      >
        <Container>
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-5">
            <h2 id="related-guides" className="font-display text-4xl">
              {page.labels.related}
            </h2>
            <a
              href={page.indexHref}
              className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
            >
              {page.labels.all} ↗
            </a>
          </div>
          <SeoBlogCards cards={page.articles} readLabel={page.labels.read} />
        </Container>
      </section>
    </SeoSiteShell>
  );
}
