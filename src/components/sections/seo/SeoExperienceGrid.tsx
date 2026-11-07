import { Container } from "@/components/layout/Container";
import { ExperienceCard } from "@/components/marketing/ExperienceCard";
import { marketingImage, type MarketingPage } from "@/content/marketing";

export function SeoExperienceGrid({
  page,
  related = false,
}: {
  page: MarketingPage;
  related?: boolean;
}) {
  return (
    <section
      id="experiences"
      className="scroll-mt-8 bg-background py-16 lg:py-28"
    >
      <Container>
        <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-24">
          <h2 className="font-display text-4xl leading-tight sm:text-5xl lg:text-7xl">
            {related ? page.copy.otherExperiences : page.copy.experiencesTitle}
          </h2>
          <p className="mt-5 text-base leading-7 text-text-muted lg:text-xl">
            {page.copy.experiencesDescription}
          </p>
        </div>
        <div className="space-y-12 lg:space-y-32">
          {page.experiences
            .filter((item) => !related || item.id !== page.key)
            .map((item, index) => (
              <ExperienceCard
                key={item.id}
                id={`experience-${item.id}`}
                title={item.title}
                description={item.description}
                eyebrow={`${item.shortName} · ${item.durationLabel}`}
                capacityLabel={item.capacityLabel}
                headingAs="h3"
                price={`${item.formattedPrices[item.featuredHours]} / ${item.featuredHours} h`}
                priceLabel={page.copy.from}
                ctaHref={item.href}
                ctaLabel={page.copy.details}
                image={marketingImage(item.imageSlug, item.title)}
                reverse={index % 2 === 1}
              />
            ))}
        </div>
      </Container>
    </section>
  );
}
