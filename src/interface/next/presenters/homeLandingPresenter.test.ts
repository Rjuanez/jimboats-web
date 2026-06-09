import { describe, expect, it, vi } from "vitest";

import type {
  PublicBookingCalendar,
  PublicBookingContent,
  PublicBookingExtra,
  PublicBookingExperience,
} from "@/components/sections/public-booking/PublicBookingTypes";

import {
  createHomeLandingStructuredData,
  getHomeLandingPage,
  homeLandingContent,
} from "./homeLandingPresenter";
import { getPublicBookingPage } from "./publicBookingPresenter";

vi.mock("./publicBookingPresenter", () => ({
  getPublicBookingPage: vi.fn(),
}));

describe("homeLandingPresenter", () => {
  it("projects the public booking catalog into the landing content", async () => {
    vi.mocked(getPublicBookingPage).mockResolvedValue(publicBookingFixture());

    const content = await getHomeLandingPage("en");

    expect(content.experiences.map((experience) => experience.id)).toEqual([
      "sunset-private-cruise",
      "morning-breeze-charter",
    ]);
    expect(content.experiences[0]).toMatchObject({
      ctaHref: "/en/book?experience=sunset-private-cruise",
      featured: true,
      price: "EUR 290",
      title: "Sunset Private Cruise",
    });
    expect(content.experiences[1]).toMatchObject({
      price: "EUR 350",
      reverse: true,
    });
    expect(content.extras.items.map((extra) => extra.title)).toEqual([
      "Mediterranean Drinks",
      "Sunset Toast",
    ]);
    expect(content.footer.experienceLinks).toEqual([
      { href: "#sunset-private-cruise", label: "Sunset Private Cruise" },
      { href: "#morning-breeze-charter", label: "Morning Breeze Charter" },
    ]);
    expect(content.footer.contact).toEqual({
      email: "info@jimboatscharter.com",
      phone: "+34 669707354",
      place: "Moll de Xaloc, 3, Sant Martí, 08005 Barcelona",
    });

    const structuredData = createHomeLandingStructuredData(content);

    expect(structuredData).toMatchObject({
      address: {
        postalCode: "08005",
        streetAddress: "Moll de Xaloc, 3, Sant Martí",
      },
      email: "info@jimboatscharter.com",
      sameAs: ["https://www.instagram.com/jimboatsbcn/"],
      telephone: "+34 669707354",
    });
    expect(structuredData.makesOffer).toEqual([
      expect.objectContaining({
        name: "Sunset Private Cruise",
        price: 290,
        priceCurrency: "EUR",
        url: "/en/book?experience=sunset-private-cruise",
      }),
      expect.objectContaining({
        name: "Morning Breeze Charter",
        price: 350,
        priceCurrency: "EUR",
        url: "/en/book?experience=morning-breeze-charter",
      }),
    ]);
  });

  it("falls back to the static landing content when the catalog is unavailable", async () => {
    vi.mocked(getPublicBookingPage).mockRejectedValue(new Error("DB offline"));

    await expect(getHomeLandingPage("en")).resolves.toStrictEqual(
      homeLandingContent,
    );
  });
});

function publicBookingFixture(): PublicBookingContent {
  const calendar: PublicBookingCalendar = {
    days: [],
    monthLabel: "June 2026",
    weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  };
  const sunsetExperience = experienceFixture({
    description:
      "Experience the magic of Barcelona's coastline as the sun dips below the horizon.",
    id: "sunset-private-cruise",
    price: 290,
    title: "Sunset Private Cruise",
  });
  const morningExperience = experienceFixture({
    description:
      "Start your day with an invigorating sail and clear Mediterranean water.",
    id: "morning-breeze-charter",
    price: 350,
    title: "Morning Breeze Charter",
  });
  const drinks = extraFixture({
    id: "mediterranean-drinks",
    price: 45,
    title: "Mediterranean Drinks",
  });
  const toast = extraFixture({
    id: "sunset-toast",
    price: 35,
    title: "Sunset Toast",
  });

  return {
    availabilityByExperienceId: {
      "morning-breeze-charter": {
        calendar,
        timeSlotsByDate: {},
      },
      "sunset-private-cruise": {
        calendar,
        timeSlotsByDate: {},
      },
    },
    brand: "JimBoats",
    bookHref: "/en/book",
    calendar,
    confirmation: {
      bookingReference: "JB-MOCK-2026",
      subtitle: "Confirmed",
      title: "Booking confirmed",
    },
    currencySymbol: "€",
    depositAmount: 100,
    experiences: [sunsetExperience, morningExperience],
    extras: [drinks, toast],
    extrasByExperienceId: {
      "morning-breeze-charter": [drinks],
      "sunset-private-cruise": [drinks, toast],
    },
    footerLinks: [],
    homeHref: "/en",
    locale: "en",
    maxAdvanceLabel: "Bookings are available up to 6 months ahead.",
    payment: {
      depositCopy: "Pay a fixed €100 deposit now.",
      secureCopy: "Secure payment mock.",
      subtitle: "Confirm your booking.",
      title: "Confirm",
    },
    policies: {
      cancellation: "Configurable cancellation windows.",
      meetingPoint: "Port Olimpic, Barcelona",
      remainingPayment: "Remaining balance paid onboard in cash.",
    },
    steps: [],
    support: {
      email: "info@jimboatscharter.com",
      phone: "+34 600 000 000",
    },
    timeSlots: [],
  };
}

function experienceFixture({
  description,
  id,
  price,
  title,
}: Pick<PublicBookingExperience, "description" | "id" | "price" | "title">) {
  return {
    capacity: 8,
    depositAmount: 100,
    description,
    durationLabel: "3h",
    id,
    image: imageFixture(title),
    price,
    title,
  } satisfies PublicBookingExperience;
}

function extraFixture({
  id,
  price,
  title,
}: Pick<PublicBookingExtra, "id" | "price" | "title">) {
  return {
    description: title,
    id,
    image: imageFixture(title),
    price,
    title,
  } satisfies PublicBookingExtra;
}

function imageFixture(alt: string) {
  return {
    alt,
    height: 480,
    sizes: "100vw",
    src: "/media/test.webp",
    srcSet: "/media/test.webp 640w",
    width: 640,
  };
}
