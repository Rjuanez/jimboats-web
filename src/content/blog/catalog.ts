import { hourlyPrices } from "../booking/hourlyPrices";
import hospitality from "../marketing/hospitality.json";
import type { ExperienceKey } from "../marketing/routes";
import es from "./es.json";
import en from "./en.json";
import fr from "./fr.json";
import de from "./de.json";
import nl from "./nl.json";
import { marketingLocales, type MarketingLocale } from "../marketing/routes";

export const blogKeys = [
  "sunset",
  "sunrise",
  "romantic",
  "food",
  "birthday",
  "hen",
] as const;
export type BlogKey = (typeof blogKeys)[number];
export const blogExperiences: Record<BlogKey, ExperienceKey[]> = {
  sunset: ["sunset"],
  sunrise: ["sunrise"],
  romantic: ["romantic", "sunset"],
  food: ["private", "sunset"],
  birthday: ["private"],
  hen: ["private"],
};
export function blogImage(key: BlogKey) {
  if (key === "hen") return "hen-party-friends";
  if (key === "food") return "production-gallery-5";
  if (key === "birthday") return "production-gallery-2";
  return `production-${key}`;
}

export type BlogSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  sourceIds?: string[];
  photo?: { slug: string; alt: string };
};
export type BlogArticle = {
  // Set on the real first publication date; never derive from the build date.
  publishedAt?: string;
  updatedAt?: string;
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  category: string;
  imageAlt: string;
  lead: string;
  sections: BlogSection[];
  faqs: string[][];
  cta: { title: string; text: string };
};
type BlogCopy = {
  labels: typeof es.labels;
  articles: Record<BlogKey, BlogArticle>;
};
const copies: Record<MarketingLocale, BlogCopy> = { es, en, fr, de, nl };
export const blogUpdatedAt = "2026-11-04";
export const blogSources: Record<string, { title: string; href: string }> = {
  montjuic: {
    title: "Turisme de Barcelona · Mirador de l’Alcalde",
    href: "https://www.barcelonaturisme.cat/wv3/en/page/1943/mirador-de-l-alcalde.html",
  },
  outdoors: {
    title: "Ajuntament de Barcelona · Barcelona a l’aire lliure",
    href: "https://www.meet.barcelona/en/visit-and-love-it/open-air-barcelona",
  },
  bogatell: {
    title: "Turisme de Barcelona · Bogatell",
    href: "https://www.barcelonaturisme.cat/wv3/en/page/1270/bogatell-beach.html",
  },
  gotic: {
    title: "Turisme de Barcelona · Barri Gòtic",
    href: "https://bid.barcelonaturisme.com/wv3/en/page/1052/gothic-quarter.html",
  },
  ciutadella: {
    title: "Ajuntament de Barcelona · Parc de la Ciutadella",
    href: "https://guia.barcelona.cat/es/detall/_92086011921.html",
  },
  solar: {
    title: "MET Norway · Sunrise 3.0 · CC BY 4.0",
    href: "https://api.met.no/weatherapi/sunrise/3.0/documentation",
  },
};
export function getBlogCopy(locale: MarketingLocale): BlogCopy {
  const copy = copies[locale];
  const articles = { ...copy.articles };
  for (const key of ["food", "birthday", "hen"] as const) {
    const article = articles[key];
    articles[key] = {
      ...article,
      sections: article.sections.map((section) => ({
        ...section,
        paragraphs: section.paragraphs.map((p) =>
          p
            .replace("{food}", hospitality[locale].food)
            .replace("{drinks}", hospitality[locale].drinks)
            .replaceAll("{private1h}", formatPrice(hourlyPrices.daytrip[1], locale))
            .replaceAll("{private2h}", formatPrice(hourlyPrices.daytrip[2], locale))
            .replaceAll("{private3h}", formatPrice(hourlyPrices.daytrip[3], locale))
            .replaceAll("{perGuest2h}", formatPrice(hourlyPrices.daytrip[2] / 6, locale))
            .replaceAll("{sunset2h}", formatPrice(hourlyPrices["ex-sunset"][2], locale)),
        ),
      })),
    };
  }
  return { ...copy, articles };
}
export function blogPath(locale: MarketingLocale, key?: BlogKey) {
  return `/${locale}/blog${key ? `/${copies[locale].articles[key].slug}` : ""}`;
}
export function resolveBlogKey(locale: MarketingLocale, slug: string) {
  return blogKeys.find((key) => copies[locale].articles[key].slug === slug);
}
export function blogStaticParams() {
  return marketingLocales.flatMap((locale) =>
    blogKeys.map((key) => ({
      locale,
      slug: copies[locale].articles[key].slug,
    })),
  );
}
export function getBlogCards(locale: MarketingLocale) {
  return blogKeys.map((key) => ({
    key,
    title: copies[locale].articles[key].title,
    description: copies[locale].articles[key].description,
    category: copies[locale].articles[key].category,
    imageAlt: copies[locale].articles[key].imageAlt,
    imageSlug: blogImage(key),
    href: blogPath(locale, key),
  }));
}
export type BlogCard = ReturnType<typeof getBlogCards>[number];

function formatPrice(value: number, locale: MarketingLocale) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}
