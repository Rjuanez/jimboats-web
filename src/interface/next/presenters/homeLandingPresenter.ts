import type {
  HomeLandingContent,
  HomeLandingExperience,
  HomeLandingUpgrade,
} from "@/components/sections/HomeLandingPage";
import type {
  PublicBookingContent,
  PublicBookingExperience,
  PublicBookingExtra,
} from "@/components/sections/public-booking/PublicBookingTypes";
import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

import { getPublicBookingPage } from "./publicBookingPresenter";

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

export const homeLandingContent = {
  brand: "JimBoats",
  navigation: [
    { href: "#experiences", label: "Experiences" },
    { href: "#extras", label: "Extras" },
    { href: "#gallery", label: "Gallery" },
    { href: "#how-it-works", label: "How it Works" },
  ],
  headerCta: {
    href: "/en/book",
    label: "Book now",
  },
  hero: {
    cta: {
      href: "/en/book",
      label: "Book your experience",
    },
    description:
      "Unforgettable moments on the sea, crafted for the discerning traveler.",
    image: generatedImage({
      alt: "Friends enjoying a private sunset cruise with the Barcelona skyline behind them.",
      sizes: "100vw",
      slug: "hero-sunset-barcelona",
      widths: [640, 960, 1024],
    }),
    title: "The Barcelona sunset you'll never forget",
  },
  trustItems: [
    { icon: "shield", label: "100% Private" },
    { icon: "star", label: "5-Star Rated" },
    { icon: "anchor", label: "Port Olimpic" },
    { icon: "headset", label: "24/7 Support" },
  ],
  experiences: [
    {
      ctaHref: "/en/book?experience=sunset-private-cruise",
      ctaLabel: "Reserve",
      description:
        "Experience the magic of Barcelona's coastline as the sun dips below the horizon. A peaceful sail with premium drinks and stunning views.",
      featured: true,
      id: "sunset-cruise",
      image: generatedImage({
        alt: "Friends clinking drinks during a golden hour boat cruise in Barcelona.",
        sizes: "(min-width: 1024px) 58vw, 100vw",
        slug: "experience-sunset-toast",
        widths: [480, 720, 960, 1024],
      }),
      price: "EUR 290",
      title: "A toast to the golden hour",
    },
    {
      ctaHref: "/en/book?experience=morning-breeze-charter",
      ctaLabel: "Reserve",
      description:
        "Start your day with an invigorating sail. Feel the fresh breeze, take a dip in crystal-clear waters, and enjoy the tranquil sea before the city wakes up.",
      id: "morning-breeze",
      image: generatedImage({
        alt: "Guests relaxing on deck during a bright morning sail near Barcelona.",
        sizes: "(min-width: 1024px) 50vw, 100vw",
        slug: "experience-morning-breeze",
        widths: [480, 720, 960, 1024],
      }),
      price: "EUR 350",
      reverse: true,
      title: "Feel the Mediterranean breeze",
    },
    {
      ctaHref: "/en/book?experience=party-on-board",
      ctaLabel: "Reserve",
      description:
        "Celebrate life with a private boat party. Bring your friends, play your favorite music, and enjoy a vibrant atmosphere on the water.",
      id: "party-on-board",
      image: generatedImage({
        alt: "A group of friends celebrating on a private boat in the Mediterranean sun.",
        sizes: "(min-width: 1024px) 58vw, 100vw",
        slug: "experience-party-board",
        widths: [480, 720, 960, 1024],
      }),
      price: "EUR 480",
      title: "Party on Board",
    },
    {
      ctaHref: "/en/book?experience=romantic-proposal",
      ctaLabel: "Reserve",
      description:
        "Create a memory that will last a lifetime. Intimate decoration, premium champagne, and the perfect secluded spot on the sea.",
      id: "romantic-proposal",
      image: generatedImage({
        alt: "A romantic proposal setup with champagne on a private boat deck.",
        sizes: "(min-width: 1024px) 58vw, 100vw",
        slug: "experience-romantic-proposal",
        widths: [480, 720, 960, 1024],
      }),
      price: "EUR 420",
      reverse: true,
      title: "Romantic Proposal",
    },
  ],
  story: {
    description: "Where every wave tells a story and time stands still.",
    image: generatedImage({
      alt: "Friends laughing together during a celebration at sea.",
      sizes: "100vw",
      slug: "story-barcelona-sea",
      widths: [640, 960, 1024],
    }),
    title: "The Soul of Barcelona from the Sea",
  },
  extras: {
    description: "Sensory additions to elevate your time on the water.",
    items: [
      {
        description: "Glide across the calm waters",
        image: generatedImage({
          alt: "A guest paddle boarding near a private boat in clear water.",
          sizes: "(min-width: 768px) 33vw, 25vw",
          slug: "upgrade-paddle-surf",
          widths: [320, 480, 720, 1024],
        }),
        title: "Paddle Surf",
      },
      {
        description: "Toast to the good life",
        image: generatedImage({
          alt: "Premium drinks, fruit and glasses prepared on a boat.",
          sizes: "(min-width: 768px) 33vw, 25vw",
          slug: "upgrade-mediterranean-flavors",
          widths: [320, 480, 720, 1024],
        }),
        title: "Mediterranean Flavors",
      },
      {
        description: "Set the perfect mood",
        image: generatedImage({
          alt: "A golden hour toast with romantic details on a boat.",
          sizes: "(min-width: 768px) 33vw, 25vw",
          slug: "upgrade-sunset-toast",
          widths: [320, 480, 720, 1024],
        }),
        title: "Sunset Toast",
      },
    ],
    title: "Experience Upgrades",
  },
  gallery: {
    description: "Real memories, captured on the Mediterranean.",
    images: [
      generatedImage({
        alt: "A couple laughing together on a private boat at sunset.",
        sizes: "(min-width: 768px) 58vw, 100vw",
        slug: "gallery-couple-sunset",
        widths: [480, 720, 960, 1024],
      }),
      generatedImage({
        alt: "A guest relaxing with the sea breeze on a sunny boat deck.",
        sizes: "(min-width: 768px) 42vw, 50vw",
        slug: "gallery-sea-breeze",
        widths: [320, 480, 720, 1024],
      }),
      generatedImage({
        alt: "Champagne glasses clinking with the Mediterranean in the background.",
        sizes: "(min-width: 768px) 42vw, 50vw",
        slug: "gallery-champagne",
        widths: [320, 480, 720, 1024],
      }),
      generatedImage({
        alt: "Friends jumping from a boat into clear Mediterranean water.",
        sizes: "(min-width: 768px) 42vw, 100vw",
        slug: "gallery-jump-sea",
        widths: [480, 720, 960, 1024],
      }),
      generatedImage({
        alt: "A private boat cruising along the Barcelona coast.",
        sizes: "(min-width: 768px) 58vw, 100vw",
        slug: "gallery-barcelona-coast",
        widths: [480, 720, 960, 1024],
      }),
    ],
    title: "Moments at Sea",
  },
  booking: {
    steps: [
      {
        description: "Select your moment and date.",
        icon: "calendar",
        title: "Choose",
      },
      {
        description: "Add upgrades to make it yours.",
        icon: "sparkles",
        title: "Customize",
      },
      {
        description: "Meet us at the port and enjoy.",
        icon: "anchor",
        title: "Sail",
      },
    ],
    title: "Effortless Booking",
  },
  finalCta: {
    cta: {
      href: "/en/book",
      label: "Reserve your experience",
    },
    image: generatedImage({
      alt: "A calm Mediterranean golden hour scene with a boat sailing away.",
      sizes: "100vw",
      slug: "final-cta-golden-sea",
      widths: [640, 960, 1024],
    }),
    title: "Ready to set sail on an unforgettable journey?",
  },
  footer: {
    contact: {
      email: "hello@jimboats.com",
      phone: "+34 600 000 000",
      place: "Port Olimpic, Moll de Mestral, 08005 Barcelona",
    },
    copyright: "© 2026 JimBoats Charter Barcelona. All rights reserved.",
    description:
      "Premium private boat charters in Barcelona. Creating unforgettable Mediterranean memories with exceptional service.",
    experienceLinks: [
      { href: "#sunset-cruise", label: "Sunset Cruise" },
      { href: "#morning-breeze", label: "Morning Breeze" },
      { href: "#party-on-board", label: "Party on Board" },
      { href: "#romantic-proposal", label: "Romantic Proposal" },
    ],
    legalLinks: [
      { href: "#", label: "Privacy Policy" },
      { href: "#", label: "Terms of Service" },
    ],
    socialLinks: [
      { href: "#", label: "Instagram", network: "instagram" },
      { href: "#", label: "Facebook", network: "facebook" },
    ],
  },
} as const satisfies HomeLandingContent;

