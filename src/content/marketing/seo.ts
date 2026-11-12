import type { MarketingLocale, MarketingPageKey } from "./routes";
import type { SkipperId } from "./crew";

// Short search summaries; prices and durations are filled from the shared catalog.
export const marketingDescriptions: Record<MarketingLocale, Partial<Record<MarketingPageKey, string>>> = {
  es: {
    home: "Paseos privados en barco por Barcelona para hasta 6 personas. Desde {price} por {hours} para todo el barco, con patrón. Salida desde Port Olímpic.",
    private: "Paseo privado por Barcelona desde {price} por {hours} para todo el barco, hasta 6 personas. Patrón, combustible y seguro incluidos. Salida desde Port Olímpic.",
    sunset: "Atardecer en barco privado por Barcelona desde {price} por {hours} para todo el barco. Hasta 6 personas, con patrón, bebidas y aperitivo incluidos.",
    sunrise: "Amanecer en barco privado por Barcelona desde {price} por {hours} para todo el barco. Hasta 6 personas, con patrón, bebidas y aperitivo incluidos.",
    romantic: "Paseo romántico en barco por Barcelona desde {price} por {hours} para todo el barco. Patrón y decoración de las fotos incluidos. Elige entre {min} y {max} horas.",
    prices: "Consulta precios finales por barco para hasta 6 personas. Paseos por Barcelona desde {price} por {hours}, con patrón, combustible y seguro incluidos.",
  },
  en: {
    home: "Private Barcelona boat trips for up to 6 guests. From {price} for {hours} for the whole boat, with a skipper. Depart from Port Olímpic.",
    private: "Private Barcelona boat trip from {price} for {hours} for the whole boat, up to 6 guests. Skipper, fuel and insurance included. From Port Olímpic.",
    sunset: "Private sunset boat trip in Barcelona from {price} for {hours} for the whole boat. Up to 6 guests, with skipper, drinks and snacks included.",
    sunrise: "Private sunrise boat trip in Barcelona from {price} for {hours} for the whole boat. Up to 6 guests, with skipper, drinks and snacks included.",
    romantic: "Romantic Barcelona boat trip from {price} for {hours} for the whole boat. Skipper and decorations shown in the photos included. Choose {min}–{max} hours.",
    prices: "Compare final prices for the whole boat, up to 6 guests. Barcelona trips from {price} for {hours}, with skipper, fuel and insurance included.",
  },
  fr: {
    home: "Sorties privées en bateau à Barcelone pour 6 personnes maximum. Dès {price} pour {hours} pour le bateau entier, avec skipper. Départ de Port Olímpic.",
    private: "Bateau privé à Barcelone dès {price} pour {hours} pour le bateau entier, 6 personnes maximum. Skipper, carburant et assurance inclus. Départ de Port Olímpic.",
    sunset: "Coucher de soleil en bateau privé à Barcelone dès {price} pour {hours} pour le bateau entier. Jusqu’à 6 personnes, skipper, boissons et apéritif inclus.",
    sunrise: "Lever de soleil en bateau privé à Barcelone dès {price} pour {hours} pour le bateau entier. Jusqu’à 6 personnes, skipper, boissons et apéritif inclus.",
    romantic: "Sortie romantique en bateau à Barcelone dès {price} pour {hours} pour le bateau entier. Skipper et décoration des photos inclus. Durée de {min} à {max} heures.",
    prices: "Comparez les prix finaux par bateau pour 6 personnes maximum. Sorties à Barcelone dès {price} pour {hours}, skipper, carburant et assurance inclus.",
  },
  de: {
    home: "Private Bootstouren in Barcelona für bis zu 6 Gäste. Ab {price} für {hours} für das gesamte Boot, mit Skipper. Abfahrt ab Port Olímpic.",
    private: "Privates Boot in Barcelona ab {price} für {hours} für das gesamte Boot, bis zu 6 Gäste. Skipper, Treibstoff und Versicherung inklusive. Ab Port Olímpic.",
    sunset: "Sonnenuntergang in Barcelona auf einem privaten Boot ab {price} für {hours} für das gesamte Boot. Bis zu 6 Gäste, Skipper, Getränke und Snacks inklusive.",
    sunrise: "Sonnenaufgang in Barcelona auf einem privaten Boot ab {price} für {hours} für das gesamte Boot. Bis zu 6 Gäste, Skipper, Getränke und Snacks inklusive.",
    romantic: "Romantische Bootsfahrt in Barcelona ab {price} für {hours} für das gesamte Boot. Skipper und Dekoration wie auf den Fotos inklusive. Dauer: {min}–{max} Stunden.",
    prices: "Vergleicht Endpreise pro Boot für bis zu 6 Gäste. Bootstouren in Barcelona ab {price} für {hours}, inklusive Skipper, Treibstoff und Versicherung.",
    about: "Lernt Víctor und David Jiménez kennen, die Gründer und Skipper von JimBoats. Entdeckt ihre Geschichte und private Bootstouren an Barcelonas Küste.",
  },
  nl: {
    home: "Privéboottochten in Barcelona voor maximaal 6 gasten. Vanaf {price} voor {hours} voor de hele boot, met schipper. Vertrek vanuit Port Olímpic.",
    private: "Privéboottocht in Barcelona vanaf {price} voor {hours} voor de hele boot, tot 6 gasten. Schipper, brandstof en verzekering inbegrepen. Vanuit Port Olímpic.",
    sunset: "Zonsondergang in Barcelona op een privéboot vanaf {price} voor {hours} voor de hele boot. Tot 6 gasten, inclusief schipper, drankjes en hapjes.",
    sunrise: "Zonsopgang in Barcelona op een privéboot vanaf {price} voor {hours} voor de hele boot. Tot 6 gasten, inclusief schipper, drankjes en hapjes.",
    romantic: "Romantische boottocht in Barcelona vanaf {price} voor {hours} voor de hele boot. Schipper en versiering zoals op de foto’s inbegrepen. Kies {min}–{max} uur.",
    prices: "Vergelijk totaalprijzen per boot voor maximaal 6 gasten. Boottochten in Barcelona vanaf {price} voor {hours}, inclusief schipper, brandstof en verzekering.",
  },
};

