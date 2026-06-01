import { Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  FieldGrid,
  SelectField,
  TextField,
} from "@/components/forms/AdminFormControls";
import { Badge } from "@/components/ui/Badge";
import { Surface } from "@/components/ui/Surface";

import { MediaStatusBadge } from "./AdminExperienceBadges";
import type {
  AdminExperience,
  AdminExperienceMutation,
  AdminLocaleCode,
} from "./AdminExperienceTypes";

type AdminExperienceMediaSectionProps = {
  experience: AdminExperience;
  locales: AdminLocaleCode[];
  updateExperience: AdminExperienceMutation;
};

export function AdminExperienceMediaSection({
  experience,
  locales,
  updateExperience,
}: AdminExperienceMediaSectionProps) {
  const [selectedLocale, setSelectedLocale] = useState<AdminLocaleCode>("en");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const translation = experience.translations[selectedLocale];

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Surface
        description="Launch supports one primary image per experience. Processing status is shown before publishing."
        title="Primary image"
      >
        <div className="space-y-5">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={translation.altText}
              className="aspect-[16/10] w-full rounded-lg object-cover"
              src={previewUrl}
            />
          ) : experience.media.primaryImageUrl ? (
            <Image
              alt={translation.altText}
              className="aspect-[16/10] w-full rounded-lg object-cover"
              height={600}
              src={experience.media.primaryImageUrl}
              width={960}
            />
          ) : (
            <div className="flex aspect-[16/10] w-full items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-500">
              No primary image selected
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <label className="block min-w-0">
              <span className="text-sm font-semibold text-slate-950">
                Replace image
              </span>
              <span className="mt-1.5 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:bg-slate-100">
                <Upload className="size-6 text-slate-500" aria-hidden="true" />
                <span className="mt-2 text-sm font-semibold text-slate-950">
                  Choose local file
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  Preview only until storage is connected
                </span>
                <input
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    const nextPreviewUrl = URL.createObjectURL(file);

                    setPreviewUrl((currentPreviewUrl) => {
                      if (currentPreviewUrl) {
                        URL.revokeObjectURL(currentPreviewUrl);
                      }

                      return nextPreviewUrl;
                    });
                    updateExperience((current) => ({
                      ...current,
                      media: {
                        filename: file.name,
                        primaryImageUrl: current.media.primaryImageUrl,
                        status: "processing",
                      },
                    }));
                  }}
                  type="file"
                />
              </span>
            </label>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">
                Asset status
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm text-slate-600">
                  {experience.media.filename || "No file"}
                </span>
                <MediaStatusBadge status={experience.media.status} />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                The worker will later replace this with processed variants and a
                ready state.
              </p>
            </div>
          </div>
        </div>
      </Surface>

      <aside aria-label="Media summary" className="space-y-5">
        <Surface title="Processing">
          <div className="space-y-3">
            <StatusLine
              label="Original upload"
              ready={Boolean(experience.media.filename)}
            />
            <StatusLine
              label="Responsive variants"
              ready={experience.media.status === "ready"}
            />
            <StatusLine
              label="Public-safe alt text"
              ready={Boolean(translation.altText)}
            />
          </div>
        </Surface>

        <Surface title="Alt text by locale">
          <div className="space-y-4">
            <SelectField
              label="Locale"
              onChange={(event) =>
                setSelectedLocale(event.target.value as AdminLocaleCode)
              }
              value={selectedLocale}
            >
              {locales.map((locale) => (
                <option key={locale} value={locale}>
                  {locale.toUpperCase()}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Alt text"
              onChange={(event) =>
                updateExperience((current) => ({
                  ...current,
                  translations: {
                    ...current.translations,
                    [selectedLocale]: {
                      ...current.translations[selectedLocale],
                      altText: event.target.value,
                    },
                  },
                }))
              }
              value={translation.altText}
            />
            <FieldGrid>
              <SelectField
                label="Media state"
                onChange={(event) =>
                  updateExperience((current) => ({
                    ...current,
                    media: {
                      ...current.media,
                      status: event.target
                        .value as AdminExperience["media"]["status"],
                    },
                  }))
                }
                value={experience.media.status}
              >
                <option value="missing">missing</option>
                <option value="processing">processing</option>
                <option value="ready">ready</option>
                <option value="failed">failed</option>
              </SelectField>
            </FieldGrid>
          </div>
        </Surface>
      </aside>
    </div>
  );
}

function StatusLine({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <Badge size="sm" tone={ready ? "emerald" : "amber"}>
        {ready ? "Ready" : "Open"}
      </Badge>
    </div>
  );
}
