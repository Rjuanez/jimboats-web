import translations from "./bookingTranslations.json";
import { enPublicDictionary } from "./en";
import type { PublicDictionary } from "./types";

export function translatedBookingDictionary(
  locale: "fr" | "de" | "nl",
): PublicDictionary {
  const copy = translations[locale];
  const format = (template: string) => (value: string | number) =>
    template.replace("{value}", String(value));
  const common = {
    fr: [
      "Retour à JimBoats",
      "Réserver",
      "Contacter",
      "Confidentialité",
      "Conditions d’utilisation",
      "Payé en ligne",
      "Solde à bord",
      "Nouvelle réservation",
    ],
    de: [
      "Zurück zu JimBoats",
      "Buchen",
      "Kontakt",
      "Datenschutz",
      "Nutzungsbedingungen",
      "Online bezahlt",
      "Restbetrag an Bord",
      "Weitere Buchung",
    ],
    nl: [
      "Terug naar JimBoats",
      "Boeken",
      "Contact",
      "Privacybeleid",
      "Gebruiksvoorwaarden",
      "Online betaald",
      "Restant aan boord",
      "Opnieuw boeken",
    ],
  }[locale];
  // Only checkout consumes these locales; legacy access/return pages retain their supported locales.
  return {
    ...enPublicDictionary,
    common: {
      ...enPublicDictionary.common,
      backToJimBoats: common[0],
      bookNow: common[1],
      contactSupport: common[2],
      privacyPolicy: common[3],
      termsOfService: common[4],
    },
    returnPage: {
      ...enPublicDictionary.returnPage,
      depositPaid: common[5],
      remainingOnboard: common[6],
      bookAnother: common[7],
    },
    booking: {
      ...copy,
      bottomBar: {
        ...copy.bottomBar,
        remainingOnboard: format(copy.bottomBar.remainingOnboard),
      },
      labels: {
        ...copy.labels,
        capacity: format(copy.labels.capacity),
        couponApplied: format(copy.labels.couponApplied),
        depositDueNow: format(copy.labels.depositDueNow),
        remainingBalance: format(copy.labels.remainingBalance),
      },
    },
  };
}
