import { domainError } from "@/shared/domain/DomainError";
import type { LocaleCode } from "@/shared/domain/LocaleCode";
import type { Slug } from "@/shared/domain/Slug";

export type LocalizedContentStatus =
  | "ARCHIVED"
  | "DRAFT"
  | "NEEDS_REVIEW"
  | "NEEDS_TRANSLATION"
  | "OUTDATED"
  | "PUBLISHED"
  | "READY";

export type IndexingPolicy = "INDEX" | "NOINDEX";

export type GeoFaqItem = {
  answer: string;
  question: string;
};

export type LocalizedExperienceContentProps = {
  bringText: string;
  faqItems: GeoFaqItem[];
  geoSummary: string;
  h1: string;
  imageAltText: string;
  indexingPolicy: IndexingPolicy;
  includedText: string;
  keyFacts: string;
  locale: LocaleCode;
  mainContent: string;
  publicPageEnabled: boolean;
  seoDescription: string;
  seoTitle: string;
  slug: Slug;
  status: LocalizedContentStatus;
  summary: string;
  title: string;
  visibleTerms: string;
};

export type LocalizedExperienceContentSnapshot = {
  bringText: string;
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

export class LocalizedExperienceContent {
  private constructor(
    private readonly props: LocalizedExperienceContentProps,
  ) {}

  static create(input: LocalizedExperienceContentProps) {
    return new LocalizedExperienceContent({
      ...input,
      bringText: normalizeText(input.bringText),
      faqItems: input.faqItems.map((faq) => ({
        answer: normalizeText(faq.answer),
        question: normalizeText(faq.question),
      })),
      geoSummary: normalizeText(input.geoSummary),
      h1: normalizeText(input.h1),
      imageAltText: normalizeText(input.imageAltText),
      includedText: normalizeText(input.includedText),
      keyFacts: normalizeText(input.keyFacts),
      mainContent: normalizeText(input.mainContent),
      seoDescription: normalizeText(input.seoDescription),
      seoTitle: normalizeText(input.seoTitle),
      summary: normalizeText(input.summary),
      title: normalizeText(input.title),
      visibleTerms: normalizeText(input.visibleTerms),
    });
  }

  get locale() {
    return this.props.locale;
  }

  get status() {
    return this.props.status;
  }

  isPublishable() {
    return this.getPublicationIssues().length === 0;
  }

  assertPublishable() {
    const issues = this.getPublicationIssues();

    if (issues.length > 0) {
      throw domainError("LOCALIZED_CONTENT_NOT_PUBLISHABLE", issues.join(" "));
    }
  }

  getPublicationIssues() {
    const issues: string[] = [];

    if (!this.props.publicPageEnabled) {
      issues.push("Public page must be enabled.");
    }

    if (this.props.indexingPolicy !== "INDEX") {
      issues.push("Indexable public content must use INDEX policy.");
    }

    if (!["READY", "PUBLISHED"].includes(this.props.status)) {
      issues.push("Localized content must be ready or published.");
    }

    if (!this.props.title) {
      issues.push("Title is required.");
    }

    if (!this.props.h1) {
      issues.push("H1 is required.");
    }

    if (!this.props.mainContent) {
      issues.push("Main content is required.");
    }

    if (!this.props.summary) {
      issues.push("Public summary is required.");
    }

    if (!this.props.seoTitle || !this.props.seoDescription) {
      issues.push("SEO title and description are required.");
    }

    if (!this.props.geoSummary) {
      issues.push("GEO summary is required.");
    }

    if (!this.props.keyFacts) {
      issues.push("Key facts are required.");
    }

    if (!this.props.imageAltText) {
      issues.push("Image alt text is required.");
    }

    if (
      this.props.faqItems.length === 0 ||
      this.props.faqItems.some((faq) => !faq.question || !faq.answer)
    ) {
      issues.push("At least one complete GEO FAQ is required.");
    }

    return issues;
  }

  toSnapshot(): LocalizedExperienceContentSnapshot {
    return {
      bringText: this.props.bringText,
      faqItems: this.props.faqItems.map((faq) => ({ ...faq })),
      geoSummary: this.props.geoSummary,
      h1: this.props.h1,
      imageAltText: this.props.imageAltText,
      indexingPolicy: this.props.indexingPolicy,
      includedText: this.props.includedText,
      keyFacts: this.props.keyFacts,
      locale: this.props.locale.value,
      mainContent: this.props.mainContent,
      publicPageEnabled: this.props.publicPageEnabled,
      seoDescription: this.props.seoDescription,
      seoTitle: this.props.seoTitle,
      slug: this.props.slug.value,
      status: this.props.status,
      summary: this.props.summary,
      title: this.props.title,
      visibleTerms: this.props.visibleTerms,
    };
  }
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}
