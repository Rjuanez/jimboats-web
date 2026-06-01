import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  CheckboxField,
  FieldGrid,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/forms/AdminFormControls";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Surface } from "@/components/ui/Surface";

import { TranslationStatusBadge } from "./AdminExperienceBadges";
import type {
  AdminExperience,
  AdminExperienceFaq,
  AdminExperienceMutation,
  AdminLocaleCode,
  AdminTranslationStatus,
} from "./AdminExperienceTypes";

type AdminExperienceContentSectionProps = {
  experience: AdminExperience;
  locales: AdminLocaleCode[];
  updateExperience: AdminExperienceMutation;
};

const translationStatuses: AdminTranslationStatus[] = [
  "missing",
  "draft",
  "needs_review",
  "ready",
  "published",
];

export function AdminExperienceContentSection({
  experience,
  locales,
  updateExperience,
}: AdminExperienceContentSectionProps) {
  const [selectedLocale, setSelectedLocale] = useState<AdminLocaleCode>("en");
  const translation = experience.translations[selectedLocale];

  const updateTranslation = (
    updater: (
      current: AdminExperience["translations"][AdminLocaleCode],
    ) => AdminExperience["translations"][AdminLocaleCode],
  ) => {
    updateExperience((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [selectedLocale]: updater(current.translations[selectedLocale]),
      },
    }));
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)]">
      <Surface title="Locales" bodyClassName="p-2 sm:p-2">
        <div className="grid gap-2">
          {locales.map((locale) => {
            const localeTranslation = experience.translations[locale];

            return (
              <button
                aria-pressed={selectedLocale === locale}
                className="flex min-h-12 items-center justify-between gap-3 rounded-md px-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 aria-pressed:bg-slate-950 aria-pressed:text-white"
                key={locale}
                onClick={() => setSelectedLocale(locale)}
                type="button"
              >
                <span className="uppercase">{locale}</span>
                <TranslationStatusBadge status={localeTranslation.status} />
              </button>
            );
          })}
        </div>
      </Surface>

      <div className="space-y-5">
        <Surface
          description="This controls the public page for the selected locale, including route and publication state."
          title={`Public content (${selectedLocale.toUpperCase()})`}
        >
          <div className="space-y-4">
            <FieldGrid columns={3}>
              <SelectField
                label="Content state"
                onChange={(event) =>
                  updateTranslation((current) => ({
                    ...current,
                    status: event.target.value as AdminTranslationStatus,
                  }))
                }
                value={translation.status}
              >
                {translationStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </SelectField>
              <TextField
                label="Slug"
                onChange={(event) =>
                  updateTranslation((current) => ({
                    ...current,
                    canonical: `/${selectedLocale}/experiences/${event.target.value}`,
                    slug: event.target.value,
                  }))
                }
                value={translation.slug}
              />
              <CheckboxField
                checked={translation.publicPageEnabled}
                label="Public page enabled"
                onChange={(event) =>
                  updateTranslation((current) => ({
                    ...current,
                    publicPageEnabled: event.target.checked,
                  }))
                }
              />
            </FieldGrid>
            <FieldGrid>
              <TextField
                label="Public title"
                onChange={(event) =>
                  updateTranslation((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                value={translation.title}
              />
              <TextField
                label="H1"
                onChange={(event) =>
                  updateTranslation((current) => ({
                    ...current,
                    h1: event.target.value,
                  }))
                }
                value={translation.h1}
              />
            </FieldGrid>
            <TextAreaField
              label="Card summary"
              onChange={(event) =>
                updateTranslation((current) => ({
                  ...current,
                  cardSummary: event.target.value,
                }))
              }
              value={translation.cardSummary}
            />
            <TextAreaField
              label="Long description"
              onChange={(event) =>
                updateTranslation((current) => ({
                  ...current,
                  longDescription: event.target.value,
                }))
              }
              value={translation.longDescription}
            />
            <FieldGrid>
              <TextAreaField
                label="Included public copy"
                onChange={(event) =>
                  updateTranslation((current) => ({
                    ...current,
                    included: event.target.value,
                  }))
                }
                value={translation.included}
              />
              <TextAreaField
                label="What to bring"
                onChange={(event) =>
                  updateTranslation((current) => ({
                    ...current,
                    bring: event.target.value,
                  }))
                }
                value={translation.bring}
              />
            </FieldGrid>
            <TextAreaField
              label="Visible booking terms"
              onChange={(event) =>
                updateTranslation((current) => ({
                  ...current,
                  visibleTerms: event.target.value,
                }))
              }
              value={translation.visibleTerms}
            />
          </div>
        </Surface>

        <Surface
          description="Search engines and answer engines use these fields to understand the offer."
          title="Search and answer coverage"
        >
          <div className="space-y-4">
            <FieldGrid>
              <TextField
                label="SEO title"
                onChange={(event) =>
                  updateTranslation((current) => ({
                    ...current,
                    seoTitle: event.target.value,
                  }))
                }
                value={translation.seoTitle}
              />
              <TextField
                label="Canonical path"
                onChange={(event) =>
                  updateTranslation((current) => ({
                    ...current,
                    canonical: event.target.value,
                  }))
                }
                value={translation.canonical}
              />
            </FieldGrid>
            <TextAreaField
              label="SEO description"
              onChange={(event) =>
                updateTranslation((current) => ({
                  ...current,
                  seoDescription: event.target.value,
                }))
              }
              value={translation.seoDescription}
            />
            <FieldGrid>
              <SelectField
                label="Indexing"
                onChange={(event) =>
                  updateTranslation((current) => ({
                    ...current,
                    indexing: event.target.value as "index" | "noindex",
                  }))
                }
                value={translation.indexing}
              >
                <option value="index">index</option>
                <option value="noindex">noindex</option>
              </SelectField>
              <TextField
                label="Image alt text"
                onChange={(event) =>
                  updateTranslation((current) => ({
                    ...current,
                    altText: event.target.value,
                  }))
                }
                value={translation.altText}
              />
            </FieldGrid>
            <TextAreaField
              label="GEO summary"
              onChange={(event) =>
                updateTranslation((current) => ({
                  ...current,
                  geoSummary: event.target.value,
                }))
              }
              value={translation.geoSummary}
            />
            <TextAreaField
              label="Key facts"
              onChange={(event) =>
                updateTranslation((current) => ({
                  ...current,
                  keyFacts: event.target.value,
                }))
              }
              value={translation.keyFacts}
            />
          </div>
        </Surface>

        <Surface
          action={
            <Button
              onClick={() =>
                updateTranslation((current) => ({
                  ...current,
                  faq: [
                    ...current.faq,
                    {
                      answer: "",
                      id: `${selectedLocale}-${experience.id}-faq-${current.faq.length + 1}`,
                      question: "",
                    },
                  ],
                }))
              }
              variant="secondary"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add question
            </Button>
          }
          description="Questions help customers, search snippets and answer engines."
          title="Questions"
        >
          <div className="space-y-4">
            {translation.faq.map((faq, faqIndex) => (
              <FaqEditor
                faq={faq}
                key={faq.id}
                onRemove={() =>
                  updateTranslation((current) => ({
                    ...current,
                    faq: current.faq.filter((item) => item.id !== faq.id),
                  }))
                }
                onUpdate={(nextFaq) =>
                  updateTranslation((current) => ({
                    ...current,
                    faq: current.faq.map((item, itemIndex) => {
                      if (itemIndex !== faqIndex) {
                        return item;
                      }

                      return nextFaq;
                    }),
                  }))
                }
              />
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}

function FaqEditor({
  faq,
  onRemove,
  onUpdate,
}: {
  faq: AdminExperienceFaq;
  onRemove: () => void;
  onUpdate: (faq: AdminExperienceFaq) => void;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <TextField
            label="Question"
            onChange={(event) =>
              onUpdate({
                ...faq,
                question: event.target.value,
              })
            }
            value={faq.question}
          />
          <TextAreaField
            label="Answer"
            onChange={(event) =>
              onUpdate({
                ...faq,
                answer: event.target.value,
              })
            }
            value={faq.answer}
          />
        </div>
        <IconButton
          icon={<Trash2 className="size-4" aria-hidden="true" />}
          label="Remove question"
          onClick={onRemove}
        />
      </div>
    </div>
  );
}
