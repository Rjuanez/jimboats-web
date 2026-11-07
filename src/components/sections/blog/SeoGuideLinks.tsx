import { Container } from "@/components/layout/Container";
import type { MarketingPage } from "@/content/marketing";
import { SeoBlogCards } from "./SeoBlogCards";

export function SeoGuideLinks({
  page,
  compact = false,
}: {
  page: MarketingPage;
  compact?: boolean;
}) {
  if (compact)
    return (
      <section aria-labelledby="experience-guides">
        <h2
          id="experience-guides"
          className="font-display text-3xl sm:text-4xl"
        >
          {page.guideLabels.relatedExperience}
        </h2>
        <ul className="mt-5 space-y-3">
          {page.guides.map((guide) => (
            <li key={guide.href}>
              <a
                href={guide.href}
                className="inline-flex min-h-11 items-center py-2 leading-7 text-primary-dark underline underline-offset-4"
              >
                {guide.title} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>
    );
  return (
    <section
      id="blog"
      aria-labelledby="home-guides"
      className="border-t border-sand/70 py-16 lg:py-24"
    >
      <Container>
        <p className="text-xs font-semibold uppercase tracking-wider">
          {page.guideLabels.eyebrow}
        </p>
        <div className="mb-10 mt-4 flex flex-wrap items-baseline justify-between gap-5">
          <h2 id="home-guides" className="font-display text-4xl sm:text-5xl">
            {page.guideLabels.related}
          </h2>
          <a
            href={page.blogHref}
            className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
          >
            {page.guideLabels.all} ↗
          </a>
        </div>
        <SeoBlogCards cards={page.guides.slice(0, 3)} readLabel={page.guideLabels.read} />
      </Container>
    </section>
  );
}
