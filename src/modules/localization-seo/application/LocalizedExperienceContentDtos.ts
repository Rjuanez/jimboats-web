import type {
  GeoFaqItem,
  IndexingPolicy,
  LocalizedContentStatus,
  LocalizedExperienceContentSnapshot,
} from "../domain/LocalizedExperienceContent";

export type LocalizedExperienceContentDto =
  LocalizedExperienceContentSnapshot & {
    experienceId: string;
    publicationIssues: string[];
  };

export type UpdateLocalizedExperienceContentCommand = {
  bringText: string;
  experienceId: string;
  faqItems: GeoFaqItem[];
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
