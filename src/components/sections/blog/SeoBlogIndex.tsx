import { Container } from "@/components/layout/Container";
import { MarketingImageFrame } from "@/components/marketing/MarketingImageFrame";
import { marketingImage } from "@/content/marketing";
import type { BlogPage } from "@/interface/next/presenters/blogPresenter";
import { SeoSiteShell } from "../seo/SeoSiteChrome";
import { SeoBlogBreadcrumb } from "./SeoBlogBreadcrumb";
import { SeoBlogCards } from "./SeoBlogCards";

export function SeoBlogIndex({ page }: { page: BlogPage }) {
  return (
    <SeoSiteShell page={page.shell}>
      <Container>
        <SeoBlogBreadcrumb page={page} />
      </Container>
      <section className="pb-16 pt-5 lg:pb-24">
        <Container className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
              {page.labels.eyebrow}
            </p>
            <h1 className="mt-6 max-w-3xl text-balance font-display text-5xl leading-tight sm:text-6xl lg:text-7xl">
              {page.title}
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-text-muted">
              {page.description}
            </p>
            <a
              href="#guides"
              className="mt-7 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
            >
              {page.labels.all} ↓
            </a>
          </div>
          <figure className="min-w-0">
            <div className="aspect-[4/3] overflow-hidden rounded-4xl shadow-soft lg:aspect-[4/5]">
              <MarketingImageFrame
                image={marketingImage(
                  "production-sunset",
                  page.articles[0].imageAlt,
                )}
                priority
              />
            </div>
            <figcaption className="mt-4 text-xs text-text-muted">
              {page.labels.photo}
            </figcaption>
          </figure>
        </Container>
      </section>
      <section
        id="guides"
        aria-labelledby="guides-title"
        className="border-t border-sand/70 py-16 lg:py-24"
      >
        <Container>
          <h2
            id="guides-title"
            className="mb-10 font-display text-4xl sm:text-5xl"
          >
            {page.labels.all}
          </h2>
          <SeoBlogCards cards={page.articles} readLabel={page.labels.read} />
        </Container>
      </section>
    </SeoSiteShell>
  );
}
