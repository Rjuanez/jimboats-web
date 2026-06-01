import { adminNavItems } from "@/components/layout/AdminNavigation";
import type {
  AdminExperience,
  AdminExperiencesPageData,
  AdminExtra,
} from "@/components/sections/admin-experiences/AdminExperienceTypes";
import type {
  AdminExperiencesWorkspaceDto,
  AdminExperienceWorkspaceItemDto,
} from "@/modules/experience-catalog/application/AdminExperienceDtos";
import type { AdminLocalizedExperienceContentReadModel } from "@/modules/experience-catalog/application/ports/LocalizedExperienceContentReader";

const extras: AdminExtra[] = [
  {
    defaultNoticeHours: 24,
    defaultPrice: 90,
    id: "premium-champagne",
    imageUrl: "/images/generated/landing/upgrade-sunset-toast-720.webp",
    name: "Premium champagne",
    requiresNotice: false,
  },
  {
    defaultNoticeHours: 48,
    defaultPrice: 180,
    id: "professional-photographer",
    imageUrl: "/images/generated/landing/gallery-couple-sunset-720.webp",
    name: "Professional photographer",
    requiresNotice: true,
  },
  {
    defaultNoticeHours: 24,
    defaultPrice: 65,
    id: "mediterranean-snacks",
    imageUrl:
      "/images/generated/landing/upgrade-mediterranean-flavors-720.webp",
    name: "Mediterranean snacks",
    requiresNotice: true,
  },
  {
    defaultNoticeHours: 12,
    defaultPrice: 45,
    id: "paddle-surf",
    imageUrl: "/images/generated/landing/upgrade-paddle-surf-720.webp",
    name: "Paddle surf",
    requiresNotice: false,
  },
  {
    defaultNoticeHours: 72,
    defaultPrice: 220,
    id: "flower-setup",
    imageUrl: "/images/generated/landing/experience-romantic-proposal-720.webp",
    name: "Flower setup",
    requiresNotice: true,
  },
];

