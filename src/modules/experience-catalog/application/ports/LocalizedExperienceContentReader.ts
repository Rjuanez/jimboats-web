import type { PublishableLocalizedContent } from "../../domain/Experience";

export type AdminLocalizedExperienceContentReadModel = {
  bringText: string;
  experienceId: string;
  faqItems: Array<{
    answer: string;
    question: string;
  }>;
  geoSummary: string;
  h1: string;
  imageAltText: string;
  indexingPolicy: "INDEX" | "NOINDEX";
  includedText: string;
  keyFacts: string;
  locale: string;
  mainContent: string;
  publicPageEnabled: boolean;
  publicationIssues: string[];
  seoDescription: string;
  seoTitle: string;
  slug: string;
  status:
    | "ARCHIVED"
    | "DRAFT"
    | "NEEDS_REVIEW"
    | "NEEDS_TRANSLATION"
    | "OUTDATED"
    | "PUBLISHED"
    | "READY";
  summary: string;
  title: string;
  visibleTerms: string;
};

export type LocalizedExperienceContentReader = {
  listByExperienceId(
    experienceId: string,
  ): Promise<AdminLocalizedExperienceContentReadModel[]>;
  listPublishableCandidatesByExperienceId(
    experienceId: string,
  ): Promise<PublishableLocalizedContent[]>;
};
