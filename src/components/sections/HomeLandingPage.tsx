import { Anchor, ArrowRight, CalendarDays, Sparkles } from "lucide-react";

import { LandingFooter } from "@/components/layout/LandingFooter";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { Container } from "@/components/layout/Container";
import { ExperienceCard } from "@/components/marketing/ExperienceCard";
import {
  MarketingImageFrame,
  type MarketingImage,
} from "@/components/marketing/MarketingImageFrame";
import { TrustBar, type TrustItem } from "@/components/marketing/TrustBar";
import { UpgradeCard } from "@/components/marketing/UpgradeCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/design/variants";

export type HomeLandingLinkItem = {
  href: string;
  label: string;
};

export type HomeLandingExperience = {
  ctaHref: string;
  ctaLabel: string;
  description: string;
  featured?: boolean;
  id: string;
  image: MarketingImage;
  price: string;
  reverse?: boolean;
  title: string;
};

export type HomeLandingUpgrade = {
  description: string;
  image: MarketingImage;
  title: string;
};

export type HomeLandingBookingStep = {
  description: string;
  icon: "anchor" | "calendar" | "sparkles";
  title: string;
};

export type HomeLandingBrandMark = {
  alt: string;
  height: number;
  src: string;
  width: number;
};

export type HomeLandingGalleryMosaicVariant =
  | "balanced-classic"
  | "balanced-rhythm"
  | "balanced-stack"
  | "landscape-hero-left"
  | "landscape-panorama-top"
  | "landscape-wide-duo"
  | "portrait-columns"
  | "portrait-editorial"
  | "portrait-feature-pair";

export type HomeLandingContent = {
  booking: {
    steps: readonly HomeLandingBookingStep[];
    title: string;
  };
  brand: string;
  brandMark?: HomeLandingBrandMark;
  experiences: readonly HomeLandingExperience[];
  experienceSection: {
    description: string;
    title: string;
  };
  extras: {
    description: string;
    items: readonly HomeLandingUpgrade[];
    title: string;
  };
  finalCta: {
    cta: HomeLandingLinkItem;
    image: MarketingImage;
    title: string;
  };
  footer: {
    contact: {
      email: string;
      phone: string;
      place: string;
    };
    copyright: string;
    description: string;
    experienceLinks: readonly HomeLandingLinkItem[];
    legalLinks: readonly HomeLandingLinkItem[];
    socialLinks: readonly (HomeLandingLinkItem & {
      network: "facebook" | "instagram";
    })[];
  };
  gallery: {
    description: string;
    images: readonly MarketingImage[];
    mosaicVariant: HomeLandingGalleryMosaicVariant;
    title: string;
  };
  headerCta: HomeLandingLinkItem;
  homeHref: string;
  hero: {
    cta: HomeLandingLinkItem;
    description: string;
    image: MarketingImage;
    title: string;
  };
  navigation: readonly HomeLandingLinkItem[];
  story: {
    description: string;
    image: MarketingImage;
    title: string;
  };
  trustItems: readonly TrustItem[];
};

type HomeLandingPageProps = {
  content: HomeLandingContent;
};

const bookingIcons = {
  anchor: Anchor,
  calendar: CalendarDays,
  sparkles: Sparkles,
} as const;

