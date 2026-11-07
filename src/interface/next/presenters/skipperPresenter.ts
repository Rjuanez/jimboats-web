import { marketingImage, getMarketingPage } from "@/content/marketing";
import {
  crewCopy,
  guideCredits,
  profilePath,
  type Skipper,
} from "@/content/marketing/crew";
import { operator } from "@/content/marketing/catalog";
import { skipperDescriptions } from "@/content/marketing/seo";
import {
  marketingLocales,
  marketingPath,
  type MarketingLocale,
} from "@/content/marketing/routes";
import { skippers } from "@/content/marketing/skippers";
import { getBlogCards } from "@/content/blog/catalog";
import { marketingBusinessStructuredData, marketingMetadata } from "./marketingSeoPresenter";
import type { Metadata } from "next";

function profileAlternates(person: Skipper) {
  return Object.fromEntries(
    marketingLocales.map((lang) => [
      lang,
      operator.url + profilePath(lang, person.id),
    ]),
  );
}
export function skipperPage(locale: MarketingLocale, person: Skipper) {
  const team = getMarketingPage(locale, "about");
  const copy = crewCopy[locale];
  const shell = {
    ...team,
    languages: team.languages.map((lang) => ({
      ...lang,
      href: profilePath(lang.locale, person.id),
    })),
  };
  const url = operator.url + profilePath(locale, person.id);
  const bio = team.copy[person.bio];
  const image = marketingImage(person.photo, person.name);
  const guideLinks = getBlogCards(locale).filter(({ key }) =>
    guideCredits[key] === person.id,
  );
  const breadcrumbs = [
    { label: team.copy.home, href: marketingPath(locale) },
    { label: team.copy.aboutLink, href: marketingPath(locale, "about") },
    { label: person.name, href: profilePath(locale, person.id) },
  ];
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      marketingBusinessStructuredData(),
      {
        "@type": "ProfilePage",
        "@id": url,
        url,
        inLanguage: locale,
        mainEntity: {
          "@type": "Person",
          "@id": operator.url + profilePath("es", person.id) + "#person",
          name: person.name,
          url,
          description: bio,
          image: operator.url + image.src,
          jobTitle: copy.role,
          worksFor: { "@id": operator.entityId },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map(({ label, href }, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: label,
          item: operator.url + href,
        })),
      },
    ],
  };
  return {
    person,
    shell,
    copy,
    bio,
    image,
    guideLinks,
    url,
    data,
    breadcrumbs,
  };
}
export type SkipperPage = ReturnType<typeof skipperPage>;
export function skipperMetadata(page: SkipperPage): Metadata {
  const base = marketingMetadata(page.shell.locale, "about");
  const title = page.person.name + " · " + page.copy.role + " | JimBoats";
  const description = skipperDescriptions[page.shell.locale][page.person.id];
  const images = [
    {
      url: operator.url + page.image.src,
      alt: page.person.name,
      width: page.image.width,
      height: page.image.height,
    },
  ];
  return {
    ...base,
    title: { absolute: title },
    description,
    alternates: {
      canonical: page.url,
      languages: {
        ...profileAlternates(page.person),
        "x-default": operator.url + profilePath("en", page.person.id),
      },
    },
    openGraph: {
      type: "profile",
      title,
      description,
      url: page.url,
      images,
    },
    twitter: { card: "summary", title, description, images },
  };
}
export function profileSitemap() {
  return marketingLocales.flatMap((locale) =>
    skippers.map((person) => ({
      url: operator.url + profilePath(locale, person.id),
      alternates: { languages: profileAlternates(person) },
    })),
  );
}