const sunsetExperience: AdminExperience = {
  allowManualScheduling: true,
  basePrice: 290,
  bufferMinutes: 30,
  capacity: 8,
  depositAmount: 100,
  departurePort: "Port Olimpic, Barcelona",
  displayOrder: 1,
  durationMinutes: 120,
  extras: [
    {
      enabled: true,
      extraId: "premium-champagne",
      limitPerBooking: 4,
      noticeHours: 0,
      priceOverride: null,
    },
    {
      enabled: true,
      extraId: "professional-photographer",
      limitPerBooking: 1,
      noticeHours: 48,
      priceOverride: null,
    },
    {
      enabled: true,
      extraId: "mediterranean-snacks",
      limitPerBooking: 8,
      noticeHours: 24,
      priceOverride: null,
    },
    {
      enabled: false,
      extraId: "paddle-surf",
      limitPerBooking: 2,
      noticeHours: 0,
      priceOverride: null,
    },
  ],
  id: "sunset-experience",
  includedInternal:
    "Skipper, fuel, welcome drinks, light snacks and snorkeling equipment.",
  internalName: "Sunset Experience",
  internalNotes:
    "Remind guests that EUR 100 is paid online and the rest is paid in cash on board.",
  maxAdvanceMonths: 6,
  media: {
    filename: "experience-sunset-toast.webp",
    primaryImageUrl:
      "/images/generated/landing/experience-sunset-toast-720.webp",
    status: "ready",
  },
  minAdvanceHours: 1,
  slotPolicyType: "fixed_slots",
  slots: [
    {
      enabled: true,
      endTime: "20:00",
      id: "sunset-1800",
      label: "Sunset departure",
      startTime: "18:00",
    },
    {
      enabled: false,
      endTime: "21:00",
      id: "late-1900",
      label: "Late golden hour",
      startTime: "19:00",
    },
  ],
  status: "published",
  translations: {
    ca: {
      altText: "Grup brindant en una sortida privada en barca al capvespre.",
      bring: "Roba còmoda i una jaqueta lleugera.",
      canonical: "/ca/experiencies/sortida-privada-posta-sol-barcelona",
      cardSummary:
        "Una sortida privada al capvespre amb patró, begudes i vistes de Barcelona.",
      faq: [
        {
          answer: "La reserva es confirma amb un dipòsit de 100 EUR.",
          id: "ca-deposit",
          question: "Com funciona el dipòsit?",
        },
      ],
      geoSummary:
        "Experiència privada al capvespre a Barcelona amb sortida des del Port Olímpic.",
      h1: "Sortida privada en barca al capvespre a Barcelona",
      included: "Patró, combustible, begudes de benvinguda i snacks lleugers.",
      indexing: "noindex",
      keyFacts:
        "Barca privada; sortida des del Port Olímpic; dipòsit de 100 EUR.",
      locale: "ca",
      longDescription:
        "Gaudeix d'una sortida privada al capvespre per la costa de Barcelona.",
      publicPageEnabled: false,
      seoDescription:
        "Sortida privada en barca al capvespre a Barcelona amb patró i begudes.",
      seoTitle: "Sortida privada en barca al capvespre a Barcelona | JimBoats",
      slug: "sortida-privada-posta-sol-barcelona",
      status: "needs_review",
      title: "Sortida privada al capvespre",
      visibleTerms:
        "La resta del pagament es fa a bord en efectiu. Subjecte a meteorologia.",
    },
    en: {
      altText:
        "Friends clinking drinks during a private sunset boat cruise in Barcelona.",
      bring: "Comfortable clothes, swimwear and a light jacket.",
      canonical: "/en/experiences/private-sunset-boat-tour-barcelona",
      cardSummary:
        "A private sunset cruise with skipper, drinks and Mediterranean views.",
      faq: [
        {
          answer:
            "The booking is confirmed with a EUR 100 online deposit. The remaining amount is paid on board in cash.",
          id: "en-deposit",
          question: "How does the deposit work?",
        },
        {
          answer:
            "The experience departs from Port Olimpic in Barcelona unless staff confirms another meeting point.",
          id: "en-departure",
          question: "Where does the boat depart from?",
        },
      ],
      geoSummary:
        "Private sunset boat tour in Barcelona for up to 8 guests, including skipper, welcome drinks and a EUR 100 online deposit.",
      h1: "Private sunset boat tour in Barcelona",
      included: "Skipper, fuel, welcome drinks, light snacks and snorkeling.",
      indexing: "index",
      keyFacts:
        "Private boat; Port Olimpic departure; EUR 100 deposit; cash remainder on board; up to 8 guests.",
      locale: "en",
      longDescription:
        "Enjoy Barcelona from the sea as the sun sets behind the city. This private experience includes skipper, drinks and time to relax with your group.",
      publicPageEnabled: true,
      seoDescription:
        "Book a private sunset boat tour in Barcelona with skipper, drinks and Mediterranean views. Reserve with a EUR 100 deposit.",
      seoTitle: "Private Sunset Boat Tour in Barcelona | JimBoats",
      slug: "private-sunset-boat-tour-barcelona",
      status: "published",
      title: "Private sunset boat tour",
      visibleTerms:
        "EUR 100 deposit online. Remaining amount paid on board in cash. Weather changes are handled by staff.",
    },
    es: {
      altText:
        "Amigos brindando durante una salida privada en barco al atardecer en Barcelona.",
      bring: "Ropa cómoda, bañador y una chaqueta ligera.",
      canonical: "/es/experiencias/paseo-barco-atardecer-barcelona",
      cardSummary:
        "Una salida privada al atardecer con patrón, bebidas y vistas de Barcelona.",
      faq: [
        {
          answer:
            "La reserva se confirma con un depósito online de 100 EUR. El resto se paga en efectivo a bordo.",
          id: "es-deposit",
          question: "¿Cómo funciona el depósito?",
        },
      ],
      geoSummary:
        "Paseo privado en barco al atardecer en Barcelona con patrón, bebidas y salida desde Port Olimpic.",
      h1: "Paseo privado en barco al atardecer en Barcelona",
      included: "Patrón, combustible, bebidas de bienvenida y snacks ligeros.",
      indexing: "index",
      keyFacts:
        "Barco privado; salida desde Port Olimpic; depósito de 100 EUR; resto en efectivo a bordo.",
      locale: "es",
      longDescription:
        "Disfruta de Barcelona desde el mar mientras cae el sol. Una experiencia privada con patrón, bebidas y tiempo para relajarte con tu grupo.",
      publicPageEnabled: true,
      seoDescription:
        "Reserva una salida privada en barco al atardecer en Barcelona con patrón y bebidas. Depósito online de 100 EUR.",
      seoTitle: "Paseo privado en barco al atardecer en Barcelona | JimBoats",
      slug: "paseo-barco-atardecer-barcelona",
      status: "ready",
      title: "Paseo privado al atardecer",
      visibleTerms:
        "Depósito online de 100 EUR. El resto se paga a bordo en efectivo. Cambios por meteorología gestionados por el equipo.",
    },
  },
  type: "Private charter",
};

