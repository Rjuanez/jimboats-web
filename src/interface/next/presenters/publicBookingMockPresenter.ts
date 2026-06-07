import type { PublicBookingContent } from "@/components/sections/public-booking/PublicBookingTypes";
import { createLocalizedPath, type PublicLocale } from "@/i18n/locales";
import { getPublicDictionary } from "@/i18n/public";

const generatedImagePath = (slug: string, width: number) =>
  `/images/generated/landing/${slug}-${width}.webp`;

const generatedImage = ({
  alt,
  sizes,
  slug,
  widths,
}: {
  alt: string;
  sizes: string;
  slug: string;
  widths: number[];
}) => ({
  alt,
  height: 1024,
  sizes,
  src: generatedImagePath(slug, widths.at(-1) ?? widths[0]),
  srcSet: widths
    .map((width) => `${generatedImagePath(slug, width)} ${width}w`)
    .join(", "),
  width: 1024,
});

export function getPublicBookingMockPage(
  locale: PublicLocale = "en",
): PublicBookingContent {
  return withExperienceMaps(publicBookingMockBase, locale);
}

const publicBookingMockBase = {
  brand: "JimBoats",
  homeHref: "/en",
  currencySymbol: "€",
  depositAmount: 100,
  maxAdvanceLabel: "Bookings are available up to 6 months ahead.",
  steps: [
    { id: "experience", label: "Experience" },
    { id: "extras", label: "Extras" },
    { id: "payment", label: "Payment" },
    { id: "confirmation", label: "Done" },
  ],
  support: {
    email: "info@jimboatscharter.com",
    phone: "+34 600 000 000",
  },
  experiences: [
    {
      badge: "Most popular",
      capacity: 8,
      description: "Experience the magic as the sun dips below the horizon.",
      depositAmount: 100,
      durationLabel: "3h",
      id: "sunset-cruise",
      image: generatedImage({
        alt: "Friends clinking drinks during a golden hour boat cruise in Barcelona.",
        sizes: "(min-width: 1024px) 36vw, 34vw",
        slug: "experience-sunset-toast",
        widths: [480, 720, 960, 1024],
      }),
      price: 290,
      title: "Sunset Cruise",
    },
    {
      capacity: 8,
      description:
        "Start your day with fresh Mediterranean air and calm waters.",
      depositAmount: 100,
      durationLabel: "4h",
      id: "morning-breeze",
      image: generatedImage({
        alt: "Guests relaxing on deck during a bright morning sail near Barcelona.",
        sizes: "(min-width: 1024px) 36vw, 34vw",
        slug: "experience-morning-breeze",
        widths: [480, 720, 960, 1024],
      }),
      price: 350,
      title: "Morning Breeze",
    },
    {
      capacity: 10,
      description: "Celebrate with friends on the vibrant Mediterranean.",
      depositAmount: 100,
      durationLabel: "5h",
      id: "party-on-board",
      image: generatedImage({
        alt: "A group of friends celebrating on a private boat in the Mediterranean sun.",
        sizes: "(min-width: 1024px) 36vw, 34vw",
        slug: "experience-party-board",
        widths: [480, 720, 960, 1024],
      }),
      price: 480,
      title: "Party on Board",
    },
    {
      capacity: 6,
      description: "Create a private memory that will last forever.",
      depositAmount: 100,
      durationLabel: "3h",
      id: "romantic-proposal",
      image: generatedImage({
        alt: "A romantic proposal setup with champagne on a private boat deck.",
        sizes: "(min-width: 1024px) 36vw, 34vw",
        slug: "experience-romantic-proposal",
        widths: [480, 720, 960, 1024],
      }),
      price: 420,
      title: "Romantic Proposal",
    },
  ],
  calendar: {
    monthLabel: "June 2026",
    weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    days: [
      {
        ariaLabel: "Monday June 1, 2026",
        dateLabel: "Jun 1",
        dayLabel: "1",
        id: "2026-06-01",
        disabled: true,
      },
      {
        ariaLabel: "Tuesday June 2, 2026",
        dateLabel: "Jun 2",
        dayLabel: "2",
        id: "2026-06-02",
        disabled: true,
      },
      {
        ariaLabel: "Wednesday June 3, 2026",
        dateLabel: "Jun 3",
        dayLabel: "3",
        id: "2026-06-03",
        disabled: true,
      },
      {
        ariaLabel: "Thursday June 4, 2026",
        dateLabel: "Jun 4",
        dayLabel: "4",
        id: "2026-06-04",
        disabled: true,
      },
      {
        ariaLabel: "Friday June 5, 2026",
        dateLabel: "Jun 5",
        dayLabel: "5",
        id: "2026-06-05",
      },
      {
        ariaLabel: "Saturday June 6, 2026",
        dateLabel: "Jun 6",
        dayLabel: "6",
        id: "2026-06-06",
      },
      {
        ariaLabel: "Sunday June 7, 2026",
        dateLabel: "Jun 7",
        dayLabel: "7",
        id: "2026-06-07",
      },
      {
        ariaLabel: "Monday June 8, 2026",
        dateLabel: "Jun 8",
        dayLabel: "8",
        id: "2026-06-08",
      },
      {
        ariaLabel: "Tuesday June 9, 2026",
        dateLabel: "Jun 9",
        dayLabel: "9",
        id: "2026-06-09",
        disabled: true,
      },
      {
        ariaLabel: "Wednesday June 10, 2026",
        dateLabel: "Jun 10",
        dayLabel: "10",
        id: "2026-06-10",
      },
      {
        ariaLabel: "Thursday June 11, 2026",
        dateLabel: "Jun 11",
        dayLabel: "11",
        id: "2026-06-11",
      },
      {
        ariaLabel: "Friday June 12, 2026",
        dateLabel: "Jun 12",
        dayLabel: "12",
        id: "2026-06-12",
      },
      {
        ariaLabel: "Saturday June 13, 2026",
        dateLabel: "Jun 13",
        dayLabel: "13",
        id: "2026-06-13",
      },
      {
        ariaLabel: "Sunday June 14, 2026",
        dateLabel: "Jun 14",
        dayLabel: "14",
        id: "2026-06-14",
      },
      {
        ariaLabel: "Monday June 15, 2026",
        dateLabel: "Jun 15",
        dayLabel: "15",
        id: "2026-06-15",
      },
      {
        ariaLabel: "Tuesday June 16, 2026",
        dateLabel: "Jun 16",
        dayLabel: "16",
        id: "2026-06-16",
      },
      {
        ariaLabel: "Wednesday June 17, 2026",
        dateLabel: "Jun 17",
        dayLabel: "17",
        id: "2026-06-17",
        disabled: true,
      },
      {
        ariaLabel: "Thursday June 18, 2026",
        dateLabel: "Jun 18",
        dayLabel: "18",
        id: "2026-06-18",
      },
      {
        ariaLabel: "Friday June 19, 2026",
        dateLabel: "Jun 19",
        dayLabel: "19",
        id: "2026-06-19",
      },
      {
        ariaLabel: "Saturday June 20, 2026",
        dateLabel: "Jun 20",
        dayLabel: "20",
        id: "2026-06-20",
      },
      {
        ariaLabel: "Sunday June 21, 2026",
        dateLabel: "Jun 21",
        dayLabel: "21",
        id: "2026-06-21",
      },
      {
        ariaLabel: "Monday June 22, 2026",
        dateLabel: "Jun 22",
        dayLabel: "22",
        id: "2026-06-22",
      },
      {
        ariaLabel: "Tuesday June 23, 2026",
        dateLabel: "Jun 23",
        dayLabel: "23",
        id: "2026-06-23",
      },
      {
        ariaLabel: "Wednesday June 24, 2026",
        dateLabel: "Jun 24",
        dayLabel: "24",
        id: "2026-06-24",
      },
      {
        ariaLabel: "Thursday June 25, 2026",
        dateLabel: "Jun 25",
        dayLabel: "25",
        id: "2026-06-25",
      },
      {
        ariaLabel: "Friday June 26, 2026",
        dateLabel: "Jun 26",
        dayLabel: "26",
        id: "2026-06-26",
      },
      {
        ariaLabel: "Saturday June 27, 2026",
        dateLabel: "Jun 27",
        dayLabel: "27",
        id: "2026-06-27",
      },
      {
        ariaLabel: "Sunday June 28, 2026",
        dateLabel: "Jun 28",
        dayLabel: "28",
        id: "2026-06-28",
      },
    ],
  },
  timeSlots: [
    {
      available: true,
      availableExtraIds: [
        "paddle-surf",
        "mediterranean-drinks",
        "sunset-toast",
        "romantic-setup",
        "gourmet-snacks",
        "private-photographer",
      ],
      endTime: "12:00",
      id: "09:00",
      label: "09:00",
      slotKey: "09:00",
      startTime: "09:00",
    },
    {
      available: true,
      availableExtraIds: [
        "paddle-surf",
        "mediterranean-drinks",
        "sunset-toast",
        "romantic-setup",
        "gourmet-snacks",
        "private-photographer",
      ],
      endTime: "14:00",
      id: "11:00",
      label: "11:00",
      slotKey: "11:00",
      startTime: "11:00",
    },
    {
      available: true,
      availableExtraIds: [
        "paddle-surf",
        "mediterranean-drinks",
        "sunset-toast",
        "romantic-setup",
        "gourmet-snacks",
        "private-photographer",
      ],
      endTime: "17:00",
      id: "14:00",
      label: "14:00",
      slotKey: "14:00",
      startTime: "14:00",
    },
    {
      available: true,
      availableExtraIds: [
        "paddle-surf",
        "mediterranean-drinks",
        "sunset-toast",
        "romantic-setup",
        "gourmet-snacks",
        "private-photographer",
      ],
      endTime: "19:30",
      id: "16:30",
      label: "16:30",
      slotKey: "16:30",
      startTime: "16:30",
    },
    {
      available: true,
      availableExtraIds: [
        "paddle-surf",
        "mediterranean-drinks",
        "sunset-toast",
        "gourmet-snacks",
      ],
      endTime: "21:30",
      id: "18:30",
      label: "18:30",
      slotKey: "18:30",
      startTime: "18:30",
    },
    {
      available: false,
      availableExtraIds: [],
      endTime: "23:00",
      id: "20:00",
      label: "20:00",
      slotKey: "20:00",
      startTime: "20:00",
    },
  ],
  extras: [
    {
      description:
        "Explore the coastline at your own pace with premium boards.",
      id: "paddle-surf",
      image: generatedImage({
        alt: "A guest paddle boarding near a private boat in clear water.",
        sizes: "(min-width: 1024px) 30vw, 42vw",
        slug: "upgrade-paddle-surf",
        widths: [320, 480, 720, 1024],
      }),
      price: 30,
      title: "Paddle Surf",
    },
    {
      description: "Curated refreshing beverages and local wines.",
      id: "mediterranean-drinks",
      image: generatedImage({
        alt: "Premium drinks, fruit and glasses prepared on a boat.",
        sizes: "(min-width: 1024px) 30vw, 42vw",
        slug: "upgrade-mediterranean-flavors",
        widths: [320, 480, 720, 1024],
      }),
      price: 45,
      title: "Mediterranean Drinks",
    },
    {
      description: "Premium champagne served as the sun sets over Barcelona.",
      id: "sunset-toast",
      image: generatedImage({
        alt: "A golden hour toast with romantic details on a boat.",
        sizes: "(min-width: 1024px) 30vw, 42vw",
        slug: "upgrade-sunset-toast",
        widths: [320, 480, 720, 1024],
      }),
      notice: "Needs 6h notice",
      price: 35,
      title: "Sunset Toast",
    },
    {
      description:
        "Rose petals, candles and a special atmosphere for your moment.",
      id: "romantic-setup",
      image: generatedImage({
        alt: "A romantic proposal setup with champagne on a private boat deck.",
        sizes: "(min-width: 1024px) 30vw, 42vw",
        slug: "experience-romantic-proposal",
        widths: [480, 720, 960, 1024],
      }),
      notice: "Needs 24h notice",
      price: 80,
      title: "Romantic Setup",
    },
    {
      description: "Selection of Spanish tapas and Mediterranean delicacies.",
      id: "gourmet-snacks",
      image: generatedImage({
        alt: "Premium drinks, fruit and glasses prepared on a boat.",
        sizes: "(min-width: 1024px) 30vw, 42vw",
        slug: "upgrade-mediterranean-flavors",
        widths: [320, 480, 720, 1024],
      }),
      notice: "Needs 12h notice",
      price: 40,
      title: "Gourmet Snacks",
    },
    {
      description:
        "Capture every moment with a professional onboard photographer.",
      id: "private-photographer",
      image: generatedImage({
        alt: "Friends laughing together during a celebration at sea.",
        sizes: "(min-width: 1024px) 30vw, 42vw",
        slug: "story-barcelona-sea",
        widths: [640, 960, 1024],
      }),
      notice: "Needs 24h notice",
      price: 120,
      title: "Private Photographer",
    },
  ],
  payment: {
    depositCopy:
      "Pay a fixed €100 deposit now. The remaining balance is paid onboard in cash.",
    secureCopy:
      "Your deposit is processed securely by Stripe without leaving this page.",
    subtitle: "You're one step away from your day at sea.",
    title: "Confirm your booking",
  },
  policies: {
    cancellation: "Cancellation windows are configurable from the backpanel.",
    meetingPoint: "Port Olimpic, Barcelona",
    remainingPayment: "Remaining balance paid onboard in cash.",
  },
  confirmation: {
    bookingReference: "JB-MOCK-2026",
    subtitle:
      "Your booking pass mock is ready. In production this page will show the real booking token and payment receipt.",
    title: "Booking confirmed",
  },
  footerLinks: [
    { href: "/en", label: "Back to JimBoats" },
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms of Service" },
  ],
} as const;

export const publicBookingMockContent = withExperienceMaps(
  publicBookingMockBase,
  "en",
);

function withExperienceMaps(
  content: typeof publicBookingMockBase,
  locale: PublicLocale,
): PublicBookingContent {
  const dictionary = getPublicDictionary(locale);

  return {
    ...content,
    bookHref: createLocalizedPath(locale, "/book"),
    footerLinks: [
      {
        href: createLocalizedPath(locale),
        label: dictionary.common.backToJimBoats,
      },
      { href: "#", label: dictionary.common.privacyPolicy },
      { href: "#", label: dictionary.common.termsOfService },
    ],
    homeHref: createLocalizedPath(locale),
    locale,
    availabilityByExperienceId: Object.fromEntries(
      content.experiences.map((experience) => [
        experience.id,
        {
          calendar: content.calendar,
          timeSlotsByDate: Object.fromEntries(
            content.calendar.days.map((day) => [day.id, content.timeSlots]),
          ),
        },
      ]),
    ),
    extrasByExperienceId: Object.fromEntries(
      content.experiences.map((experience) => [experience.id, content.extras]),
    ),
  };
}
