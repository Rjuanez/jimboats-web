import type { MarketingLocale } from "./routes";

// Checked in the public production booking flow on 2026-11-02 for all four
// experiences: paddle adds EUR 20 to the booking total. The other two extras
// are advertised on the homepage but are not offered in that booking flow.
export const productionExtraPrices = [null, 2000, null] as const;

const es = {
  title: "Elige tu experiencia. Ten claro el precio.",
  intro:
    "Compara las cuatro experiencias y añade los detalles que hagan vuestra salida especial.",
  allRates: "Ver todas las tarifas por horas",
  duration: "Horas",
  dayTrip: "Paseo diurno",
  twilight: "Amanecer / atardecer",
  romantic: "Romántico",
  unavailable: "No disponible",
  experiences: "Experiencias",
  extras: "Extras a bordo",
  guests: "Personas",
  price: "Desde",
  extra: "Extra",
  description: "Qué añade",
  supplement: "Suplemento",
  boatNote:
    "Los precios incluyen patrón, combustible y seguro. No hace falta licencia. Puedes ampliar la salida según disponibilidad hasta 4 horas en la experiencia romántica y hasta 6 en las demás. La experiencia romántica incluye la decoración de las fotos.",
  extrasNote:
    "Los extras se añaden al precio del barco. Consulta su disponibilidad para tu salida.",
  perBooking: "por reserva",
  consult: "Consultar precio",
};
export const pricingCopy: Record<MarketingLocale, typeof es> = {
  es,
  en: {
    title: "Choose your experience. Know the price.",
    intro:
      "Compare the four experiences and add the little details that make your trip special.",
    allRates: "See all hourly prices",
    duration: "Hours",
    dayTrip: "Day trip",
    twilight: "Sunrise / sunset",
    romantic: "Romantic",
    unavailable: "Unavailable",
    experiences: "Experiences",
    extras: "Extras on board",
    guests: "Guests",
    price: "From",
    extra: "Extra",
    description: "What it adds",
    supplement: "Supplement",
    boatNote:
      "Prices include skipper, fuel and insurance. No licence is needed. Subject to availability, trips can be extended up to 4 hours for the romantic experience and 6 hours for the others. The romantic experience includes the decorations shown in the photos.",
    extrasNote:
      "Extras are added to the boat price. Ask about availability for your trip.",
    perBooking: "per booking",
    consult: "Ask for a price",
  },
  fr: {
    title: "Choisissez votre expérience. Comparez les tarifs.",
    intro:
      "Comparez les quatre expériences et ajoutez les détails qui rendront votre sortie unique.",
    allRates: "Voir tous les tarifs par durée",
    duration: "Durée",
    dayTrip: "En journée",
    twilight: "Lever / coucher du soleil",
    romantic: "Romantique",
    unavailable: "Indisponible",
    experiences: "Expériences",
    extras: "Extras à bord",
    guests: "Passagers",
    price: "À partir de",
    extra: "Extra",
    description: "Le petit plus",
    supplement: "Supplément",
    boatNote:
      "Les prix comprennent le skipper, le carburant et l’assurance. Aucun permis n’est nécessaire. Selon disponibilité, vous pouvez prolonger jusqu’à 4 heures pour l’expérience romantique et 6 heures pour les autres. L’expérience romantique comprend la décoration des photos.",
    extrasNote:
      "Les extras s’ajoutent au prix du bateau. Demandez leur disponibilité pour votre sortie.",
    perBooking: "par réservation",
    consult: "Demander un tarif",
  },
  de: {
    title: "Dein Erlebnis. Der Preis im Überblick.",
    intro:
      "Vergleiche die vier Erlebnisse und ergänze die Details, die euren Ausflug besonders machen.",
    allRates: "Alle Preise nach Dauer ansehen",
    duration: "Dauer",
    dayTrip: "Tagestour",
    twilight: "Sonnenaufgang / Sonnenuntergang",
    romantic: "Zu zweit",
    unavailable: "Nicht verfügbar",
    experiences: "Erlebnisse",
    extras: "Extras an Bord",
    guests: "Personen",
    price: "Ab",
    extra: "Extra",
    description: "Das gewisse Extra",
    supplement: "Aufpreis",
    boatNote:
      "Die Preise beinhalten Skipper, Treibstoff und Versicherung. Ein Bootsführerschein ist nicht nötig. Je nach Verfügbarkeit sind Verlängerungen bis zu 4 Stunden für die romantische Fahrt und bis zu 6 Stunden für die anderen Erlebnisse möglich. Die romantische Fahrt beinhaltet die Dekoration auf den Fotos.",
    extrasNote:
      "Extras kommen zum Bootspreis hinzu. Fragt nach der Verfügbarkeit für euren Ausflug.",
    perBooking: "pro Buchung",
    consult: "Preis anfragen",
  },
  nl: {
    title: "Kies je ervaring. Vergelijk de prijzen.",
    intro:
      "Vergelijk de vier ervaringen en voeg de details toe die jullie tocht bijzonder maken.",
    allRates: "Bekijk alle prijzen per duur",
    duration: "Duur",
    dayTrip: "Overdag",
    twilight: "Zonsopkomst / zonsondergang",
    romantic: "Romantisch",
    unavailable: "Niet beschikbaar",
    experiences: "Ervaringen",
    extras: "Extra’s aan boord",
    guests: "Personen",
    price: "Vanaf",
    extra: "Extra",
    description: "Wat het toevoegt",
    supplement: "Toeslag",
    boatNote:
      "De prijzen zijn inclusief schipper, brandstof en verzekering. Een vaarbewijs is niet nodig. Afhankelijk van beschikbaarheid kun je verlengen tot 4 uur voor de romantische ervaring en 6 uur voor de overige tochten. De romantische ervaring is inclusief de decoratie op de foto’s.",
    extrasNote:
      "Extra’s komen boven op de bootprijs. Vraag naar de beschikbaarheid voor jullie tocht.",
    perBooking: "per boeking",
    consult: "Vraag een prijs aan",
  },
};