const experiences: AdminExperience[] = [
  sunsetExperience,
  {
    ...sunsetExperience,
    basePrice: 320,
    displayOrder: 2,
    durationMinutes: 180,
    id: "morning-breeze",
    internalName: "Morning Breeze",
    media: {
      filename: "experience-morning-breeze.webp",
      primaryImageUrl:
        "/images/generated/landing/experience-morning-breeze-720.webp",
      status: "ready",
    },
    slotPolicyType: "fixed_slots",
    status: "ready",
    translations: {
      ...sunsetExperience.translations,
      en: {
        ...sunsetExperience.translations.en,
        canonical: "/en/experiences/morning-boat-trip-barcelona",
        h1: "Private morning boat trip in Barcelona",
        seoTitle: "Private Morning Boat Trip in Barcelona | JimBoats",
        slug: "morning-boat-trip-barcelona",
        title: "Private morning boat trip",
      },
      es: {
        ...sunsetExperience.translations.es,
        canonical: "/es/experiencias/paseo-barco-manana-barcelona",
        h1: "Paseo privado en barco por la mañana en Barcelona",
        seoTitle:
          "Paseo privado en barco por la mañana en Barcelona | JimBoats",
        slug: "paseo-barco-manana-barcelona",
        title: "Paseo privado por la mañana",
      },
      ca: {
        ...sunsetExperience.translations.ca,
        status: "draft",
      },
    },
  },
  {
    ...sunsetExperience,
    basePrice: 650,
    displayOrder: 3,
    durationMinutes: 240,
    id: "party-on-boat",
    internalName: "Party on Boat",
    media: {
      filename: "experience-party-board.webp",
      primaryImageUrl:
        "/images/generated/landing/experience-party-board-720.webp",
      status: "processing",
    },
    slotPolicyType: "any_available",
    status: "draft",
    translations: {
      ...sunsetExperience.translations,
      en: {
        ...sunsetExperience.translations.en,
        canonical: "/en/experiences/private-boat-party-barcelona",
        h1: "Private boat party in Barcelona",
        seoTitle: "Private Boat Party in Barcelona | JimBoats",
        slug: "private-boat-party-barcelona",
        status: "draft",
        title: "Private boat party",
      },
      es: {
        ...sunsetExperience.translations.es,
        status: "draft",
      },
      ca: {
        ...sunsetExperience.translations.ca,
        status: "missing",
      },
    },
  },
  {
    ...sunsetExperience,
    basePrice: 490,
    capacity: 2,
    displayOrder: 4,
    durationMinutes: 120,
    extras: [
      {
        enabled: true,
        extraId: "premium-champagne",
        limitPerBooking: 1,
        noticeHours: 0,
        priceOverride: null,
      },
      {
        enabled: true,
        extraId: "professional-photographer",
        limitPerBooking: 1,
        noticeHours: 48,
        priceOverride: 160,
      },
      {
        enabled: true,
        extraId: "flower-setup",
        limitPerBooking: 1,
        noticeHours: 72,
        priceOverride: null,
      },
    ],
    id: "romantic-proposal",
    internalName: "Romantic Proposal",
    media: {
      filename: "experience-romantic-proposal.webp",
      primaryImageUrl:
        "/images/generated/landing/experience-romantic-proposal-720.webp",
      status: "ready",
    },
    status: "ready",
    translations: {
      ...sunsetExperience.translations,
      en: {
        ...sunsetExperience.translations.en,
        canonical: "/en/experiences/romantic-boat-proposal-barcelona",
        cardSummary:
          "A private boat proposal setup with skipper, cava and sunset timing.",
        h1: "Romantic boat proposal in Barcelona",
        seoDescription:
          "Plan a private boat proposal in Barcelona with skipper, cava, flowers and a EUR 100 online deposit.",
        seoTitle: "Romantic Boat Proposal in Barcelona | JimBoats",
        slug: "romantic-boat-proposal-barcelona",
        status: "ready",
        title: "Romantic boat proposal",
      },
      es: {
        ...sunsetExperience.translations.es,
        canonical: "/es/experiencias/pedida-mano-barco-barcelona",
        h1: "Pedida de mano privada en barco en Barcelona",
        seoTitle: "Pedida de mano en barco en Barcelona | JimBoats",
        slug: "pedida-mano-barco-barcelona",
        status: "ready",
        title: "Pedida de mano en barco",
      },
      ca: {
        ...sunsetExperience.translations.ca,
        status: "draft",
      },
    },
  },
];

