import type { PublicDictionary } from "./types";

export const enPublicDictionary = {
  access: {
    bookingPrefix: "Booking",
    buyerPrefix: "Buyer:",
    cancellationFallback: "No cancellation policy was attached to this booking.",
    cancellationPolicyTitle: "Cancellation policy",
    contactBody: (email) => `We will use ${email} for booking updates.`,
    contactSupport: "Contact support",
    dateAndTime: "Date and time",
    depositOutcome: {
      FULL_REFUND: "Deposit can be fully refunded.",
      MANUAL_REVIEW: "Cancellation requires manual review.",
      NO_REFUND: "Deposit is not refundable.",
      PARTIAL_REFUND: "Deposit can be partially refunded.",
    },
    depositPaid: "Deposit paid",
    detailsDescription:
      "Your booking details, payment summary and cancellation policy are available here.",
    extras: "Extras",
    guests: "Guests",
    invalidDescription:
      "This link is missing, expired or no longer matches an active booking access token.",
    invalidTitle: "Booking link not available",
    noExtras: "No extras selected for this booking.",
    payment: "Payment",
    remainingOnboard: "Remaining onboard",
    status: "Status",
    statusLabels: {
      CANCELLED: "Cancelled",
      CONFIRMED: "Confirmed",
      EXPIRED: "Expired",
      PAYMENT_FAILED: "Payment failed",
      PENDING_PAYMENT: "Pending payment",
    },
    total: "Total",
    version: "version",
  },
  booking: {
    actions: {
      continueToExtras: "Continue to extras",
      continueToPayment: "Continue to payment",
    },
    bottomBar: {
      chooseDateAndTime: "Choose date and time",
      continue: "Continue",
      depositDueNow: "Deposit due now",
      openingPayment: "Opening payment",
      payDeposit: "Pay deposit",
      remainingOnboard: (amount) => `${amount} remaining onboard in cash.`,
      selectExperience: "Select an experience to begin",
      total: "Total",
    },
    confirmation: {
      bookingReference: "JB-MOCK-2026",
      subtitle:
        "Your booking pass mock is ready. In production this page will show the real booking token and payment receipt.",
      title: "Booking confirmed",
    },
    errors: {
      invalidGuests: "Choose a valid number of guests for this experience.",
      missingCustomer: "Add your name and email before confirming.",
      missingDeliveryChannel: "Choose at least one channel for the booking pass.",
      missingWhatsappPhone: "Add a phone number to receive the pass by WhatsApp.",
    },
    experienceStep: {
      availableDates: "Available dates",
      availabilityError:
        "Availability could not be loaded. Try changing experience or refreshing the page.",
      availabilityLoading: "Loading available dates...",
      dateDesktopTitle: "Select Your Date",
      dateMobileTitle: "Select Date",
      departureTimesUnavailable: "No available departure times for this date.",
      desktopTitle: "Choose your experience and date",
      emptyExperiences: "No bookable experiences are available right now.",
      experienceDesktopTitle: "Select Your Experience",
      experienceMobileTitle: "Select Experience",
      from: "From",
      mobileTitle: "Choose your experience",
      nextMonth: "Next month",
      previousMonth: "Previous month",
      selectAvailableDate: "Select one of the available dates.",
      subtitle: "Find the perfect moment for your day at sea.",
      timeDesktopTitle: "Select Your Time",
      timeMobileTitle: "Select Time",
    },
    extrasStep: {
      add: "Add",
      emptyExtras: "There are no extras available for this departure.",
      remove: "Remove",
      selectionTitle: "Available Extras",
      skip: "Skip extras and continue",
      subtitle: "Add a few touches to make your time at sea even more special.",
      title: "Make it yours",
    },
    footer: {
      legalLabel: "Booking legal links",
      needHelp: "Need help?",
    },
    header: {
      backHome: "Back to home",
      closeLabel: "Close booking and return to JimBoats",
      navExperiences: "Experiences",
      navHowItWorks: "How it Works",
      navLabel: "Booking page links",
      navReviews: "Reviews",
      secure: "Secure",
    },
    labels: {
      accepted: "accepted",
      back: "Back",
      bookingSummary: "Booking Summary",
      bookingPass: "Booking Pass",
      cancellation: "Cancellation",
      cancellationPolicy: "Cancellation policy",
      capacity: (capacity) => `Capacity for this experience: ${capacity}.`,
      date: "Date",
      deliveryPreferences: "Delivery preferences",
      depositDueNow: (amount) => `Deposit due now: ${amount}`,
      disabled: "disabled",
      emailAddress: "Email address",
      emailPass: "Email me the booking pass",
      emailPassDescription:
        "Send the booking pass and payment receipt to the email above.",
      enabled: "enabled",
      experience: "Experience",
      extras: "Extras",
      fullName: "Full name",
      guests: "Guests",
      meetingPoint: "Meeting Point",
      noExtrasSelected: "No extras selected.",
      notAccepted: "not accepted",
      phone: "Phone",
      phoneDescription: "Needed if you want the pass sent by WhatsApp.",
      preparingPayment: "Preparing secure payment",
      promotions: "I want to receive promotions and news",
      promotionsDescription:
        "Occasional offers and JimBoats updates. This is optional.",
      remainingBalance: (amount) =>
        `Remaining balance: ${amount} paid onboard in cash.`,
      securePayment: "Secure payment",
      selectedExtras: "Selected Extras",
      termsAgreement:
        "By paying the deposit, you agree to the cancellation policy, Terms of Service and Privacy Policy.",
      time: "Time",
      total: "Total",
      whatsappPass: "Send the booking pass by WhatsApp",
      whatsappPassDescription:
        "Send the booking pass by WhatsApp using the phone number above.",
      yourDetails: "Your Details",
    },
    maxAdvanceLabel: "Bookings are available up to 6 months ahead.",
    payment: {
      depositCopy:
        "Pay a fixed €100 deposit now. The remaining balance is paid onboard in cash.",
      secureCopy:
        "Your deposit is processed securely by Stripe without leaving this page.",
      subtitle: "You're one step away from your day at sea.",
      title: "Confirm your booking",
    },
    policies: {
      cancellation: "Cancellation terms are confirmed before payment.",
      meetingPoint: "Port Olimpic, Barcelona",
      remainingPayment: "Remaining balance paid onboard in cash.",
    },
    steps: {
      confirmation: "Done",
      experience: "Experience",
      extras: "Extras",
      payment: "Payment",
    },
  },
  common: {
    backToJimBoats: "Back to JimBoats",
    bookNow: "Book now",
    contactSupport: "Contact support",
    localeLinks: [
      { href: "/en", label: "EN", locale: "en" },
      { href: "/es", label: "ES", locale: "es" },
      { href: "/ca", label: "CA", locale: "ca" },
    ],
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
  },
  landing: {
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
    experienceFallbackDescription: "Add a special touch onboard",
    experienceFallbackDescriptions: {
      "gourmet-snacks": "Enjoy Mediterranean bites onboard",
      "mediterranean-drinks": "Toast to the good life",
      "paddle-surf": "Glide across the calm waters",
      "premium-champagne": "Toast with premium champagne",
      "private-photographer": "Capture the day professionally",
      "sunset-toast": "Set the perfect mood",
    },
    experienceSection: {
      description: "Choose your perfect moment at sea",
      title: "Our Experiences",
    },
    finalCta: {
      cta: "Reserve your experience",
      title: "Ready to set sail on an unforgettable journey?",
    },
    footer: {
      copyright: "© 2026 JimBoats Charter Barcelona. All rights reserved.",
      description:
        "Premium private boat charters in Barcelona. Creating unforgettable Mediterranean memories with exceptional service.",
    },
    gallery: {
      description: "Real memories, captured on the Mediterranean.",
      title: "Moments at Sea",
    },
    headerCta: "Book now",
    hero: {
      cta: "Book your experience",
      description:
        "Unforgettable moments on the sea, crafted for the discerning traveler.",
      title: "The Barcelona sunset you'll never forget",
    },
    navigation: {
      experiences: "Experiences",
      extras: "Extras",
      gallery: "Gallery",
      howItWorks: "How it Works",
    },
    story: {
      description: "Where every wave tells a story and time stands still.",
      title: "The Soul of Barcelona from the Sea",
    },
    trustItems: [
      { icon: "shield", label: "100% Private" },
      { icon: "star", label: "5-Star Rated" },
      { icon: "anchor", label: "Port Olimpic" },
      { icon: "headset", label: "24/7 Support" },
    ],
    upgrades: {
      description: "Sensory additions to elevate your time on the water.",
      title: "Experience Upgrades",
    },
  },
  metadata: {
    booking: {
      description:
        "Choose a JimBoats private boat experience, available date, extras and deposit payment.",
      title: "Book a Private Boat Experience",
    },
    bookingAccess: {
      title: "Booking Details",
    },
    bookingReturn: {
      title: "Booking Payment Return",
    },
    home: {
      description:
        "Premium private boat charters in Barcelona for sunset cruises, celebrations, proposals and Mediterranean moments at sea.",
      ogLocale: "en_US",
      title: "Private Boat Experiences in Barcelona",
      titleWithBrand: "Private Boat Experiences in Barcelona | JimBoats",
    },
  },
  returnPage: {
    bookAnother: "Book another experience",
    confirmedDescription:
      "Your deposit has been received and your boat experience is confirmed.",
    confirmedTitle: "Booking confirmed",
    contactSupport: "Contact support",
    depositPaid: "Deposit paid",
    experience: "Experience",
    failedDescription:
      "The checkout was not completed. Your boat slot has not been confirmed.",
    failedTitle: "Payment not completed",
    finalizingDescription:
      "We are securely closing your reservation and waiting for the final payment confirmation.",
    finalizingTitle: "Finalizing your booking",
    keepOpen: "This usually takes a few seconds. Please keep this page open.",
    missingDescription:
      "We could not find a checkout session for this return page. Please contact support if you already paid.",
    missingTitle: "Checkout session not found",
    reference: "Reference",
    remainingOnboard: "Remaining onboard",
    stillFinalizingDescription:
      "We are still finalizing the payment with Stripe. If this page does not update soon, contact us and we will verify the booking manually.",
    stillFinalizingTitle: "Still finalizing your booking",
    willSendPass:
      "We will send the booking pass and payment details to {{ email }}.",
  },
} satisfies PublicDictionary;
