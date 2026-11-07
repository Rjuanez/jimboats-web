import { SeoSupportPage } from "./SeoSupportPage";
import { SeoPricingTables } from "./SeoPricingTables";
import { Container } from "@/components/layout/Container";
import { marketingImage, type MarketingPage } from "@/content/marketing";
import { HeroSection } from "@/components/sections/HomeLandingPage";
import {
  SeoPremiumStory,
  SeoPremiumExtras,
  SeoPremiumBookingSteps,
  SeoPremiumFinalCta,
} from "./SeoPremiumSections";
import { SeoSiteShell } from "./SeoSiteChrome";
import { SeoExperienceGrid } from "./SeoExperienceGrid";
import { SeoFaq, SeoFindUs } from "./SeoTrustSections";
import { SeoReviews } from "./SeoReviews";
import { SeoIncluded } from "./SeoIncluded";
import { SeoExperiencePage } from "./SeoExperiencePage";
import { SeoGuideLinks } from "../blog/SeoGuideLinks";

export function SeoMarketingPage({ page }: { page: MarketingPage }) {
  const experience = page.experiences.find((item) => item.id === page.key);
  if (experience)
    return <SeoExperiencePage page={page} experience={experience} />;
  if (page.key !== "home") return <SeoSupportPage page={page} />;
  return (
    <SeoSiteShell page={page} hero>
      <SeoHomeHero page={page} />
      <SeoExperienceGrid page={page} />
      <SeoPremiumStory page={page} />
      <SeoPremiumExtras page={page} />
      <SeoPricingTables page={page} />
      <SeoPremiumBookingSteps page={page} />
      <SeoReviews page={page} />
      <SeoFaq page={page} />
      <SeoFindUs page={page} />
      <SeoGuideLinks page={page} />
      <SeoPremiumFinalCta page={page} />
    </SeoSiteShell>
  );
}

function SeoHomeHero({ page }: { page: MarketingPage }) {
  return (
    <>
      <HeroSection
        content={{
          title: page.title,
          description: page.description,
          image: marketingImage("hero-lena-barcelona", page.copy.heroAlt),
          cta: { href: "#experiences", label: page.copy.heroLink },
        }}
      />
      <div className="border-b border-sand/60 bg-background">
        <Container>
          <SeoIncluded items={page.copy.trust} compact />
        </Container>
      </div>
    </>
  );
}