const galleryMosaicClassNames = {
  "balanced-classic": [
    "h-64 md:col-span-7 md:row-span-4 md:h-auto",
    "h-44 md:col-span-5 md:row-span-2 md:h-auto",
    "h-44 md:col-span-5 md:row-span-2 md:h-auto",
    "h-52 md:col-span-5 md:row-span-3 md:h-auto",
    "h-48 md:col-span-7 md:row-span-3 md:h-auto",
  ],
  "balanced-rhythm": [
    "h-56 md:col-span-5 md:row-span-3 md:h-auto",
    "h-44 md:col-span-7 md:row-span-2 md:h-auto",
    "h-48 md:col-span-3 md:row-span-2 md:h-auto",
    "h-64 md:col-span-4 md:row-span-3 md:h-auto",
    "h-48 md:col-span-8 md:row-span-2 md:h-auto",
  ],
  "balanced-stack": [
    "h-72 md:col-span-4 md:row-span-5 md:h-auto",
    "h-44 md:col-span-8 md:row-span-2 md:h-auto",
    "h-52 md:col-span-4 md:row-span-3 md:h-auto",
    "h-52 md:col-span-4 md:row-span-3 md:h-auto",
    "h-48 md:col-span-8 md:row-span-3 md:h-auto",
  ],
  "landscape-hero-left": [
    "h-72 md:col-span-8 md:row-span-5 md:h-auto",
    "h-44 md:col-span-4 md:row-span-2 md:h-auto",
    "h-60 md:col-span-4 md:row-span-3 md:h-auto",
    "h-44 md:col-span-6 md:row-span-2 md:h-auto",
    "h-44 md:col-span-6 md:row-span-2 md:h-auto",
  ],
  "landscape-panorama-top": [
    "h-60 md:col-span-12 md:row-span-3 md:h-auto",
    "h-64 md:col-span-5 md:row-span-3 md:h-auto",
    "h-72 md:col-span-3 md:row-span-4 md:h-auto",
    "h-44 md:col-span-4 md:row-span-2 md:h-auto",
    "h-44 md:col-span-4 md:row-span-2 md:h-auto",
  ],
  "landscape-wide-duo": [
    "h-56 md:col-span-7 md:row-span-3 md:h-auto",
    "h-56 md:col-span-5 md:row-span-3 md:h-auto",
    "h-64 md:col-span-4 md:row-span-3 md:h-auto",
    "h-44 md:col-span-8 md:row-span-2 md:h-auto",
    "h-44 md:col-span-8 md:row-span-2 md:h-auto",
  ],
  "portrait-columns": [
    "h-80 md:col-span-4 md:row-span-6 md:h-auto",
    "h-80 md:col-span-4 md:row-span-6 md:h-auto",
    "h-48 md:col-span-4 md:row-span-3 md:h-auto",
    "h-48 md:col-span-4 md:row-span-3 md:h-auto",
    "h-48 md:col-span-8 md:row-span-2 md:h-auto",
  ],
  "portrait-editorial": [
    "h-44 md:col-span-7 md:row-span-2 md:h-auto",
    "h-80 md:col-span-5 md:row-span-5 md:h-auto",
    "h-72 md:col-span-4 md:row-span-4 md:h-auto",
    "h-60 md:col-span-3 md:row-span-3 md:h-auto",
    "h-44 md:col-span-5 md:row-span-2 md:h-auto",
  ],
  "portrait-feature-pair": [
    "h-80 md:col-span-5 md:row-span-5 md:h-auto",
    "h-44 md:col-span-7 md:row-span-2 md:h-auto",
    "h-80 md:col-span-4 md:row-span-5 md:h-auto",
    "h-60 md:col-span-3 md:row-span-3 md:h-auto",
    "h-44 md:col-span-7 md:row-span-2 md:h-auto",
  ],
} satisfies Record<HomeLandingGalleryMosaicVariant, readonly string[]>;

export function HomeLandingPage({ content }: HomeLandingPageProps) {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-text">
      <LandingHeader
        brand={content.brand}
        brandMark={content.brandMark}
        cta={content.headerCta}
        homeHref={content.homeHref}
        navigation={content.navigation}
      />
      <main>
        <HeroSection content={content.hero} />
        <TrustBar items={content.trustItems} />
        <ExperiencesSection
          experiences={content.experiences}
          section={content.experienceSection}
        />
        <StorySection story={content.story} />
        <ExtrasSection extras={content.extras} />
        <GallerySection gallery={content.gallery} />
        <BookingSection booking={content.booking} />
        <FinalCtaSection finalCta={content.finalCta} />
      </main>
      <LandingFooter brand={content.brand} {...content.footer} />
    </div>
  );
}