export async function getHomeLandingPage(
  locale: SupportedLocaleCode = "en",
): Promise<HomeLandingContent> {
  let publicBookingContent: PublicBookingContent;

  try {
    publicBookingContent = await getPublicBookingPage(locale);
  } catch {
    return homeLandingContent;
  }

  return presentHomeLandingContent(publicBookingContent);
}

export function createHomeLandingStructuredData(content: HomeLandingContent) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Barcelona",
      addressRegion: "Catalonia",
      postalCode: "08005",
      streetAddress: "Port Olimpic, Moll de Mestral",
    },
    areaServed: "Barcelona",
    description: content.footer.description,
    email: content.footer.contact.email,
    image: content.hero.image.src,
    makesOffer: content.experiences.map((experience) => ({
      "@type": "Offer",
      name: experience.title,
      price: priceValueFromLabel(experience.price),
      priceCurrency: "EUR",
      url: experience.ctaHref,
    })),
    name: "JimBoats",
    telephone: content.footer.contact.phone,
  };
}

export const homeLandingStructuredData =
  createHomeLandingStructuredData(homeLandingContent);

function presentHomeLandingContent(
  publicBookingContent: PublicBookingContent,
): HomeLandingContent {
  const experiences =
    publicBookingContent.experiences.length > 0
      ? publicBookingContent.experiences.map((experience, index) =>
          presentLandingExperience(experience, index),
        )
      : homeLandingContent.experiences;
  const extras = presentLandingExtras(publicBookingContent);

  return {
    ...homeLandingContent,
    experiences,
    extras: {
      ...homeLandingContent.extras,
      items: extras.length > 0 ? extras : homeLandingContent.extras.items,
    },
    footer: {
      ...homeLandingContent.footer,
      experienceLinks: experiences.map((experience) => ({
        href: `#${experience.id}`,
        label: experience.title,
      })),
    },
  };
}

