import { SeoExperienceBookingCard } from "./SeoExperienceBookingCard";
import { SeoSolarCalendar } from "./SeoSolarCalendar";
import { SeoDurationGuide } from "./SeoDurationGuide";
import { SeoTripPreparation } from "./SeoTripPreparation";
import { SeoPricingTables } from "./SeoPricingTables";
import { SeoExperiencePrices } from "./SeoExperiencePrices";
import { SeoFaq, SeoFindUs } from "./SeoTrustSections";
import { SeoReviews } from "./SeoReviews";
import { SeoPremiumFinalCta } from "./SeoPremiumSections";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getMarketingPage } from "@/content/marketing";
import { SeoMarketingPage } from "./SeoMarketingPage";

const meta = {
  title: "Marketing/SEO pages",
  component: SeoMarketingPage,
  parameters: { layout: "fullscreen" },
  args: { page: getMarketingPage("es") },
} satisfies Meta<typeof SeoMarketingPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Home: Story = {};
export const FinalCallToAction: Story = {
  render: ({ page }) => <SeoPremiumFinalCta page={page} />,
};
export const FinalCallToActionMobile: Story = {
  ...FinalCallToAction,
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
export const FinalCallToActionGerman: Story = {
  ...FinalCallToAction,
  args: { page: getMarketingPage("de") },
};
export const PrivateTrip: Story = {
  args: { page: getMarketingPage("es", "private") },
};
export const GermanLongText: Story = {
  args: { page: getMarketingPage("de", "sunset") },
};
export const Prices: Story = {
  args: { page: getMarketingPage("en", "prices") },
};
export const ExperiencePrices: Story = {
  args: { page: getMarketingPage("es", "private") },
  render: ({ page }) => (
    <div className="mx-auto max-w-3xl p-5">
      <SeoExperiencePrices
        detail={page.detail!}
        capacityLabel={
          page.experiences.find((item) => item.id === page.key)!.capacityLabel
        }
      />
    </div>
  ),
};
export const ExperiencePricesGerman: Story = {
  ...ExperiencePrices,
  args: { page: getMarketingPage("de", "sunset") },
};
export const ExperiencePricesMobile: Story = {
  ...ExperiencePrices,
  args: { page: getMarketingPage("fr", "romantic") },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
export const DurationGuide: Story = {
  args: { page: getMarketingPage("es", "prices") },
  render: ({ page }) => (
    <div className="mx-auto max-w-6xl p-5">
      <SeoDurationGuide planning={page.planning} />
    </div>
  ),
};
export const DurationGuideGerman: Story = {
  ...DurationGuide,
  args: { page: getMarketingPage("de", "prices") },
};
export const BeforeBoarding: Story = {
  args: { page: getMarketingPage("es", "contact") },
  render: ({ page }) => (
    <div className="mx-auto max-w-3xl p-5">
      <SeoTripPreparation page={page} />
    </div>
  ),
};
export const BeforeBoardingFrench: Story = {
  ...BeforeBoarding,
  args: { page: getMarketingPage("fr", "contact") },
};
export const FAQ: Story = {
  render: ({ page }) => <SeoFaq page={page} />,
};
export const MeetingPoint: Story = {
  render: ({ page }) => <SeoFindUs page={page} />,
};
export const GuestReviews: Story = {
  render: ({ page }) => <SeoReviews page={page} />,
};

export const GuestReviewsEnglish: Story = {
  args: { page: getMarketingPage("en") },
  render: ({ page }) => <SeoReviews page={page} />,
};

export const GuestReviewsGermanLongText: Story = {
  args: { page: getMarketingPage("de") },
  render: ({ page }) => <SeoReviews page={page} />,
};

export const PricingTables: Story = {
  render: ({ page }) => <SeoPricingTables page={page} />,
};
export const PricingTablesGerman: Story = {
  args: { page: getMarketingPage("de") },
  render: ({ page }) => <SeoPricingTables page={page} />,
};

export const CompactExperienceReviews: Story = {
  args: { page: getMarketingPage("es", "sunset") },
  render: ({ page }) => (
    <div className="mx-auto max-w-3xl p-5">
      <SeoReviews page={page} compact />
    </div>
  ),
};
export const CompactExperienceFAQ: Story = {
  args: { page: getMarketingPage("de", "sunrise") },
  render: ({ page }) => (
    <div className="mx-auto max-w-3xl p-5">
      <SeoFaq page={page} compact />
    </div>
  ),
};

export const BookingCardOneHour: Story = {
  args: { page: getMarketingPage("es", "private") },
  render: ({ page }) => (
    <div className="mx-auto max-w-sm p-4">
      <SeoExperienceBookingCard
        page={page}
        experience={page.experiences.find((item) => item.id === page.key)!}
      />
    </div>
  ),
};
export const BookingCardTwoHours: Story = {
  ...BookingCardOneHour,
  args: { page: getMarketingPage("es", "sunrise") },
};
export const BookingCardGerman: Story = {
  ...BookingCardOneHour,
  args: { page: getMarketingPage("de", "sunset") },
};
export const SunriseCalendar: Story = {
  args: { page: getMarketingPage("es", "sunrise") },
  render: ({ page }) => (
    <div className="mx-auto max-w-3xl p-4">
      <SeoSolarCalendar calendar={page.detail!.solarCalendar!} />
    </div>
  ),
};
