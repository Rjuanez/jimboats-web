import { operator } from "@/content/marketing/catalog";
import type { MarketingLocale } from "@/content/marketing/routes";
import { privacyPages, privacyPath } from "./routes";

const copy: Record<
  MarketingLocale,
  { title: string; description: string; rights: string }
> = {
  es: {
    title: "Tus datos y tu reserva",
    description:
      "{company} utiliza tus datos para tramitar la reserva, el pago y los mensajes del paseo, sobre la base del contrato y de las obligaciones legales aplicables. Intervienen proveedores de alojamiento, pagos y comunicaciones; algunos servicios pueden implicar transferencias internacionales. Consulta los detalles y plazos de conservación en la política. No enviamos publicidad.",
    rights: "Puedes ejercer tus derechos de protección de datos en",
  },
  en: {
    title: "Your data and your booking",
    description:
      "{company} uses your data to manage the booking, payment and trip messages, based on the contract and applicable legal obligations. Hosting, payment and communication providers are involved; some services may involve international transfers. See the policy for details and retention periods. We do not send advertising.",
    rights: "You can exercise your data protection rights at",
  },
  fr: {
    title: "Vos données et votre réservation",
    description:
      "{company} utilise vos données pour gérer la réservation, le paiement et les messages liés à la sortie, sur la base du contrat et des obligations légales applicables. Des prestataires d’hébergement, de paiement et de communication interviennent ; certains services peuvent impliquer des transferts internationaux. Consultez la politique pour les détails et les durées de conservation. Nous n’envoyons pas de publicité.",
    rights:
      "Vous pouvez exercer vos droits de protection des données à l’adresse",
  },
  de: {
    title: "Ihre Daten und Ihre Buchung",
    description:
      "{company} verwendet Ihre Daten zur Abwicklung der Buchung, Zahlung und Nachrichten zur Fahrt auf Grundlage des Vertrags und geltender gesetzlicher Pflichten. Hosting-, Zahlungs- und Kommunikationsanbieter sind beteiligt; manche Dienste können internationale Datenübermittlungen erfordern. Einzelheiten und Aufbewahrungsfristen finden Sie in der Datenschutzerklärung. Wir versenden keine Werbung.",
    rights: "Ihre Datenschutzrechte können Sie über folgende Adresse ausüben:",
  },
  nl: {
    title: "Je gegevens en je boeking",
    description:
      "{company} gebruikt je gegevens voor de boeking, betaling en berichten over de tocht, op basis van de overeenkomst en toepasselijke wettelijke verplichtingen. Aanbieders van hosting, betalingen en communicatie zijn betrokken; sommige diensten kunnen internationale doorgiften meebrengen. Raadpleeg het beleid voor details en bewaartermijnen. We sturen geen reclame.",
    rights: "Je kunt je privacyrechten uitoefenen via",
  },
};

export function getBookingPrivacyNotice(locale: MarketingLocale | "ca") {
  const language = locale === "ca" ? "es" : locale;
  return {
    ...copy[language],
    description: copy[language].description.replace(
      "{company}",
      operator.legalName,
    ),
    email: operator.email,
    href: privacyPath(locale),
    label: privacyPages[language].label,
  };
}