function presentLandingExperience(
  experience: PublicBookingExperience,
  index: number,
): HomeLandingExperience {
  return {
    ctaHref: `/en/book?experience=${encodeURIComponent(experience.id)}`,
    ctaLabel: "Reserve",
    description: experience.description,
    featured: index === 0,
    id: experience.id,
    image: {
      ...experience.image,
      sizes:
        index === 1
          ? "(min-width: 1024px) 50vw, 100vw"
          : "(min-width: 1024px) 58vw, 100vw",
    },
    price: `EUR ${experience.price.toLocaleString("en-US")}`,
    reverse: index % 2 === 1,
    title: experience.title,
  };
}

function presentLandingExtras(
  publicBookingContent: PublicBookingContent,
): HomeLandingUpgrade[] {
  const extrasById = new Map<string, PublicBookingExtra>();

  for (const extras of Object.values(
    publicBookingContent.extrasByExperienceId,
  )) {
    for (const extra of extras) {
      if (!extrasById.has(extra.id)) {
        extrasById.set(extra.id, extra);
      }
    }
  }

  return [...extrasById.values()].slice(0, 3).map((extra) => ({
    description: upgradeDescription(extra),
    image: {
      ...extra.image,
      sizes: "(min-width: 768px) 33vw, 25vw",
    },
    title: extra.title,
  }));
}

function upgradeDescription(extra: PublicBookingExtra) {
  if (extra.description && extra.description !== extra.title) {
    return extra.description;
  }

  const knownDescriptions = new Map([
    ["paddle-surf", "Glide across the calm waters"],
    ["mediterranean-drinks", "Toast to the good life"],
    ["sunset-toast", "Set the perfect mood"],
    ["premium-champagne", "Toast with premium champagne"],
    ["gourmet-snacks", "Enjoy Mediterranean bites onboard"],
    ["private-photographer", "Capture the day professionally"],
  ]);

  return knownDescriptions.get(extra.id) ?? "Add a special touch onboard";
}

function priceValueFromLabel(price: string) {
  const value = Number(price.replace(/[^\d.]/g, ""));

  return Number.isFinite(value) ? value : undefined;
}