export function getAdminExperiencesPreviewPage(): AdminExperiencesPageData {
  return {
    navItems: adminNavItems,
    state: {
      experiences,
      extras,
      locales: ["en", "es", "ca"],
    },
  };
}

export async function getAdminExperiencesPage(): Promise<AdminExperiencesPageData> {
  if (process.env.JIMBOATS_ADMIN_PREVIEW_DATA === "1") {
    return getAdminExperiencesPreviewPage();
  }

  const { getContainer } = await import("@/container");
  const workspace = await getContainer().adminExperiences.getWorkspace();

  return {
    navItems: adminNavItems,
    state: presentAdminExperiencesWorkspace(workspace),
  };
}

export function presentAdminExperiencesWorkspace(
  workspace: AdminExperiencesWorkspaceDto,
): AdminExperiencesPageData["state"] {
  return {
    experiences: workspace.experiences.map(presentExperience),
    extras: workspace.extras.map((extra) => ({
      defaultNoticeHours: Math.round(extra.defaultNoticeMinutes / 60),
      defaultPrice: fromMoney(extra.price),
      id: extra.id,
      imageUrl: "",
      name: extra.name,
      requiresNotice: extra.defaultNoticeMinutes > 0,
    })),
    locales: workspace.locales.filter(isAdminLocale).sort(sortLocalesForAdmin),
  };
}

function presentExperience(
  item: AdminExperienceWorkspaceItemDto,
): AdminExperience {
  const experience = item.experience;
  const mediaAssetId = experience.media.assetId ?? "";

  return {
    allowManualScheduling: experience.allowsManualScheduling,
    basePrice: fromMoney(experience.basePrice),
    bufferMinutes: experience.bufferMinutes,
    capacity: experience.capacity,
    depositAmount: fromMoney(experience.depositAmount),
    departurePort: experience.departurePort,
    displayOrder: experience.displayOrder,
    durationMinutes: experience.durationMinutes,
    extras: experience.extraSelectionRules.map((rule) => ({
      enabled: rule.enabled,
      extraId: rule.extraId,
      limitPerBooking: rule.limitPerBooking,
      noticeHours: Math.round(rule.noticeMinutes / 60),
      priceOverride: rule.priceOverride ? fromMoney(rule.priceOverride) : null,
    })),
    id: experience.id,
    includedInternal: experience.includedItems,
    internalName: experience.internalName,
    internalNotes: experience.internalNotes,
    maxAdvanceMonths: experience.maximumAdvanceMonths,
    media: {
      filename: mediaAssetId,
      primaryImageUrl: mediaAssetId.startsWith("/") ? mediaAssetId : "",
      status:
        experience.media.status.toLowerCase() as AdminExperience["media"]["status"],
    },
    minAdvanceHours: Math.round(experience.minimumAdvanceMinutes / 60),
    slotPolicyType: slotPolicyTypeToAdmin(experience.slotPolicy.mode),
    slots: experience.slotPolicy.fixedSlots.map((slot) => ({
      enabled: slot.enabled,
      endTime: minutesToTime(slot.endMinutes),
      id: slot.id,
      label: slot.label,
      startTime: minutesToTime(slot.startMinutes),
    })),
    status: experience.status.toLowerCase() as AdminExperience["status"],
    translations: {
      ca: presentTranslation(item, "ca"),
      en: presentTranslation(item, "en"),
      es: presentTranslation(item, "es"),
    },
    type: experience.type,
  };
}

