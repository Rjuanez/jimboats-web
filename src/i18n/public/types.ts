import type { PublicLocale } from "@/i18n/locales";

export type PublicDictionary = {
  access: {
    bookingPrefix: string;
    buyerPrefix: string;
    cancellationFallback: string;
    cancellationPolicyTitle: string;
    contactBody: (email: string) => string;
    contactSupport: string;
    dateAndTime: string;
    depositOutcome: Record<
      "FULL_REFUND" | "MANUAL_REVIEW" | "NO_REFUND" | "PARTIAL_REFUND",
      string
    >;
    depositPaid: string;
    detailsDescription: string;
    extras: string;
    guests: string;
    invalidDescription: string;
    invalidTitle: string;
    noExtras: string;
    payment: string;
    remainingOnboard: string;
    status: string;
    statusLabels: Record<
      "CANCELLED" | "CONFIRMED" | "EXPIRED" | "PAYMENT_FAILED" | "PENDING_PAYMENT",
      string
    >;
    total: string;
    version: string;
  };
  booking: {
    bottomBar: {
      chooseDateAndTime: string;
      continue: string;
      depositDueNow: string;
      openingPayment: string;
      payDeposit: string;
      remainingOnboard: (amount: string) => string;
      selectExperience: string;
      total: string;
    };
    actions: {
      continueToExtras: string;
      continueToPayment: string;
    };
    confirmation: {
      bookingReference: string;
      subtitle: string;
      title: string;
    };
    errors: {
      invalidGuests: string;
      missingCustomer: string;
      missingDeliveryChannel: string;
      missingWhatsappPhone: string;
    };
    experienceStep: {
      availableDates: string;
      availabilityError: string;
      availabilityLoading: string;
      dateDesktopTitle: string;
      dateMobileTitle: string;
      departureTimesUnavailable: string;
      desktopTitle: string;
      emptyExperiences: string;
      experienceDesktopTitle: string;
      experienceMobileTitle: string;
      from: string;
      mobileTitle: string;
      nextMonth: string;
      previousMonth: string;
      selectAvailableDate: string;
      subtitle: string;
      timeDesktopTitle: string;
      timeMobileTitle: string;
    };
    extrasStep: {
      add: string;
      emptyExtras: string;
      remove: string;
      skip: string;
      subtitle: string;
      title: string;
      selectionTitle: string;
    };
    footer: {
      legalLabel: string;
      needHelp: string;
    };
    header: {
      backHome: string;
      closeLabel: string;
      navExperiences: string;
      navHowItWorks: string;
      navLabel: string;
      navReviews: string;
      secure: string;
    };
    labels: {
      accepted: string;
      back: string;
      bookingSummary: string;
      bookingPass: string;
      cancellation: string;
      cancellationPolicy: string;
      capacity: (capacity: number) => string;
      date: string;
      deliveryPreferences: string;
      depositDueNow: (amount: string) => string;
      disabled: string;
      emailAddress: string;
      emailPass: string;
      emailPassDescription: string;
      enabled: string;
      experience: string;
      extras: string;
      fullName: string;
      guests: string;
      meetingPoint: string;
      noExtrasSelected: string;
      notAccepted: string;
      phone: string;
      phoneDescription: string;
      preparingPayment: string;
      promotions: string;
      promotionsDescription: string;
      remainingBalance: (amount: string) => string;
      securePayment: string;
      selectedExtras: string;
      termsAgreement: string;
      time: string;
      total: string;
      whatsappPass: string;
      whatsappPassDescription: string;
      yourDetails: string;
    };
    maxAdvanceLabel: string;
    payment: {
      depositCopy: string;
      secureCopy: string;
      subtitle: string;
      title: string;
    };
    policies: {
      cancellation: string;
      meetingPoint: string;
      remainingPayment: string;
    };
    steps: {
      confirmation: string;
      experience: string;
      extras: string;
      payment: string;
    };
  };
  common: {
    backToJimBoats: string;
    bookNow: string;
    contactSupport: string;
    localeLinks: readonly {
      href: string;
      label: string;
      locale: PublicLocale;
    }[];
    privacyPolicy: string;
    termsOfService: string;
  };
  landing: {
    booking: {
      steps: readonly {
        description: string;
        icon: "anchor" | "calendar" | "sparkles";
        title: string;
      }[];
      title: string;
    };
    experienceFallbackDescriptions: Record<string, string>;
    experienceFallbackDescription: string;
    experienceSection: {
      description: string;
      title: string;
    };
    finalCta: {
      cta: string;
      title: string;
    };
    footer: {
      copyright: string;
      description: string;
    };
    gallery: {
      description: string;
      title: string;
    };
    headerCta: string;
    hero: {
      cta: string;
      description: string;
      title: string;
    };
    navigation: {
      experiences: string;
      extras: string;
      gallery: string;
      howItWorks: string;
    };
    story: {
      description: string;
      title: string;
    };
    trustItems: readonly {
      icon: "anchor" | "headset" | "shield" | "star";
      label: string;
    }[];
    upgrades: {
      description: string;
      title: string;
    };
  };
  metadata: {
    booking: {
      description: string;
      title: string;
    };
    bookingAccess: {
      title: string;
    };
    bookingReturn: {
      title: string;
    };
    home: {
      description: string;
      ogLocale: string;
      title: string;
      titleWithBrand: string;
    };
  };
  returnPage: {
    bookAnother: string;
    confirmedDescription: string;
    confirmedTitle: string;
    contactSupport: string;
    depositPaid: string;
    experience: string;
    failedDescription: string;
    failedTitle: string;
    finalizingDescription: string;
    finalizingTitle: string;
    keepOpen: string;
    missingDescription: string;
    missingTitle: string;
    reference: string;
    remainingOnboard: string;
    stillFinalizingDescription: string;
    stillFinalizingTitle: string;
    willSendPass: (email: string) => string;
  };
};
