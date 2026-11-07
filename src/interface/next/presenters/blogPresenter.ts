import { guideCredits, profilePath } from "@/content/marketing/crew";
import { skippers } from "@/content/marketing/skippers";
import type { Metadata } from "next";
import { getMarketingPage, marketingImage } from "@/content/marketing";
import { operator } from "@/content/marketing/catalog";
import {
  marketingLocales,
  marketingPath,
  type MarketingLocale,
} from "@/content/marketing/routes";
import {
  blogKeys,
  blogExperiences,
  blogImage,
  blogPath,
  blogUpdatedAt,
  blogSources,
  getBlogCards,
  getBlogCopy,
  type BlogKey,
} from "@/content/blog/catalog";
import { marketingBusinessStructuredData, marketingMetadata } from "./marketingSeoPresenter";

export function getBlogPage(locale: MarketingLocale, key?: BlogKey) {
  const copy = getBlogCopy(locale);
  const article = key ? copy.articles[key] : null;
  const path = blogPath(locale, key);
  const home = getMarketingPage(locale);
  const relatedKeys = key ? blogExperiences[key] : [];
  const skipper = key && skippers.find(({ id }) => guideCredits[key] === id);
  const author = skipper ? {
    name: skipper.name,
    href: profilePath(locale, skipper.id),
    entityId: operator.url + profilePath("es", skipper.id) + "#person",
  } : undefined;
  return {
    locale,
    key,
    path,
    title: article?.title ?? copy.labels.title,
    description: article?.description ?? copy.labels.description,
    labels: copy.labels,
    shell: {
      ...home,
      languages: marketingLocales.map((language) => ({
        label: language.toUpperCase(),
        locale: language,
        href: blogPath(language, key),
        active: language === locale,
      })),
    },
    indexHref: blogPath(locale),
    articles: getBlogCards(locale).filter((card) => card.key !== key),
    article:
      article && key
        ? {
            ...article,
            image: marketingImage(blogImage(key), article.imageAlt),
            sections: article.sections.map((section) => ({
              ...section,
              image: section.photo ? marketingImage(section.photo.slug, section.photo.alt) : null,
              sources: (section.sourceIds ?? []).map((id) => blogSources[id]),
            })),
          }
        : null,
    experiences: relatedKeys.map(
      (id) => home.experiences.find((item) => item.id === id)!,
    ),
    date: article?.updatedAt ?? blogUpdatedAt,
    dateLabel: new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(new Date(`${article?.updatedAt ?? blogUpdatedAt}T12:00:00Z`)),
    breadcrumbs: [
      { label: home.copy.home, href: marketingPath(locale) },
      { label: copy.labels.name, href: blogPath(locale) },
      ...(article ? [{ label: article.title, href: path }] : []),
    ],
    sourceLinks: [
      ...new Set(
        article?.sections.flatMap((section) => section.sourceIds ?? []) ?? [],
      ),
    ].map((id) => blogSources[id]),
    pricesHref: marketingPath(locale, "prices"),
    contactHref: marketingPath(locale, "contact"),
    author,
  };
}
export type BlogPage = ReturnType<typeof getBlogPage>;

export function blogMetadata(locale: MarketingLocale, key?: BlogKey): Metadata {
  const base = marketingMetadata(locale);
  const copy = getBlogCopy(locale);
  const article = key ? copy.articles[key] : null;
  const title = `${article?.seoTitle ?? copy.labels.seoTitle} | JimBoats`;
  const description = article?.description ?? copy.labels.description;
  const path = blogPath(locale, key);
  const image = marketingImage(
    blogImage(key ?? "sunset"),
    article?.imageAlt ?? copy.labels.photo,
  );
  return {
    ...base,
    title: { absolute: title },
    description,
    alternates: {
      canonical: operator.url + path,
      languages: {
        ...Object.fromEntries(
          marketingLocales.map((lang) => [
            lang,
            operator.url + blogPath(lang, key),
          ]),
        ),
        "x-default": operator.url + blogPath("en", key),
      },
    },
    openGraph: {
      ...base.openGraph,
      title,
      description,
      type: article ? "article" : "website",
      url: operator.url + path,
      ...(article ? { modifiedTime: article.updatedAt ?? blogUpdatedAt } : {}),
      ...(article?.publishedAt ? { publishedTime: article.publishedAt } : {}),
      images: [
        {
          url: operator.url + image.src,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
    },
  };
}
export function blogStructuredData(page: BlogPage) {
  const url = operator.url + page.path;
  const organization = marketingBusinessStructuredData();
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      {
        "@type": page.article ? "BlogPosting" : "CollectionPage",
        "@id": url,
        url,
        inLanguage: page.locale,
        name: page.title,
        description: page.description,
        ...(page.article
          ? {
              headline: page.article.title,
              image: operator.url + page.article.image.src,
              dateModified: page.date,
              ...(page.article.publishedAt && { datePublished: page.article.publishedAt }),
              author: page.author && {
                "@type": "Person",
                "@id": page.author.entityId,
                name: page.author.name,
                url: operator.url + page.author.href,
              },
              publisher: { "@id": organization["@id"] },
              mainEntityOfPage: url,
              isPartOf: {
                "@type": "Blog",
                "@id": operator.url + page.indexHref,
                name: page.labels.name,
              },
              citation: page.sourceLinks.map((source) => source.href),
            }
          : {
              mainEntity: {
                "@type": "ItemList",
                itemListElement: page.articles.map((item, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: item.title,
                  url: operator.url + item.href,
                })),
              },
            }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: page.breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          item: operator.url + item.href,
        })),
      },
    ],
  };
}
export function blogSitemap() {
  return marketingLocales.flatMap((locale) =>
    [undefined, ...blogKeys].map((key) => ({
      url: operator.url + blogPath(locale, key),
      lastModified: key ? getBlogCopy(locale).articles[key].updatedAt ?? blogUpdatedAt : "2026-11-05",
      alternates: {
        languages: Object.fromEntries(
          marketingLocales.map((lang) => [
            lang,
            operator.url + blogPath(lang, key),
          ]),
        ),
      },
    })),
  );
}
