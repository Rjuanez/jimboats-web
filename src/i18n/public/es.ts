import type { PublicDictionary } from "./types";

export const esPublicDictionary = {
  access: {
    bookingPrefix: "Reserva",
    buyerPrefix: "Cliente:",
    cancellationFallback: "Esta reserva no tiene política de cancelación asociada.",
    cancellationPolicyTitle: "Política de cancelación",
    contactBody: (email) =>
      `Usaremos ${email} para enviarte actualizaciones de la reserva.`,
    contactSupport: "Contactar",
    dateAndTime: "Fecha y hora",
    depositOutcome: {
      FULL_REFUND: "La señal se puede reembolsar por completo.",
      MANUAL_REVIEW: "La cancelación requiere revisión manual.",
      NO_REFUND: "La señal no es reembolsable.",
      PARTIAL_REFUND: "La señal se puede reembolsar parcialmente.",
    },
    depositPaid: "Señal pagada",
    detailsDescription:
      "Aquí tienes los detalles de tu reserva, el resumen de pago y la política de cancelación.",
    extras: "Extras",
    guests: "Personas",
    invalidDescription:
      "Este enlace falta, ha caducado o ya no coincide con una reserva activa.",
    invalidTitle: "Enlace de reserva no disponible",
    noExtras: "No hay extras seleccionados para esta reserva.",
    payment: "Pago",
    remainingOnboard: "Resto a bordo",
    status: "Estado",
    statusLabels: {
      CANCELLED: "Cancelada",
      CONFIRMED: "Confirmada",
      EXPIRED: "Caducada",
      PAYMENT_FAILED: "Pago fallido",
      PENDING_PAYMENT: "Pago pendiente",
    },
    total: "Total",
    version: "versión",
  },
  booking: {
    actions: {
      continueToExtras: "Continuar a extras",
      continueToPayment: "Continuar al pago",
    },
    bottomBar: {
      chooseDateAndTime: "Elige fecha y hora",
      continue: "Continuar",
      depositDueNow: "Señal ahora",
      openingPayment: "Abriendo pago",
      payDeposit: "Pagar señal",
      remainingOnboard: (amount) => `${amount} restantes a bordo en efectivo.`,
      selectExperience: "Selecciona una experiencia para empezar",
      total: "Total",
    },
    confirmation: {
      bookingReference: "JB-MOCK-2026",
      subtitle:
        "Tu pase de reserva de prueba está listo. En producción esta pantalla mostrará el token real y el recibo de pago.",
      title: "Reserva confirmada",
    },
    errors: {
      invalidGuests: "Elige un número válido de personas para esta experiencia.",
      missingCustomer: "Añade tu nombre y email antes de confirmar.",
      missingDeliveryChannel: "Elige al menos un canal para recibir el pase.",
      missingWhatsappPhone: "Añade un teléfono para recibir el pase por WhatsApp.",
    },
    experienceStep: {
      availableDates: "Fechas disponibles",
      availabilityError:
        "No se ha podido cargar la disponibilidad. Prueba a cambiar de experiencia o refrescar la página.",
      availabilityLoading: "Cargando fechas disponibles...",
      dateDesktopTitle: "Elige tu fecha",
      dateMobileTitle: "Elige fecha",
      departureTimesUnavailable: "No hay horarios disponibles para esta fecha.",
      desktopTitle: "Elige experiencia y fecha",
      emptyExperiences: "Ahora mismo no hay experiencias reservables.",
      experienceDesktopTitle: "Elige tu experiencia",
      experienceMobileTitle: "Elige experiencia",
      from: "Desde",
      mobileTitle: "Elige tu experiencia",
      nextMonth: "Mes siguiente",
      previousMonth: "Mes anterior",
      selectAvailableDate: "Selecciona una de las fechas disponibles.",
      subtitle: "Encuentra el momento perfecto para tu día en el mar.",
      timeDesktopTitle: "Elige tu hora",
      timeMobileTitle: "Elige hora",
    },
    extrasStep: {
      add: "Añadir",
      emptyExtras: "No hay extras disponibles para esta salida.",
      remove: "Quitar",
      selectionTitle: "Extras disponibles",
      skip: "Saltar extras y continuar",
      subtitle: "Añade algunos detalles para hacer tu salida aún más especial.",
      title: "Hazlo a tu manera",
    },
    footer: {
      legalLabel: "Enlaces legales de reserva",
      needHelp: "¿Necesitas ayuda?",
    },
    header: {
      backHome: "Volver al inicio",
      closeLabel: "Cerrar reserva y volver a JimBoats",
      navExperiences: "Experiencias",
      navHowItWorks: "Cómo funciona",
      navLabel: "Enlaces de la página de reserva",
      navReviews: "Opiniones",
      secure: "Seguro",
    },
    labels: {
      accepted: "aceptadas",
      back: "Atrás",
      bookingSummary: "Resumen de reserva",
      bookingPass: "Pase de reserva",
      cancellation: "Cancelación",
      cancellationPolicy: "Política de cancelación",
      capacity: (capacity) => `Capacidad de esta experiencia: ${capacity}.`,
      coupon: "Cupón",
      couponApplied: (code) => `${code} aplicado`,
      couponApply: "Aplicar",
      couponDiscount: "Descuento cupón",
      couponPlaceholder: "TEST10",
      couponRemove: "Quitar",
      date: "Fecha",
      deliveryPreferences: "Preferencias de envío",
      depositDueNow: (amount) => `Señal a pagar ahora: ${amount}`,
      disabled: "desactivado",
      emailAddress: "Email",
      emailPass: "Enviarme el pase por email",
      emailPassDescription:
        "Enviaremos el pase de reserva y el recibo al email indicado.",
      enabled: "activado",
      experience: "Experiencia",
      extras: "Extras",
      fullName: "Nombre completo",
      guests: "Personas",
      meetingPoint: "Punto de encuentro",
      noExtrasSelected: "No hay extras seleccionados.",
      notAccepted: "no aceptadas",
      phone: "Teléfono",
      phoneDescription: "Necesario si quieres recibir el pase por WhatsApp.",
      preparingPayment: "Preparando pago seguro",
      promotions: "Quiero recibir promociones y novedades",
      promotionsDescription:
        "Ofertas ocasionales y novedades de JimBoats. Es opcional.",
      remainingBalance: (amount) =>
        `Resto pendiente: ${amount} a pagar a bordo en efectivo.`,
      securePayment: "Pago seguro",
      selectedExtras: "Extras seleccionados",
      termsAgreement:
        "Al pagar la señal aceptas la política de cancelación, los Términos de servicio y la Política de privacidad.",
      time: "Hora",
      total: "Total",
      whatsappPass: "Enviar el pase por WhatsApp",
      whatsappPassDescription:
        "Enviaremos el pase por WhatsApp al teléfono indicado.",
      yourDetails: "Tus datos",
    },
    maxAdvanceLabel: "Puedes reservar hasta con 6 meses de antelación.",
    payment: {
      depositCopy:
        "Paga una señal fija de 100 € ahora. El resto se paga a bordo en efectivo.",
      secureCopy:
        "Stripe procesa tu señal de forma segura sin salir de esta pantalla.",
      subtitle: "Estás a un paso de tu día en el mar.",
      title: "Confirma tu reserva",
    },
    policies: {
      cancellation: "La política de cancelación se confirma antes del pago.",
      meetingPoint: "Port Olímpic, Barcelona",
      remainingPayment: "El resto se paga a bordo en efectivo.",
    },
    steps: {
      confirmation: "Listo",
      experience: "Experiencia",
      extras: "Extras",
      payment: "Pago",
    },
  },
  common: {
    backToJimBoats: "Volver a JimBoats",
    bookNow: "Reservar",
    contactSupport: "Contactar",
    localeLinks: [
      { href: "/en", label: "EN", locale: "en" },
      { href: "/es", label: "ES", locale: "es" },
      { href: "/ca", label: "CA", locale: "ca" },
    ],
    privacyPolicy: "Política de privacidad",
    termsOfService: "Términos de servicio",
  },
  landing: {
    booking: {
      steps: [
        {
          description: "Elige tu momento y la fecha.",
          icon: "calendar",
          title: "Elige",
        },
        {
          description: "Añade extras para hacerlo tuyo.",
          icon: "sparkles",
          title: "Personaliza",
        },
        {
          description: "Nos vemos en el puerto para disfrutar.",
          icon: "anchor",
          title: "Navega",
        },
      ],
      title: "Reserva sin complicaciones",
    },
    experienceFallbackDescription: "Añade un toque especial a bordo",
    experienceFallbackDescriptions: {
      "gourmet-snacks": "Disfruta de bocados mediterráneos a bordo",
      "mediterranean-drinks": "Brinda por la buena vida",
      "paddle-surf": "Deslízate sobre aguas tranquilas",
      "premium-champagne": "Brinda con champán premium",
      "private-photographer": "Guarda el día con fotos profesionales",
      "sunset-toast": "Crea el ambiente perfecto",
    },
    experienceSection: {
      description: "Elige tu momento perfecto en el mar",
      title: "Nuestras experiencias",
    },
    finalCta: {
      cta: "Reserva tu experiencia",
      title: "¿Listo para vivir una salida inolvidable?",
    },
    footer: {
      copyright: "© 2026 JimBoats Charter Barcelona. Todos los derechos reservados.",
      description:
        "Charters privados premium en Barcelona. Creamos recuerdos mediterráneos inolvidables con un servicio excepcional.",
    },
    gallery: {
      description: "Recuerdos reales, capturados en el Mediterráneo.",
      title: "Momentos en el mar",
    },
    headerCta: "Reservar",
    hero: {
      cta: "Reserva tu experiencia",
      description:
        "Momentos inolvidables en el mar, pensados para viajeros que buscan algo especial.",
      title: "El atardecer de Barcelona que no olvidarás",
    },
    navigation: {
      experiences: "Experiencias",
      extras: "Extras",
      gallery: "Galería",
      howItWorks: "Cómo funciona",
    },
    story: {
      description: "Donde cada ola cuenta una historia y el tiempo se detiene.",
      title: "El alma de Barcelona desde el mar",
    },
    trustItems: [
      { icon: "shield", label: "100% privado" },
      { icon: "star", label: "Valoración 5 estrellas" },
      { icon: "anchor", label: "Port Olímpic" },
      { icon: "headset", label: "Soporte 24/7" },
    ],
    upgrades: {
      description: "Extras sensoriales para elevar tu tiempo en el mar.",
      title: "Mejoras para tu experiencia",
    },
  },
  metadata: {
    booking: {
      description:
        "Elige una experiencia privada en barco con JimBoats, fecha disponible, extras y pago de señal.",
      title: "Reserva una experiencia privada en barco",
    },
    bookingAccess: {
      title: "Detalles de la reserva",
    },
    bookingReturn: {
      title: "Resultado del pago de la reserva",
    },
    home: {
      description:
        "Charters privados premium en Barcelona para atardeceres, celebraciones, pedidas y momentos mediterráneos en el mar.",
      ogLocale: "es_ES",
      title: "Experiencias privadas en barco en Barcelona",
      titleWithBrand: "Experiencias privadas en barco en Barcelona | JimBoats",
    },
  },
  returnPage: {
    bookAnother: "Reservar otra experiencia",
    confirmedDescription:
      "Hemos recibido tu señal y tu experiencia en barco está confirmada.",
    confirmedTitle: "Reserva confirmada",
    contactSupport: "Contactar",
    depositPaid: "Señal pagada",
    experience: "Experiencia",
    failedDescription:
      "El checkout no se completó. Tu salida en barco no ha quedado confirmada.",
    failedTitle: "Pago no completado",
    finalizingDescription:
      "Estamos cerrando tu reserva de forma segura y esperando la confirmación final del pago.",
    finalizingTitle: "Finalizando tu reserva",
    keepOpen: "Suele tardar unos segundos. Mantén esta página abierta.",
    missingDescription:
      "No hemos encontrado una sesión de checkout para esta página. Contacta con nosotros si ya has pagado.",
    missingTitle: "Sesión de checkout no encontrada",
    reference: "Referencia",
    remainingOnboard: "Resto a bordo",
    stillFinalizingDescription:
      "Stripe todavía está finalizando el pago. Si esta página no se actualiza pronto, contacta con nosotros y revisaremos la reserva manualmente.",
    stillFinalizingTitle: "Seguimos finalizando tu reserva",
    willSendPass:
      "Enviaremos el pase de reserva y los detalles de pago a {{ email }}.",
  },
} satisfies PublicDictionary;