function HeroSection({ content }: { content: HomeLandingContent["hero"] }) {
  return (
    <section className="relative h-[100svh] min-h-[700px] overflow-hidden lg:min-h-[860px]">
      <div className="absolute inset-0">
        <MarketingImageFrame
          image={content.image}
          imgClassName="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/10 to-black/45" />
      </div>

      <Container className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-24 pt-24 text-center">
        <h1 className="max-w-5xl font-display text-5xl leading-tight text-white drop-shadow-2xl sm:text-6xl lg:text-8xl">
          {content.title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white/90 drop-shadow-lg sm:text-xl lg:mt-8 lg:text-2xl">
          {content.description}
        </p>
        <Button
          className="mt-10 shadow-[0_20px_40px_-10px_rgb(0_0_0_/_0.4)] lg:mt-14"
          data-analytics-cta-location="hero"
          data-analytics-event="booking_cta_clicked"
          href={content.cta.href}
          shape="pill"
          size="xl"
          variant="accent"
        >
          {content.cta.label}
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </Button>
      </Container>

      <WaveDivider className="absolute bottom-0 left-0 z-20 h-16 lg:h-32" />
    </section>
  );
}

function ExperiencesSection({
  experiences,
  section,
}: {
  experiences: readonly HomeLandingExperience[];
  section: HomeLandingContent["experienceSection"];
}) {
  return (
    <section
      className="bg-background px-4 py-16 lg:px-0 lg:py-32"
      id="experiences"
    >
      <Container>
        <div className="mb-10 text-center lg:hidden">
          <h2 className="font-display text-4xl text-text">{section.title}</h2>
          <p className="mt-2 text-sm text-text-muted">{section.description}</p>
        </div>
        <div className="space-y-12 lg:space-y-40">
          {experiences.map((experience) => (
            <ExperienceCard
              ctaHref={experience.ctaHref}
              ctaLabel={experience.ctaLabel}
              description={experience.description}
              featured={experience.featured}
              id={experience.id}
              image={experience.image}
              key={experience.id}
              price={experience.price}
              reverse={experience.reverse}
              title={experience.title}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function StorySection({ story }: { story: HomeLandingContent["story"] }) {
  return (
    <section className="relative my-4 h-[420px] overflow-hidden lg:my-20 lg:h-[700px]">
      <div className="absolute inset-0">
        <MarketingImageFrame image={story.image} />
        <div className="absolute inset-0 bg-black/55 lg:bg-black/50" />
      </div>
      <Container className="relative z-10 flex h-full flex-col items-center justify-center text-center">
        <h2 className="max-w-4xl font-display text-4xl leading-tight text-white drop-shadow-lg sm:text-5xl lg:text-8xl">
          {story.title}
        </h2>
        <p className="mt-4 font-display text-xl text-white/90 drop-shadow-md lg:mt-6 lg:text-3xl">
          {story.description}
        </p>
      </Container>
    </section>
  );
}

function ExtrasSection({ extras }: { extras: HomeLandingContent["extras"] }) {
  return (
    <section className="bg-background px-4 py-14 lg:px-0 lg:py-28" id="extras">
      <Container>
        <SectionHeading description={extras.description} title={extras.title} />
        <div className="mt-10 space-y-5 md:grid md:grid-cols-3 md:gap-8 md:space-y-0 lg:mt-16">
          {extras.items.map((item) => (
            <UpgradeCard
              description={item.description}
              image={item.image}
              key={item.title}
              title={item.title}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function GallerySection({
  gallery,
}: {
  gallery: HomeLandingContent["gallery"];
}) {
  const mosaicClassNames =
    galleryMosaicClassNames[gallery.mosaicVariant] ??
    galleryMosaicClassNames["balanced-classic"];

  return (
    <section className="bg-sand/10 px-4 py-14 lg:px-0 lg:py-32" id="gallery">
      <Container>
        <SectionHeading
          description={gallery.description}
          title={gallery.title}
        />

        <div className="mt-10 grid gap-4 md:grid-cols-12 md:auto-rows-[110px] md:gap-6 lg:mt-20 lg:auto-rows-[140px] lg:gap-8">
          {gallery.images.slice(0, 5).map((image, index) => (
            <GalleryImage
              className={mosaicClassNames[index] ?? "h-48 md:col-span-4"}
              image={image}
              key={`${image.src}-${index}`}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function BookingSection({
  booking,
}: {
  booking: HomeLandingContent["booking"];
}) {
  return (
    <section
      className="bg-background px-4 py-14 lg:px-0 lg:py-28"
      id="how-it-works"
    >
      <Container>
        <h2 className="text-center font-display text-4xl text-text lg:text-7xl">
          {booking.title}
        </h2>
        <div className="relative mx-auto mt-10 max-w-5xl space-y-0 md:mt-16 md:flex md:items-start md:justify-between md:gap-8 md:space-y-0">
          <div className="absolute bottom-10 left-7 top-10 z-0 w-px bg-sand/60 md:left-[10%] md:right-[10%] md:top-12 md:h-px md:w-auto" />
          {booking.steps.map((step) => {
            const Icon = bookingIcons[step.icon];

            return (
              <article
                className="relative z-10 flex items-start gap-5 pb-10 last:pb-0 md:flex-1 md:flex-col md:items-center md:bg-background md:px-4 md:pb-0 md:text-center"
                key={step.title}
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-sand/35 bg-white text-accent shadow-soft md:h-24 md:w-24">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </div>
                <div className="pt-2 md:pt-0">
                  <h3 className="font-display text-2xl text-text md:mt-8 md:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-text-muted md:text-lg">
                    {step.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function FinalCtaSection({
  finalCta,
}: {
  finalCta: HomeLandingContent["finalCta"];
}) {
  return (
    <section className="relative h-[520px] overflow-hidden lg:h-[850px]">
      <div className="absolute inset-0">
        <MarketingImageFrame image={finalCta.image} />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
      </div>
      <WaveDivider className="absolute left-0 top-0 z-20 h-12 rotate-180 lg:h-24" />
      <Container className="relative z-10 flex h-full flex-col items-center justify-center text-center">
        <h2 className="max-w-4xl font-display text-5xl leading-tight text-white drop-shadow-lg sm:text-6xl lg:text-8xl">
          {finalCta.title}
        </h2>
        <Button
          className="mt-9 shadow-[0_20px_40px_-10px_rgb(0_0_0_/_0.3)] lg:mt-12"
          data-analytics-cta-location="final_cta"
          data-analytics-event="booking_cta_clicked"
          href={finalCta.cta.href}
          shape="pill"
          size="xl"
          variant="accent"
        >
          {finalCta.cta.label}
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </Button>
      </Container>
    </section>
  );
}

function SectionHeading({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="font-display text-4xl text-text lg:text-7xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-text-muted lg:mt-5 lg:text-xl">
        {description}
      </p>
    </div>
  );
}

function GalleryImage({
  className,
  image,
}: {
  className: string;
  image?: MarketingImage;
}) {
  if (!image) {
    return null;
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl shadow-soft lg:rounded-4xl",
        className,
      )}
    >
      <MarketingImageFrame
        image={image}
        imgClassName="transition-transform duration-700 hover:scale-105"
      />
    </div>
  );
}

function WaveDivider({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("block w-full", className)}
      preserveAspectRatio="none"
      viewBox="0 0 1200 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M321.39 56.44c58-10.79 114.16-30.13 172-41.86 82.39-16.72 168.19-17.73 250.45-.39 79.94 16.81 162.83 57.81 241.82 78.64 70.05 18.48 146.53 26.09 214.34 3V120H0V0c73.41 31 154.34 51.83 230.15 59.39 30.47 3.04 60.97 2.05 91.24-2.95Z"
        fill="#FAF9F6"
      />
    </svg>
  );
}
