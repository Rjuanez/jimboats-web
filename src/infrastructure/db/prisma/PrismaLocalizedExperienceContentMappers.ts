import { LocaleCode } from "@/shared/domain/LocaleCode";
import { Slug } from "@/shared/domain/Slug";
import { LocalizedExperienceContent } from "@/modules/localization-seo/domain/LocalizedExperienceContent";
import type {
  IndexingPolicy,
  LocalizedContentStatus,
} from "@/modules/localization-seo/domain/LocalizedExperienceContent";

export type PrismaLocalizedExperienceFaqRecord = {
  answer: string;
  id: string;
  position: number;
  question: string;
};

export type PrismaLocalizedExperienceContentRecord = {
  bringText: string;
  experienceId: string;
  faqItems: PrismaLocalizedExperienceFaqRecord[];
  geoSummary: string;
  h1: string;
  id: string;
  imageAltText: string;
  indexingPolicy: string;
  includedText: string;
  keyFacts: string;
  locale: string;
  mainContent: string;
  publicPageEnabled: boolean;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  status: string;
  summary: string;
  title: string;
  visibleTerms: string;
};

export type PrismaLocalizedExperienceContentWriteModel = {
  content: {
    bringText: string;
    experienceId: string;
    geoSummary: string;
    h1: string;
    imageAltText: string;
    indexingPolicy: IndexingPolicy;
    includedText: string;
    keyFacts: string;
    locale: string;
    mainContent: string;
    publicPageEnabled: boolean;
    seoDescription: string;
    seoTitle: string;
    slug: string;
    status: LocalizedContentStatus;
    summary: string;
    title: string;
    visibleTerms: string;
  };
  faqItems: Array<{
    answer: string;
    id: string;
    position: number;
    question: string;
  }>;
  id: string;
  locale: string;
};

export function localizedExperienceContentFromPrismaRecord(
  record: PrismaLocalizedExperienceContentRecord,
) {
  const locale = LocaleCode.create(record.locale);

  return LocalizedExperienceContent.create({
    bringText: record.bringText,
    faqItems: record.faqItems
      .slice()
      .sort((left, right) => left.position - right.position)
      .map((faq) => ({
        answer: faq.answer,
        question: faq.question,
      })),
    geoSummary: record.geoSummary,
    h1: record.h1,
    imageAltText: record.imageAltText,
    indexingPolicy: indexingPolicyFromPrisma(record.indexingPolicy),
    includedText: record.includedText,
    keyFacts: record.keyFacts,
    locale,
    mainContent: record.mainContent,
    publicPageEnabled: record.publicPageEnabled,
    seoDescription: record.seoDescription,
    seoTitle: record.seoTitle,
    slug: Slug.create(record.slug, locale),
    status: localizedContentStatusFromPrisma(record.status),
    summary: record.summary,
    title: record.title,
    visibleTerms: record.visibleTerms,
  });
}

export function localizedExperienceContentToPrismaWriteModel(
  experienceId: string,
  content: LocalizedExperienceContent,
): PrismaLocalizedExperienceContentWriteModel {
  const snapshot = content.toSnapshot();
  const id = localizedExperienceContentId(experienceId, snapshot.locale);

  return {
    content: {
      bringText: snapshot.bringText,
      experienceId,
      geoSummary: snapshot.geoSummary,
      h1: snapshot.h1,
      imageAltText: snapshot.imageAltText,
      indexingPolicy: snapshot.indexingPolicy,
      includedText: snapshot.includedText,
      keyFacts: snapshot.keyFacts,
      locale: snapshot.locale,
      mainContent: snapshot.mainContent,
      publicPageEnabled: snapshot.publicPageEnabled,
      seoDescription: snapshot.seoDescription,
      seoTitle: snapshot.seoTitle,
      slug: snapshot.slug,
      status: snapshot.status,
      summary: snapshot.summary,
      title: snapshot.title,
      visibleTerms: snapshot.visibleTerms,
    },
    faqItems: snapshot.faqItems.map((faq, position) => ({
      answer: faq.answer,
      id: localizedExperienceFaqId(id, position),
      position,
      question: faq.question,
    })),
    id,
    locale: snapshot.locale,
  };
}

function localizedContentStatusFromPrisma(
  value: string,
): LocalizedContentStatus {
  if (
    value === "ARCHIVED" ||
    value === "DRAFT" ||
    value === "NEEDS_REVIEW" ||
    value === "NEEDS_TRANSLATION" ||
    value === "OUTDATED" ||
    value === "PUBLISHED" ||
    value === "READY"
  ) {
    return value;
  }

  throw new Error("Unsupported persisted localized content status.");
}

function indexingPolicyFromPrisma(value: string): IndexingPolicy {
  if (value === "INDEX" || value === "NOINDEX") {
    return value;
  }

  throw new Error("Unsupported persisted indexing policy.");
}

function localizedExperienceContentId(experienceId: string, locale: string) {
  return `${experienceId}:content:${locale}`;
}

function localizedExperienceFaqId(contentId: string, position: number) {
  return `${contentId}:faq:${position}`;
}
