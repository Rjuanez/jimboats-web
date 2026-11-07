import { Container } from "@/components/layout/Container";
import { MarketingImageFrame } from "@/components/marketing/MarketingImageFrame";
import type { SkipperPage } from "@/interface/next/presenters/skipperPresenter";
import { SeoBlogCards } from "../blog/SeoBlogCards";
import { SeoSiteShell } from "./SeoSiteChrome";

export function SeoSkipperPage({ page }: { page: SkipperPage }) {
  const { person, copy } = page;
  return (
    <SeoSiteShell page={page.shell}>
      <Container className="pb-16">
        <nav aria-label="Breadcrumb" className="py-6 text-xs text-text-muted">
          <ol className="flex flex-wrap gap-2">
            {page.breadcrumbs.map((item, index) => (
              <li key={item.href}>
                {index > 0 && (
                  <span aria-hidden="true" className="mr-2">
                    /
                  </span>
                )}
                {index < 2 ? (
                  <a className="underline underline-offset-4" href={item.href}>
                    {item.label}
                  </a>
                ) : (
                  <span aria-current="page">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <article className="grid items-start gap-8 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)] lg:gap-16">
          <div className="aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl md:max-w-none">
            <MarketingImageFrame image={page.image} priority />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-dark">
              {copy.role} · JimBoats
            </p>
            <h1 className="my-4 font-display text-5xl sm:text-6xl">
              {person.name}
            </h1>
            <p className="font-display text-2xl text-primary-dark">
              {copy[person.key]}
            </p>
            <p className="my-6 max-w-prose leading-8">{page.bio}</p>
            <h2 className="mt-9 font-display text-2xl">{copy.tips}</h2>
            <p className="mt-3 max-w-prose leading-7">
              {person.key === "victor" ? copy.victorTip : copy.davidTip}
            </p>
          </div>
        </article>
        <section className="mt-10 border-t border-sand pt-10">
          <p className="text-xs font-semibold uppercase tracking-wider">
            {page.shell.guideLabels.eyebrow}
          </p>
          <div className="mb-8 mt-3 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-display text-3xl sm:text-4xl">{copy.guides}</h2>
            <a
              href={page.shell.blogHref}
              className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
            >
              {page.shell.guideLabels.all} ↗
            </a>
          </div>
          <SeoBlogCards
            cards={page.guideLinks}
            readLabel={page.shell.guideLabels.read}
          />
        </section>
      </Container>
    </SeoSiteShell>
  );
}
