import type { MarketingLocale } from "../marketing/routes";

type CancellationCopy = {
  question: string;
  cancellation: string;
  weatherQuestion: string;
  weather: string;
  noShow: string;
  refund: string;
};

const copy = {
  es: {
    question: "¿Puedo cancelar mi reserva sin coste?",
    cancellation:
      "Puedes cancelar sin coste por WhatsApp o correo electrónico con al menos 48 horas de antelación. Con menos de 48 horas, los importes abonados no se reembolsan según nuestra política de cancelación. Podemos estudiar tu caso por WhatsApp.",
    weatherQuestion: "¿Qué pasa si JimBoats cancela la salida?",
    weather:
      "Si JimBoats cancela la salida por cualquier motivo, te devuelve todo lo abonado. Si cancela por malas condiciones, el capitán contactará contigo.",
    noShow:
      "Si no te presentas a la salida, no se reembolsa el importe abonado. Estas condiciones respetan los derechos que te reconoce la normativa aplicable.",
    refund:
      "Cuando corresponda un reembolso, lo tramitamos el mismo día de la cancelación por el medio de pago original. El tiempo que tarde en reflejarse depende de la entidad bancaria y del medio de pago.",
  },
  en: {
    question: "Can I cancel my booking free of charge?",
    cancellation:
      "You can cancel free of charge by WhatsApp or email at least 48 hours before departure. Our cancellation policy provides for no refund of amounts paid when you cancel less than 48 hours before departure. We can review your case over WhatsApp.",
    weatherQuestion: "What happens if JimBoats cancels the trip?",
    weather:
      "If JimBoats cancels the trip for any reason, we refund everything you paid. If we cancel due to poor conditions, the skipper will contact you.",
    noShow:
      "If you miss the departure, we do not refund the amount paid. Your statutory rights apply.",
    refund:
      "When a refund is due, we process it on the day of cancellation using the original payment method. The time it takes to appear in your account depends on the bank and payment method.",
  },
  fr: {
    question: "Puis-je annuler ma réservation sans frais ?",
    cancellation:
      "Vous pouvez annuler sans frais par WhatsApp ou par e-mail au moins 48 heures avant le départ. En cas d’annulation moins de 48 heures avant le départ, les sommes versées ne sont pas remboursées selon notre politique d’annulation. Nous pouvons examiner votre demande par WhatsApp.",
    weatherQuestion: "Que se passe-t-il si JimBoats annule la sortie ?",
    weather:
      "Si JimBoats annule la sortie, quel qu’en soit le motif, nous remboursons la totalité des sommes versées. En cas d’annulation liée aux conditions, le skipper vous contactera.",
    noShow:
      "Si vous ne vous présentez pas au départ, les sommes versées ne sont pas remboursées. Vos droits légaux restent applicables.",
    refund:
      "Lorsqu’un remboursement est dû, nous le traitons le jour de l’annulation via le moyen de paiement initial. Le délai de réception dépend de la banque et du moyen de paiement.",
  },
  de: {
    question: "Kann ich meine Buchung kostenlos stornieren?",
    cancellation:
      "Du kannst mindestens 48 Stunden vor der Abfahrt kostenlos per WhatsApp oder E-Mail stornieren. Bei einer Stornierung weniger als 48 Stunden vor der Abfahrt werden bereits gezahlte Beträge gemäß unseren Stornierungsbedingungen nicht erstattet. Wir können deinen Fall per WhatsApp prüfen.",
    weatherQuestion: "Was passiert, wenn JimBoats die Ausfahrt absagt?",
    weather:
      "Wenn JimBoats die Ausfahrt absagt, erstatten wir unabhängig vom Grund alle gezahlten Beträge. Bei einer Absage wegen schlechter Bedingungen meldet sich der Skipper bei dir.",
    noShow:
      "Wenn du zur Abfahrt nicht erscheinst, erstatten wir den gezahlten Betrag nicht. Deine gesetzlichen Rechte gelten weiterhin.",
    refund:
      "Erstattungen veranlassen wir am Tag der Stornierung über die ursprüngliche Zahlungsmethode. Wann der Betrag gutgeschrieben wird, hängt von der Bank und der Zahlungsmethode ab.",
  },
  nl: {
    question: "Kan ik mijn boeking gratis annuleren?",
    cancellation:
      "Je kunt minstens 48 uur voor vertrek kosteloos annuleren via WhatsApp of e-mail. Bij annulering minder dan 48 uur voor vertrek betalen we volgens ons annuleringsbeleid de betaalde bedragen niet terug. We kunnen je situatie via WhatsApp bekijken.",
    weatherQuestion: "Wat gebeurt er als JimBoats de tocht annuleert?",
    weather:
      "Als JimBoats de tocht annuleert, krijg je het volledige betaalde bedrag terug, ongeacht de reden. Bij annulering vanwege slechte omstandigheden neemt de schipper contact met je op.",
    noShow:
      "Als je niet verschijnt voor vertrek, krijg je het betaalde bedrag niet terug. Je wettelijke rechten blijven gelden.",
    refund:
      "Als je recht hebt op terugbetaling, verwerken we die op de dag van annulering via de oorspronkelijke betaalmethode. Wanneer het bedrag zichtbaar is, hangt af van de bank en betaalmethode.",
  },
  ca: {
    question: "Puc cancel·lar la reserva sense cost?",
    cancellation:
      "Pots cancel·lar sense cost per WhatsApp o correu electrònic amb almenys 48 hores d’antelació. Amb menys de 48 hores, els imports abonats no es reemborsen d’acord amb la nostra política de cancel·lació. Podem estudiar el teu cas per WhatsApp.",
    weatherQuestion: "Què passa si JimBoats cancel·la la sortida?",
    weather:
      "Si JimBoats cancel·la la sortida per qualsevol motiu, et retorna tot el que has pagat. Si cancel·la per males condicions, el capità es posarà en contacte amb tu.",
    noShow:
      "Si no et presentes a la sortida, no es retorna l’import abonat. Els teus drets legals continuen sent aplicables.",
    refund:
      "Quan correspongui un reemborsament, el tramitem el mateix dia de la cancel·lació pel mitjà de pagament original. El temps que trigui a reflectir-se depèn de l’entitat bancària i del mitjà de pagament.",
  },
} satisfies Record<MarketingLocale | "ca", CancellationCopy>;

function withSummary(text: CancellationCopy) {
  return {
    ...text,
    summary: [text.cancellation, text.noShow, text.weather].join(" "),
  };
}

// New bookings retain the cancellation policy version and text in their snapshot.
export const cancellationPolicy = {
  id: "jimboats-static-cancellation",
  version: 2,
  confirmedAt: "2026-11-07",
  freeCancellationHoursBeforeDeparture: 48,
  copy: {
    es: withSummary(copy.es),
    en: withSummary(copy.en),
    fr: withSummary(copy.fr),
    de: withSummary(copy.de),
    nl: withSummary(copy.nl),
    ca: withSummary(copy.ca),
  },
};