export const skipperDescriptions: Record<MarketingLocale, Record<SkipperId, string>> = {
  es: {
    "victor-jimenez": "Conoce a Víctor Jiménez, cofundador y patrón de JimBoats. Descubre su historia y los paseos privados que realiza desde Port Olímpic, Barcelona.",
    "david-jimenez": "Conoce a David Jiménez, cofundador y patrón de JimBoats en Barcelona. Prepara el barco y acompaña a los grupos en sus paseos desde Port Olímpic.",
  },
  en: {
    "victor-jimenez": "Meet Víctor Jiménez, JimBoats co-founder and skipper. Discover his story and the private boat trips he leads from Port Olímpic, Barcelona.",
    "david-jimenez": "Meet David Jiménez, JimBoats co-founder and skipper in Barcelona. He prepares the boat and takes groups on trips from Port Olímpic.",
  },
  fr: {
    "victor-jimenez": "Découvrez Víctor Jiménez, cofondateur et skipper de JimBoats, son histoire et ses sorties privées en bateau au départ de Port Olímpic, à Barcelone.",
    "david-jimenez": "Découvrez David Jiménez, cofondateur et skipper de JimBoats à Barcelone. Il prépare le bateau et accompagne les groupes au départ de Port Olímpic.",
  },
  de: {
    "victor-jimenez": "Lernt Víctor Jiménez kennen, Mitgründer und Skipper von JimBoats. Entdeckt seine Geschichte und seine privaten Bootstouren ab Port Olímpic in Barcelona.",
    "david-jimenez": "Lernt David Jiménez kennen, Mitgründer und Skipper von JimBoats in Barcelona. Er bereitet das Boot vor und begleitet Gruppen auf Touren ab Port Olímpic.",
  },
  nl: {
    "victor-jimenez": "Maak kennis met Víctor Jiménez, medeoprichter en schipper van JimBoats. Ontdek zijn verhaal en zijn privéboottochten vanuit Port Olímpic in Barcelona.",
    "david-jimenez": "Maak kennis met David Jiménez, medeoprichter en schipper van JimBoats in Barcelona. Hij bereidt de boot voor en begeleidt groepen vanuit Port Olímpic.",
  },
};

// Search titles are independent of the longer, visible page headings.
export const marketingTitles: Record<MarketingLocale, Record<MarketingPageKey, string>> = {
  es: {
    home: "Paseos en barco y alquiler con patrón en Barcelona",
    private: "Paseo privado en barco con patrón en Barcelona",
    sunset: "Paseo en barco al atardecer en Barcelona",
    sunrise: "Paseo en barco al amanecer en Barcelona",
    romantic: "Paseo romántico en barco por Barcelona",
    prices: "Precios de paseos en barco en Barcelona",
    boat: "LENA, nuestra menorquina en Barcelona",
    contact: "Contacto y embarque en Port Olímpic, Barcelona",
    about: "Víctor y David, nuestros patrones en Barcelona",
  },
  en: {
    home: "Barcelona boat tours & boat rental with a skipper",
    private: "Private boat trip with skipper in Barcelona",
    sunset: "Sunset boat trip in Barcelona",
    sunrise: "Sunrise boat trip in Barcelona",
    romantic: "Romantic boat trip in Barcelona",
    prices: "Barcelona boat trip prices",
    boat: "LENA, our traditional boat in Barcelona",
    contact: "Contact & boarding at Port Olímpic, Barcelona",
    about: "Víctor and David, your skippers in Barcelona",
  },
  fr: {
    home: "Balade en bateau et location avec skipper à Barcelone",
    private: "Bateau privé avec skipper à Barcelone",
    sunset: "Barcelone en bateau au coucher du soleil",
    sunrise: "Barcelone en bateau au lever du soleil",
    romantic: "Balade romantique en bateau à Barcelone",
    prices: "Tarifs des balades en bateau à Barcelone",
    boat: "LENA, notre bateau traditionnel à Barcelone",
    contact: "Contact et embarquement au Port Olímpic",
    about: "Víctor et David, vos skippers à Barcelone",
  },
  de: {
    home: "Bootstour Barcelona & Boot mieten mit Skipper",
    private: "Private Bootstour mit Skipper in Barcelona",
    sunset: "Bootstour zum Sonnenuntergang in Barcelona",
    sunrise: "Bootstour zum Sonnenaufgang in Barcelona",
    romantic: "Romantische Bootsfahrt in Barcelona",
    prices: "Preise für Bootstouren in Barcelona",
    boat: "LENA, unser traditionelles Boot in Barcelona",
    contact: "Kontakt und Treffpunkt am Port Olímpic",
    about: "Víctor und David, eure Skipper in Barcelona",
  },
  nl: {
    home: "Boottocht Barcelona & boot huren met schipper",
    private: "Privéboottocht met schipper in Barcelona",
    sunset: "Boottocht bij zonsondergang in Barcelona",
    sunrise: "Boottocht bij zonsopgang in Barcelona",
    romantic: "Romantische boottocht in Barcelona",
    prices: "Prijzen van boottochten in Barcelona",
    boat: "LENA, onze traditionele boot in Barcelona",
    contact: "Contact en opstappen bij Port Olímpic",
    about: "Víctor en David, jullie schippers in Barcelona",
  },
};
