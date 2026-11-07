import type { MarketingLocale } from "./routes";

type PremiumCopy = {
  story: string;
  gallery: string;
  galleryDescription: string;
  galleryAlts: string[];
  extras: string;
  extraNames: string[];
  extraDescriptions: string[];
  final: string;
};

export const premiumCopy: Record<MarketingLocale, PremiumCopy> = {
  es: {
    extraDescriptions: [
      "Vuela sobre el Mediterráneo.",
      "Disfruta del mar a tu ritmo.",
      "Llévate el recuerdo en imágenes.",
    ],
    story: "El alma de Barcelona, desde el mar.",
    gallery: "Momentos que se quedan contigo.",
    galleryDescription:
      "La luz, la brisa y los tuyos. Así se vive Barcelona a bordo.",
    galleryAlts: [
      "Dos pasajeros disfrutando de la navegación a bordo",
      "Tres pasajeras en el barco junto a los veleros del puerto",
      "Dos pasajeros saltando al mar desde el barco",
      "Dos pasajeras a bordo con la costa de Barcelona al fondo",
      "Un grupo compartiendo un aperitivo bajo el toldo del barco",
    ],
    extras: "Los pequeños detalles hacen el viaje.",
    extraNames: ["eFoil", "Paddle surf", "Fotógrafo"],
    final: "El próximo recuerdo empieza en el mar.",
  },
  en: {
    extraDescriptions: [
      "Fly above the Mediterranean.",
      "Enjoy the sea at your own pace.",
      "Take your memories home in pictures.",
    ],
    story: "The soul of Barcelona, from the sea.",
    gallery: "Moments that stay with you.",
    galleryDescription:
      "The light, the sea breeze and your favourite people. Barcelona, from on board.",
    galleryAlts: [
      "Two guests enjoying the sailing trip on board",
      "Three guests on the boat beside the sailboats in the marina",
      "Two guests jumping into the sea from the boat",
      "Two guests on board with the Barcelona coastline behind them",
      "A group sharing snacks under the boat canopy",
    ],
    extras: "Little details. Lasting memories.",
    extraNames: ["eFoil", "Paddle surfing", "Photographer"],
    final: "Your next memory starts at sea.",
  },
  fr: {
    extraDescriptions: [
      "Survolez la Méditerranée.",
      "Profitez de la mer à votre rythme.",
      "Gardez vos souvenirs en images.",
    ],
    story: "L’âme de Barcelone, vue de la mer.",
    gallery: "Des instants qui restent.",
    galleryDescription:
      "La lumière, la brise et vos proches. Barcelone se découvre aussi à bord.",
    galleryAlts: [
      "Deux passagers profitant de la navigation à bord",
      "Trois passagères à bord près des voiliers du port",
      "Deux passagers sautant du bateau dans la mer",
      "Deux passagères à bord avec la côte de Barcelone en arrière-plan",
      "Un groupe partageant un apéritif sous le taud du bateau",
    ],
    extras: "Les petits détails font les beaux souvenirs.",
    extraNames: ["eFoil", "Paddle", "Photographe"],
    final: "Votre prochain souvenir commence en mer.",
  },
  de: {
    extraDescriptions: [
      "Schwebt über dem Mittelmeer.",
      "Genießt das Meer in eurem Tempo.",
      "Nehmt eure Erinnerungen als Bilder mit.",
    ],
    story: "Barcelonas Seele. Vom Meer aus.",
    gallery: "Augenblicke, die bleiben.",
    galleryDescription:
      "Das Licht, die Meeresbrise und eure Lieblingsmenschen. So erlebt ihr Barcelona an Bord.",
    galleryAlts: [
      "Zwei Gäste genießen die Fahrt an Bord",
      "Drei Gäste an Bord neben den Segelbooten im Hafen",
      "Zwei Gäste springen vom Boot ins Meer",
      "Zwei Gäste an Bord mit Barcelonas Küste im Hintergrund",
      "Eine Gruppe teilt Snacks unter dem Sonnendach des Bootes",
    ],
    extras: "Kleine Details. Besondere Erinnerungen.",
    extraNames: ["eFoil", "Stand-up-Paddling", "Fotograf"],
    final: "Eure nächste Erinnerung beginnt auf dem Meer.",
  },
  nl: {
    extraDescriptions: [
      "Vlieg boven de Middellandse Zee.",
      "Geniet van de zee op jouw tempo.",
      "Neem je herinneringen mee in beelden.",
    ],
    story: "De ziel van Barcelona, vanaf zee.",
    gallery: "Momenten die je bijblijven.",
    galleryDescription:
      "Het licht, de zeebries en je favoriete mensen. Zo beleef je Barcelona aan boord.",
    galleryAlts: [
      "Twee gasten genieten van de boottocht",
      "Drie gasten aan boord naast de zeilboten in de haven",
      "Twee gasten springen vanaf de boot in zee",
      "Twee gasten aan boord met de kust van Barcelona op de achtergrond",
      "Een groep deelt hapjes onder de luifel van de boot",
    ],
    extras: "Kleine details. Mooie herinneringen.",
    extraNames: ["eFoil", "Suppen", "Fotograaf"],
    final: "Je volgende herinnering begint op zee.",
  },
};
