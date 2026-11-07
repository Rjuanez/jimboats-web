import type { BlogKey } from "../blog/catalog";
import {
  marketingLocales,
  marketingPath,
  type MarketingLocale,
} from "./routes";
import { skippers } from "./skippers";

export type Skipper = (typeof skippers)[number];
export type SkipperId = Skipper["id"];
export const guideCredits: Record<BlogKey, SkipperId> = {
  sunset: "victor-jimenez",
  sunrise: "david-jimenez",
  romantic: "victor-jimenez",
  food: "david-jimenez",
  birthday: "david-jimenez",
  hen: "victor-jimenez",
};

export function profilePath(locale: MarketingLocale, id: SkipperId) {
  return marketingPath(locale, "about") + "/" + id;
}

export function profileParams() {
  return marketingLocales.flatMap((locale) =>
    skippers.map(({ id }) => ({
      locale,
      slug: marketingPath(locale, "about").split("/")[2],
      person: id,
    })),
  );
}

export const crewCopy = {
  es: {
    role: "Cofundador y patrón",
    crew: "Los patrones",
    profile: "Conocer a",
    guides: "Guías en las que participo",
    photo:
      "Los dos patrones de JimBoats a bordo frente a la costa de Barcelona",
    tips: "Un consejo antes de embarcar",
    victor: "La Barceloneta, a la luz del atardecer.",
    david: "El puerto, cuando Barcelona aún duerme.",
    victorTip:
      "Para ver cómo cambia la luz de Barcelona, llega al Port Olímpic unos quince minutos antes. Así podrás embarcar con calma y disfrutar del skyline desde el agua.",
    davidTip:
      "Cuéntanos qué te apetece hacer, incluso si es tu primera vez en un barco. Conocer al grupo y volver a comprobar el viento y el oleaje nos ayuda a elegir la ruta del día.",
  },
  en: {
    role: "Co-founder and skipper",
    crew: "Meet the skippers",
    profile: "Meet",
    guides: "Guides I contributed to",
    photo: "The two JimBoats skippers on board off the coast of Barcelona",
    tips: "A tip before you board",
    victor: "Barceloneta in the evening light.",
    david: "Leaving port while Barcelona sleeps.",
    victorTip:
      "To watch the light change over Barcelona, get to Port Olímpic about fifteen minutes early. You can settle in before seeing the skyline from the water.",
    davidTip:
      "Tell us what you would like to do, even if this is your first boat trip. Getting to know the group and checking the wind and swell again helps us choose the route.",
  },
  fr: {
    role: "Cofondateur et skipper",
    crew: "Les skippers",
    profile: "Rencontrer",
    guides: "Guides auxquels j’ai contribué",
    photo: "Les deux skippers de JimBoats à bord au large de Barcelone",
    tips: "Un conseil avant d’embarquer",
    victor: "La Barceloneta dans la lumière du soir.",
    david: "Quitter le port quand Barcelone dort encore.",
    victorTip:
      "Pour voir la lumière changer sur Barcelone, arrivez au Port Olímpic un quart d’heure en avance. Vous aurez le temps de vous installer avant de découvrir la ville depuis la mer.",
    davidTip:
      "Dites-nous ce qui vous ferait plaisir, même si c’est votre première sortie en bateau. Connaître le groupe et vérifier à nouveau le vent et la houle nous aide à choisir le parcours.",
  },
  de: {
    role: "Mitgründer und Skipper",
    crew: "Unsere Skipper",
    profile: "Zum Profil von",
    guides: "Ratgeber, an denen ich mitgewirkt habe",
    photo: "Die beiden Skipper von JimBoats an Bord vor Barcelona",
    tips: "Ein Tipp vor dem Ablegen",
    victor: "Barceloneta im Abendlicht.",
    david: "Auslaufen, wenn Barcelona noch schläft.",
    victorTip:
      "Komm etwa fünfzehn Minuten früher zum Port Olímpic, um den Lichtwechsel über Barcelona zu erleben. So kannst du in Ruhe an Bord gehen und die Skyline vom Wasser aus genießen.",
    davidTip:
      "Erzähl uns, worauf du Lust hast, auch wenn du zum ersten Mal mitfährst. Bevor wir die Route wählen, lernen wir die Gruppe kennen und prüfen nochmals Wind und Seegang.",
  },
  nl: {
    role: "Medeoprichter en schipper",
    crew: "Onze schippers",
    profile: "Maak kennis met",
    guides: "Gidsen waaraan ik heb meegewerkt",
    photo:
      "De twee schippers van JimBoats aan boord voor de kust van Barcelona",
    tips: "Een tip voor vertrek",
    victor: "Barceloneta in het avondlicht.",
    david: "De haven uit terwijl Barcelona nog slaapt.",
    victorTip:
      "Kom ongeveer een kwartier eerder naar Port Olímpic om het licht boven Barcelona te zien veranderen. Zo stap je rustig aan boord voordat je de skyline vanaf zee bekijkt.",
    davidTip:
      "Vertel ons waar je zin in hebt, ook als je voor het eerst meevaart. Door de groep te leren kennen en de wind en deining opnieuw te bekijken, kiezen we een passende route.",
  },
} as const;
