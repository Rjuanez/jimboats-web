import {
  StorySection,
  ExtrasSection,
  BookingSection,
  FinalCtaSection,
} from "@/components/sections/HomeLandingPage";
import { marketingImage, type MarketingPage } from "@/content/marketing";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function SeoPremiumStory({ page }: { page: MarketingPage }) {
  const copy = page.premium;
  return (
    <div id="gallery">
      <StorySection
        story={{
          title: copy.story,
          description: page.copy.descriptions.boat,
          image: marketingImage("story-barcelona-sea", page.copy.names.boat),
        }}
      />
    </div>
  );
}

export function SeoPremiumExtras({ page }: { page: MarketingPage }) {
  const copy = page.premium;
  return (
    <ExtrasSection
      extras={{
        title: copy.extras,
        description: page.copy.extrasNote,
        items: [
          "production-efoil",
          "production-paddle",
          "production-photographer",
        ].map((slug, index) => ({
          title: copy.extraNames[index],
          description: copy.extraDescriptions[index],
          image: marketingImage(slug, copy.extraNames[index]),
        })),
      }}
    />
  );
}

export function SeoPremiumBookingSteps({ page }: { page: MarketingPage }) {
  return (
    <BookingSection
      booking={{
        title: page.copy.bookingTitle,
        steps: [
          {
            icon: "anchor",
            title: page.copy.book,
            description: page.copy.experiencesDescription,
          },
          {
            icon: "calendar",
            title: page.copy.reserve,
            description: page.copy.hourNote,
          },
          {
            icon: "sparkles",
            title: page.copy.whatsapp,
            description: page.copy.bookingNote,
          },
        ],
      }}
    />
  );
}

export function SeoPremiumFinalCta({ page }: { page: MarketingPage }) {
  return (
    <div id="contact-us" className="scroll-mt-24">
      <FinalCtaSection
        finalCta={{
          title: page.premium.final,
          image: marketingImage("final-cta-golden-sea", page.copy.heroAlt),
          cta: { href: `/${page.locale}#experiences`, label: page.copy.heroLink },
        }}
        secondaryAction={
          <Button
            href={page.operator.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            shape="pill"
            size="xl"
            className="max-w-full bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:outline-white"
          >
            <WhatsAppIcon className="size-5 shrink-0" />
            {page.detailCopy.bookingCard.whatsappBooking}
          </Button>
        }
      />
    </div>
  );
}
