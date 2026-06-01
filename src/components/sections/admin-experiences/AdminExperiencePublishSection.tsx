import { CheckCircle2, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

import {
  CheckboxField,
  SelectField,
} from "@/components/forms/AdminFormControls";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import {
  PublicationStatusBadge,
  ReadinessBadge,
  TranslationStatusBadge,
} from "./AdminExperienceBadges";
import type {
  AdminExperience,
  AdminExperienceMutation,
  AdminExperienceReadiness,
  AdminLocaleCode,
  AdminPublicationStatus,
  AdminTranslationStatus,
} from "./AdminExperienceTypes";

type AdminExperiencePublishSectionProps = {
  experience: AdminExperience;
  locales: AdminLocaleCode[];
  readiness: AdminExperienceReadiness;
  updateExperience: AdminExperienceMutation;
};

const publicationStatuses: AdminPublicationStatus[] = [
  "draft",
  "ready",
  "published",
  "archived",
];

const translationStatuses: AdminTranslationStatus[] = [
  "missing",
  "draft",
  "needs_review",
  "ready",
  "published",
];

export function AdminExperiencePublishSection({
  experience,
  locales,
  readiness,
  updateExperience,
}: AdminExperiencePublishSectionProps) {
  const canPublish = readiness.blockingIssues.length === 0;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <Surface
          action={<ReadinessBadge score={readiness.score} />}
          description="Publication should make configuration, media and at least one localized public page coherent."
          title="Publication readiness"
        >
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatusTile
                label="Experience state"
                value={<PublicationStatusBadge status={experience.status} />}
              />
              <StatusTile
                label="Media"
                value={
                  <Badge
                    tone={
                      experience.media.status === "ready" ? "emerald" : "amber"
                    }
                  >
                    {experience.media.status}
                  </Badge>
                }
              />
              <StatusTile
                label="Deposit"
                value={<Badge tone="sky">EUR {experience.depositAmount}</Badge>}
              />
            </div>

            {readiness.blockingIssues.length > 0 ? (
              <IssueList
                issues={readiness.blockingIssues}
                title="Blocking issues"
                tone="rose"
              />
            ) : (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                This experience can be published.
              </div>
            )}

            {readiness.warnings.length > 0 ? (
              <IssueList
                issues={readiness.warnings}
                title="Warnings"
                tone="amber"
              />
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  updateExperience((current) => ({
                    ...current,
                    status: "ready",
                  }))
                }
                variant="secondary"
              >
                Mark ready
              </Button>
              <Button
                disabled={!canPublish}
                onClick={() =>
                  updateExperience((current) => ({
                    ...current,
                    status: "published",
                  }))
                }
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Publish
              </Button>
            </div>
          </div>
        </Surface>

        <Surface
          description="Each public locale can be enabled independently. Routes are generated from localized slugs."
          title="Public pages"
        >
          <div className="space-y-3">
            {locales.map((locale) => {
              const translation = experience.translations[locale];
              const publicPath = `/${locale}/experiences/${translation.slug}`;

              return (
                <div
                  className="rounded-lg border border-slate-200 bg-white p-4"
                  key={locale}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold uppercase text-slate-950">
                          {locale}
                        </p>
                        <TranslationStatusBadge status={translation.status} />
                      </div>
                      <p className="mt-2 break-words text-sm text-slate-600">
                        {publicPath}
                      </p>
                    </div>
                    <Button href={publicPath} variant="secondary">
                      <ExternalLink className="size-4" aria-hidden="true" />
                      Open
                    </Button>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <CheckboxField
                      checked={translation.publicPageEnabled}
                      label="Enable public page"
                      onChange={(event) =>
                        updateExperience((current) => ({
                          ...current,
                          translations: {
                            ...current.translations,
                            [locale]: {
                              ...current.translations[locale],
                              publicPageEnabled: event.target.checked,
                            },
                          },
                        }))
                      }
                    />
                    <SelectField
                      label="Locale status"
                      onChange={(event) =>
                        updateExperience((current) => ({
                          ...current,
                          translations: {
                            ...current.translations,
                            [locale]: {
                              ...current.translations[locale],
                              status: event.target
                                .value as AdminTranslationStatus,
                            },
                          },
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
                  </div>
                </div>
              );
            })}
          </div>
        </Surface>
      </div>

      <aside aria-label="Publication summary" className="space-y-5">
        <Surface title="State">
          <div className="space-y-4">
            <SelectField
              label="Publication state"
              onChange={(event) =>
                updateExperience((current) => ({
                  ...current,
                  status: event.target.value as AdminPublicationStatus,
                }))
              }
              value={experience.status}
            >
              {publicationStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </SelectField>
            <p className="text-sm leading-6 text-slate-600">
              Archive removes the experience from new public bookings while
              keeping historical bookings readable.
            </p>
          </div>
        </Surface>

        <Surface title="Recent activity">
          <ol className="space-y-4 text-sm">
            <ActivityItem label="Local draft edited" time="Just now" />
            <ActivityItem label="Media variants checked" time="Demo data" />
            <ActivityItem
              label="Launch deposit rule reviewed"
              time="Demo data"
            />
          </ol>
        </Surface>
      </aside>
    </div>
  );
}

function StatusTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </p>
      <div className="mt-2">{value}</div>
    </div>
  );
}

function IssueList({
  issues,
  title,
  tone,
}: {
  issues: string[];
  title: string;
  tone: "amber" | "rose";
}) {
  const className =
    tone === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <div className={`rounded-md border px-4 py-3 ${className}`}>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {issues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
    </div>
  );
}

function ActivityItem({ label, time }: { label: string; time: string }) {
  return (
    <li className="flex gap-3">
      <span className="mt-1 size-2 rounded-full bg-sky-700" />
      <span className="min-w-0">
        <span className="block font-semibold text-slate-950">{label}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{time}</span>
      </span>
    </li>
  );
}
