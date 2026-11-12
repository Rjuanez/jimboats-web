import type { MarketingLocale } from "@/content/marketing/routes";

type BookingPrivacyCopy = {
  title: string;
  description: string;
  accept: string;
  reject: string;
  privacy: string;
  preferences: string;
  necessary: string;
  necessaryDescription: string;
  alwaysActive: string;
  advertising: string;
  advertisingDescription: string;
  provider: string;
  save: string;
  back: string;
  saveError: string;
};

export const bookingPrivacyCopy: Record<MarketingLocale, BookingPrivacyCopy> = {
  es: {
    title: "Tu privacidad",
    description:
      "En JimBoats usamos cookies y tecnologías similares para que la web funcione y, con tu permiso, medir nuestros anuncios con plataformas externas. Puedes aceptar, rechazar o configurar tus preferencias.",
    accept: "Aceptar",
    reject: "Rechazar",
    privacy: "Política de privacidad",
    preferences: "Preferencias de privacidad",
    necessary: "Necesarias",
    necessaryDescription:
      "Permiten gestionar la reserva, el pago y recordar tu elección de privacidad.",
    alwaysActive: "Siempre activas",
    advertising: "Medición publicitaria",
    advertisingDescription:
      "Permite relacionar un anuncio con tu reserva y el importe pagado, o con un clic en WhatsApp durante la reserva. No compartimos tu nombre, email ni teléfono para esta medición. Puedes reservar sin activarla.",
    provider: "Plataforma: OpenAI (ChatGPT Ads).",
    save: "Guardar preferencias",
    back: "Volver",
    saveError: "No hemos podido guardar tu elección. Inténtalo de nuevo; puedes seguir reservando.",
  },
  en: {
    title: "Your privacy",
    description:
      "JimBoats uses cookies and similar technologies to make the website work and, with your permission, measure our ads with external platforms. You can accept, reject or customise your preferences.",
    accept: "Accept",
    reject: "Reject",
    privacy: "Privacy policy",
    preferences: "Privacy preferences",
    necessary: "Necessary",
    necessaryDescription:
      "Enable bookings, payments and remembering your privacy choice.",
    alwaysActive: "Always active",
    advertising: "Advertising measurement",
    advertisingDescription:
      "Links an ad to your booking and the amount paid, or to a WhatsApp click during booking. We do not share your name, email or phone number for this measurement. You can book without enabling it.",
    provider: "Platform: OpenAI (ChatGPT Ads).",
    save: "Save preferences",
    back: "Back",
    saveError: "We could not save your choice. Please try again; you can continue booking.",
  },
  fr: {
    title: "Votre confidentialité",
    description:
      "JimBoats utilise des cookies et des technologies similaires pour faire fonctionner le site et, avec votre accord, mesurer nos publicités avec des plateformes externes. Vous pouvez accepter, refuser ou personnaliser vos préférences.",
    accept: "Accepter",
    reject: "Refuser",
    privacy: "Politique de confidentialité",
    preferences: "Préférences de confidentialité",
    necessary: "Nécessaires",
    necessaryDescription:
      "Permettent de gérer la réservation, le paiement et de mémoriser votre choix de confidentialité.",
    alwaysActive: "Toujours actifs",
    advertising: "Mesure publicitaire",
    advertisingDescription:
      "Permet de relier une publicité à votre réservation et au montant payé, ou à un clic sur WhatsApp pendant la réservation. Nous ne partageons ni votre nom, ni votre e-mail, ni votre téléphone pour cette mesure. Vous pouvez réserver sans l’activer.",
    provider: "Plateforme : OpenAI (ChatGPT Ads).",
    save: "Enregistrer les préférences",
    back: "Retour",
    saveError: "Votre choix n’a pas pu être enregistré. Réessayez ; vous pouvez continuer à réserver.",
  },
  de: {
    title: "Deine Privatsphäre",
    description:
      "JimBoats verwendet Cookies und ähnliche Technologien für den Betrieb der Website und, mit deiner Zustimmung, zur Messung unserer Werbung über externe Plattformen. Du kannst zustimmen, ablehnen oder deine Einstellungen anpassen.",
    accept: "Akzeptieren",
    reject: "Ablehnen",
    privacy: "Datenschutzerklärung",
    preferences: "Datenschutzeinstellungen",
    necessary: "Notwendig",
    necessaryDescription:
      "Ermöglichen Buchung und Zahlung und speichern deine Datenschutzauswahl.",
    alwaysActive: "Immer aktiv",
    advertising: "Werbemessung",
    advertisingDescription:
      "Verknüpft eine Anzeige mit deiner Buchung und dem gezahlten Betrag oder einem WhatsApp-Klick während der Buchung. Dafür teilen wir weder deinen Namen noch deine E-Mail-Adresse oder Telefonnummer. Du kannst auch ohne Zustimmung buchen.",
    provider: "Plattform: OpenAI (ChatGPT Ads).",
    save: "Einstellungen speichern",
    back: "Zurück",
    saveError: "Deine Auswahl konnte nicht gespeichert werden. Versuche es erneut; du kannst weiter buchen.",
  },
  nl: {
    title: "Je privacy",
    description:
      "JimBoats gebruikt cookies en vergelijkbare technologieën om de website te laten werken en, met jouw toestemming, onze advertenties via externe platforms te meten. Je kunt accepteren, weigeren of je voorkeuren aanpassen.",
    accept: "Accepteren",
    reject: "Weigeren",
    privacy: "Privacybeleid",
    preferences: "Privacyvoorkeuren",
    necessary: "Noodzakelijk",
    necessaryDescription:
      "Maken reserveringen en betalingen mogelijk en onthouden je privacykeuze.",
    alwaysActive: "Altijd actief",
    advertising: "Advertentiemeting",
    advertisingDescription:
      "Koppelt een advertentie aan je reservering en het betaalde bedrag, of aan een WhatsApp-klik tijdens het reserveren. Hiervoor delen we niet je naam, e-mailadres of telefoonnummer. Je kunt reserveren zonder dit in te schakelen.",
    provider: "Platform: OpenAI (ChatGPT Ads).",
    save: "Voorkeuren opslaan",
    back: "Terug",
    saveError: "Je keuze kon niet worden opgeslagen. Probeer het opnieuw; je kunt verder reserveren.",
  },
};