function presentTranslation(
  item: AdminExperienceWorkspaceItemDto,
  locale: AdminExperience["translations"]["en"]["locale"],
) {
  const content = item.localizedContents.find((candidate) => {
    return candidate.locale === locale;
  });

  if (!content) {
    return missingTranslation(
      item.experience.id,
      locale,
      item.experience.internalName,
    );
  }

  return {
    altText: content.imageAltText,
    bring: content.bringText,
    canonical: `/${locale}/experiences/${content.slug}`,
    cardSummary: content.summary,
    faq: content.faqItems.map((faq, index) => ({
      answer: faq.answer,
      id: `${locale}-${item.experience.id}-faq-${index + 1}`,
      question: faq.question,
    })),
    geoSummary: content.geoSummary,
    h1: content.h1,
    included: content.includedText,
    indexing: content.indexingPolicy === "INDEX" ? "index" : "noindex",
    keyFacts: content.keyFacts,
    locale,
    longDescription: content.mainContent,
    publicPageEnabled: content.publicPageEnabled,
    seoDescription: content.seoDescription,
    seoTitle: content.seoTitle,
    slug: content.slug,
    status: translationStatusToAdmin(content),
    title: content.title,
    visibleTerms: content.visibleTerms,
  } satisfies AdminExperience["translations"]["en"];
}

function missingTranslation(
  experienceId: string,
  locale: AdminExperience["translations"]["en"]["locale"],
  title: string,
): AdminExperience["translations"]["en"] {
  return {
    altText: "",
    bring: "",
    canonical: `/${locale}/experiences/${experienceId}`,
    cardSummary: "",
    faq: [],
    geoSummary: "",
    h1: title,
    included: "",
    indexing: "noindex",
    keyFacts: "",
    locale,
    longDescription: "",
    publicPageEnabled: false,
    seoDescription: "",
    seoTitle: `${title} | JimBoats`,
    slug: experienceId,
    status: "missing",
    title,
    visibleTerms: "",
  };
}

function translationStatusToAdmin(
  content: AdminLocalizedExperienceContentReadModel,
): AdminExperience["translations"]["en"]["status"] {
  if (content.status === "PUBLISHED") {
    return "published";
  }

  if (content.status === "READY") {
    return "ready";
  }

  if (content.status === "NEEDS_REVIEW" || content.status === "OUTDATED") {
    return "needs_review";
  }

  if (content.status === "NEEDS_TRANSLATION") {
    return "missing";
  }

  return "draft";
}

function slotPolicyTypeToAdmin(
  mode: AdminExperiencesWorkspaceDto["experiences"][number]["experience"]["slotPolicy"]["mode"],
): AdminExperience["slotPolicyType"] {
  if (mode === "ANY_AVAILABLE") {
    return "any_available";
  }

  if (mode === "MANUAL_APPROVAL") {
    return "manual_approval";
  }

  return "fixed_slots";
}

function fromMoney(money: { amountMinor: number }) {
  return money.amountMinor / 100;
}

function minutesToTime(minutes: number) {
  const hour = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const minute = (minutes % 60).toString().padStart(2, "0");

  return `${hour}:${minute}`;
}

function isAdminLocale(
  value: string,
): value is AdminExperience["translations"]["en"]["locale"] {
  return value === "en" || value === "es" || value === "ca";
}

function sortLocalesForAdmin(
  left: AdminExperience["translations"]["en"]["locale"],
  right: AdminExperience["translations"]["en"]["locale"],
) {
  const order = {
    en: 0,
    es: 1,
    ca: 2,
  };

  return order[left] - order[right];
}
