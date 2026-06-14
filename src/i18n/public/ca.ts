import type { PublicDictionary } from "./types";

export const caPublicDictionary = {
  access: {
    bookingPrefix: "Reserva",
    buyerPrefix: "Client:",
    cancellationFallback:
      "Aquesta reserva no té cap política de cancel·lació associada.",
    cancellationPolicyTitle: "Política de cancel·lació",
    contactBody: (email) =>
      `Farem servir ${email} per enviar-te actualitzacions de la reserva.`,
    contactSupport: "Contactar",
    dateAndTime: "Data i hora",
    depositOutcome: {
      FULL_REFUND: "La paga i senyal es pot reemborsar completament.",
      MANUAL_REVIEW: "La cancel·lació requereix revisió manual.",
      NO_REFUND: "La paga i senyal no és reemborsable.",
      PARTIAL_REFUND: "La paga i senyal es pot reemborsar parcialment.",
    },
    depositPaid: "Paga i senyal pagada",
    detailsDescription:
      "Aquí tens els detalls de la reserva, el resum de pagament i la política de cancel·lació.",
    extras: "Extres",
    guests: "Persones",
    invalidDescription:
      "Aquest enllaç falta, ha caducat o ja no coincideix amb una reserva activa.",
    invalidTitle: "Enllaç de reserva no disponible",
    noExtras: "No hi ha extres seleccionats per a aquesta reserva.",
    payment: "Pagament",
    remainingOnboard: "Resta a bord",
    status: "Estat",
    statusLabels: {
      CANCELLED: "Cancel·lada",
      CONFIRMED: "Confirmada",
      EXPIRED: "Caducada",
      PAYMENT_FAILED: "Pagament fallit",
      PENDING_PAYMENT: "Pagament pendent",
    },
    total: "Total",
    version: "versió",
  },
  booking: {
    actions: {
      continueToExtras: "Continuar a extres",
      continueToPayment: "Continuar al pagament",
    },
    bottomBar: {
      chooseDateAndTime: "Tria data i hora",
      continue: "Continuar",
      depositDueNow: "Senyal ara",
      openingPayment: "Obrint pagament",
      payDeposit: "Pagar senyal",
      remainingOnboard: (amount) => `${amount} restants a bord en efectiu.`,
      selectExperience: "Selecciona una experiència per començar",
      total: "Total",
    },
    confirmation: {
      bookingReference: "JB-MOCK-2026",
      subtitle:
        "El teu passi de reserva de prova està llest. En producció aquesta pantalla mostrarà el token real i el rebut de pagament.",
      title: "Reserva confirmada",
    },
    errors: {
      invalidGuests: "Tria un nombre vàlid de persones per a aquesta experiència.",
      missingCustomer: "Afegeix el teu nom i email abans de confirmar.",
      missingDeliveryChannel: "Tria almenys un canal per rebre el passi.",
      missingWhatsappPhone: "Afegeix un telèfon per rebre el passi per WhatsApp.",
    },
    experienceStep: {
      availableDates: "Dates disponibles",
      availabilityError:
        "No s'ha pogut carregar la disponibilitat. Prova a canviar d'experiència o refrescar la pàgina.",
      availabilityLoading: "Carregant dates disponibles...",
      dateDesktopTitle: "Tria la teva data",
      dateMobileTitle: "Tria data",
      departureTimesUnavailable: "No hi ha horaris disponibles per a aquesta data.",
      desktopTitle: "Tria experiència i data",
      emptyExperiences: "Ara mateix no hi ha experiències reservables.",
      experienceDesktopTitle: "Tria la teva experiència",
      experienceMobileTitle: "Tria experiència",
      from: "Des de",
      mobileTitle: "Tria la teva experiència",
      nextMonth: "Mes següent",
      previousMonth: "Mes anterior",
      selectAvailableDate: "Selecciona una de les dates disponibles.",
      subtitle: "Troba el moment perfecte per al teu dia al mar.",
      timeDesktopTitle: "Tria la teva hora",
      timeMobileTitle: "Tria hora",
    },
    extrasStep: {
      add: "Afegir",
      emptyExtras: "No hi ha extres disponibles per a aquesta sortida.",
      remove: "Treure",
      selectionTitle: "Extres disponibles",
      skip: "Saltar extres i continuar",
      subtitle: "Afegeix alguns detalls per fer la sortida encara més especial.",
      title: "Fes-ho a la teva manera",
    },
    footer: {
      legalLabel: "Enllaços legals de reserva",
      needHelp: "Necessites ajuda?",
    },
    header: {
      backHome: "Tornar a l'inici",
      closeLabel: "Tancar reserva i tornar a JimBoats",
      navExperiences: "Experiències",
      navHowItWorks: "Com funciona",
      navLabel: "Enllaços de la pàgina de reserva",
      navReviews: "Opinions",
      secure: "Segur",
    },
    labels: {
      accepted: "acceptades",
      back: "Enrere",
      bookingSummary: "Resum de reserva",
      bookingPass: "Passi de reserva",
      cancellation: "Cancel·lació",
      cancellationPolicy: "Política de cancel·lació",
      capacity: (capacity) => `Capacitat d'aquesta experiència: ${capacity}.`,
      coupon: "Cupó",
      couponApplied: (code) => `${code} aplicat`,
      couponApply: "Aplicar",
      couponDiscount: "Descompte cupó",
      couponPlaceholder: "TEST10",
      couponRemove: "Treure",
      date: "Data",
      deliveryPreferences: "Preferències d'enviament",
      depositDueNow: (amount) => `Paga i senyal ara: ${amount}`,
      disabled: "desactivat",
      emailAddress: "Email",
      emailPass: "Enviar-me el passi per email",
      emailPassDescription:
        "Enviarem el passi de reserva i el rebut a l'email indicat.",
      enabled: "activat",
      experience: "Experiència",
      extras: "Extres",
      fullName: "Nom complet",
      guests: "Persones",
      meetingPoint: "Punt de trobada",
      noExtrasSelected: "No hi ha extres seleccionats.",
      notAccepted: "no acceptades",
      phone: "Telèfon",
      phoneDescription: "Necessari si vols rebre el passi per WhatsApp.",
      preparingPayment: "Preparant pagament segur",
      promotions: "Vull rebre promocions i novetats",
      promotionsDescription:
        "Ofertes ocasionals i novetats de JimBoats. És opcional.",
      remainingBalance: (amount) =>
        `Resta pendent: ${amount} a pagar a bord en efectiu.`,
      securePayment: "Pagament segur",
      selectedExtras: "Extres seleccionats",
      termsAgreement:
        "En pagar la senyal acceptes la política de cancel·lació, els Termes de servei i la Política de privacitat.",
      time: "Hora",
      total: "Total",
      whatsappPass: "Enviar el passi per WhatsApp",
      whatsappPassDescription:
        "Enviarem el passi per WhatsApp al telèfon indicat.",
      yourDetails: "Les teves dades",
    },
    maxAdvanceLabel: "Pots reservar fins amb 6 mesos d'antelació.",
    payment: {
      depositCopy:
        "Paga una senyal fixa de 100 € ara. La resta es paga a bord en efectiu.",
      secureCopy:
        "Stripe processa la teva senyal de manera segura sense sortir d'aquesta pantalla.",
      subtitle: "Estàs a un pas del teu dia al mar.",
      title: "Confirma la teva reserva",
    },
    policies: {
      cancellation: "La política de cancel·lació es confirma abans del pagament.",
      meetingPoint: "Port Olímpic, Barcelona",
      remainingPayment: "La resta es paga a bord en efectiu.",
    },
    steps: {
      confirmation: "Fet",
      experience: "Experiència",
      extras: "Extres",
      payment: "Pagament",
    },
  },
  common: {
    backToJimBoats: "Tornar a JimBoats",
    bookNow: "Reservar",
    contactSupport: "Contactar",
    localeLinks: [
      { href: "/en", label: "EN", locale: "en" },
      { href: "/es", label: "ES", locale: "es" },
      { href: "/ca", label: "CA", locale: "ca" },
    ],
    privacyPolicy: "Política de privacitat",
    termsOfService: "Termes de servei",
  },
  landing: {
    booking: {
      steps: [
        {
          description: "Tria el moment i la data.",
          icon: "calendar",
          title: "Tria",
        },
        {
          description: "Afegeix extres per fer-ho teu.",
          icon: "sparkles",
          title: "Personalitza",
        },
        {
          description: "Ens veiem al port per gaudir.",
          icon: "anchor",
          title: "Navega",
        },
      ],
      title: "Reserva sense complicacions",
    },
    experienceFallbackDescription: "Afegeix un toc especial a bord",
    experienceFallbackDescriptions: {
      "gourmet-snacks": "Gaudeix de mossegades mediterrànies a bord",
      "mediterranean-drinks": "Brinda per la bona vida",
      "paddle-surf": "Llisca sobre aigües tranquil·les",
      "premium-champagne": "Brinda amb xampany premium",
      "private-photographer": "Guarda el dia amb fotos professionals",
      "sunset-toast": "Crea l'ambient perfecte",
    },
    experienceSection: {
      description: "Tria el teu moment perfecte al mar",
      title: "Les nostres experiències",
    },
    finalCta: {
      cta: "Reserva la teva experiència",
      title: "A punt per viure una sortida inoblidable?",
    },
    footer: {
      copyright: "© 2026 JimBoats Charter Barcelona. Tots els drets reservats.",
      description:
        "Xàrters privats premium a Barcelona. Creem records mediterranis inoblidables amb un servei excepcional.",
    },
    gallery: {
      description: "Records reals, capturats al Mediterrani.",
      title: "Moments al mar",
    },
    headerCta: "Reservar",
    hero: {
      cta: "Reserva la teva experiència",
      description:
        "Moments inoblidables al mar, pensats per a viatgers que busquen alguna cosa especial.",
      title: "El capvespre de Barcelona que no oblidaràs",
    },
    navigation: {
      experiences: "Experiències",
      extras: "Extres",
      gallery: "Galeria",
      howItWorks: "Com funciona",
    },
    story: {
      description: "On cada onada explica una història i el temps s'atura.",
      title: "L'ànima de Barcelona des del mar",
    },
    trustItems: [
      { icon: "shield", label: "100% privat" },
      { icon: "star", label: "Valoració 5 estrelles" },
      { icon: "anchor", label: "Port Olímpic" },
      { icon: "headset", label: "Suport 24/7" },
    ],
    upgrades: {
      description: "Extres sensorials per elevar el teu temps al mar.",
      title: "Millores per a la teva experiència",
    },
  },
  metadata: {
    booking: {
      description:
        "Tria una experiència privada en vaixell amb JimBoats, data disponible, extres i pagament de senyal.",
      title: "Reserva una experiència privada en vaixell",
    },
    bookingAccess: {
      title: "Detalls de la reserva",
    },
    bookingReturn: {
      title: "Resultat del pagament de la reserva",
    },
    home: {
      description:
        "Xàrters privats premium a Barcelona per a capvespres, celebracions, propostes i moments mediterranis al mar.",
      ogLocale: "ca_ES",
      title: "Experiències privades en vaixell a Barcelona",
      titleWithBrand: "Experiències privades en vaixell a Barcelona | JimBoats",
    },
  },
  returnPage: {
    bookAnother: "Reservar una altra experiència",
    confirmedDescription:
      "Hem rebut la teva senyal i l'experiència en vaixell està confirmada.",
    confirmedTitle: "Reserva confirmada",
    contactSupport: "Contactar",
    depositPaid: "Senyal pagada",
    experience: "Experiència",
    failedDescription:
      "El checkout no s'ha completat. La teva sortida en vaixell no ha quedat confirmada.",
    failedTitle: "Pagament no completat",
    finalizingDescription:
      "Estem tancant la reserva de manera segura i esperant la confirmació final del pagament.",
    finalizingTitle: "Finalitzant la reserva",
    keepOpen: "Sol trigar uns segons. Mantén aquesta pàgina oberta.",
    missingDescription:
      "No hem trobat cap sessió de checkout per a aquesta pàgina. Contacta amb nosaltres si ja has pagat.",
    missingTitle: "Sessió de checkout no trobada",
    reference: "Referència",
    remainingOnboard: "Resta a bord",
    stillFinalizingDescription:
      "Stripe encara està finalitzant el pagament. Si aquesta pàgina no s'actualitza aviat, contacta amb nosaltres i revisarem la reserva manualment.",
    stillFinalizingTitle: "Seguim finalitzant la reserva",
    willSendPass:
      "Enviarem el passi de reserva i els detalls de pagament a {{ email }}.",
  },
} satisfies PublicDictionary;
