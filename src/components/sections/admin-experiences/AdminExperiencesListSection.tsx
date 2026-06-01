import { Archive, Copy, Pencil, Plus, Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { TextField } from "@/components/forms/AdminFormControls";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Surface } from "@/components/ui/Surface";
import { cn } from "@/design/variants";

import {
  MediaStatusBadge,
  PublicationStatusBadge,
  ReadinessBadge,
  TranslationStatusBadge,
} from "./AdminExperienceBadges";
import { getExperienceReadiness } from "./AdminExperienceReadiness";
import type {
  AdminExperience,
  AdminExperiencesState,
  AdminPublicationStatus,
} from "./AdminExperienceTypes";

type AdminExperiencesListSectionProps = {
  archiveExperience: (experienceId: string) => Promise<void>;
  duplicateExperience: (experienceId: string) => Promise<string>;
  state: AdminExperiencesState;
};

const statusOptions: Array<AdminPublicationStatus | "all"> = [
  "all",
  "draft",
  "ready",
  "published",
  "archived",
];

function formatDurationMinutes(durationMinutes: number) {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}m`;
}

export function AdminExperiencesListSection({
  archiveExperience,
  duplicateExperience,
  state,
}: AdminExperiencesListSectionProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    AdminPublicationStatus | "all"
  >("all");

  const filteredExperiences = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return state.experiences
      .filter((experience) => {
        if (statusFilter !== "all" && experience.status !== statusFilter) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return (
          experience.internalName.toLowerCase().includes(normalizedQuery) ||
          experience.type.toLowerCase().includes(normalizedQuery) ||
          experience.id.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((left, right) => left.displayOrder - right.displayOrder);
  }, [query, state.experiences, statusFilter]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Catalog
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-normal text-slate-950">
            Experiences
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Manage the configurable products that customers can book: pricing,
            schedules, extras, media and public content readiness.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/admin/experiences/new">
            <Plus className="size-4" aria-hidden="true" />
            New experience
          </Button>
        </div>
      </header>

      <ExperienceStats experiences={state.experiences} />

      <Surface
        title="Catalog workspace"
        description="Search, review readiness and open an experience to edit its configuration."
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-lg flex-1">
            <TextField
              label="Search experiences"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, type or id"
              value={query}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                aria-pressed={statusFilter === status}
                className={cn(
                  "min-h-10 rounded-md border px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700",
                  statusFilter === status
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
                )}
                key={status}
                onClick={() => setStatusFilter(status)}
                type="button"
              >
                {status === "all" ? "All" : status}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                <th className="px-3 py-3 font-semibold">Experience</th>
                <th className="px-3 py-3 font-semibold">Price</th>
                <th className="px-3 py-3 font-semibold">Booking</th>
                <th className="px-3 py-3 font-semibold">Content</th>
                <th className="px-3 py-3 font-semibold">Media</th>
                <th className="px-3 py-3 font-semibold">Readiness</th>
                <th className="px-3 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExperiences.map((experience) => (
                <ExperienceRow
                  archiveExperience={archiveExperience}
                  duplicateExperience={duplicateExperience}
                  experience={experience}
                  key={experience.id}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid gap-3 lg:hidden">
          {filteredExperiences.map((experience) => (
            <ExperienceMobileCard
              archiveExperience={archiveExperience}
              duplicateExperience={duplicateExperience}
              experience={experience}
              key={experience.id}
            />
          ))}
        </div>

        {filteredExperiences.length === 0 ? (
          <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
            <Search
              className="mx-auto size-6 text-slate-400"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-semibold text-slate-950">
              No experiences match these filters.
            </p>
          </div>
        ) : null}
      </Surface>
    </div>
  );
}

function ExperienceStats({ experiences }: { experiences: AdminExperience[] }) {
  const publishedCount = experiences.filter((experience) => {
    return experience.status === "published";
  }).length;
  const readyCount = experiences.filter((experience) => {
    return getExperienceReadiness(experience).score >= 80;
  }).length;
  const draftCount = experiences.filter((experience) => {
    return experience.status === "draft";
  }).length;

  const stats = [
    { label: "Experiences", value: experiences.length },
    { label: "Published", value: publishedCount },
    { label: "Ready score +80", value: readyCount },
    { label: "Drafts", value: draftCount },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm"
          key={stat.label}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            {stat.label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function ExperienceRow({
  archiveExperience,
  duplicateExperience,
  experience,
}: {
  archiveExperience: (experienceId: string) => Promise<void>;
  duplicateExperience: (experienceId: string) => Promise<string>;
  experience: AdminExperience;
}) {
  const readiness = getExperienceReadiness(experience);

  return (
    <tr className="border-b border-slate-200 align-top">
      <td className="px-3 py-4">
        <div className="flex items-center gap-3">
          <ExperienceThumb experience={experience} />
          <div className="min-w-0">
            <a
              className="font-semibold text-slate-950 transition hover:text-sky-700"
              href={`/admin/experiences/${experience.id}`}
            >
              {experience.internalName}
            </a>
            <p className="mt-1 text-xs text-slate-500">{experience.type}</p>
            <div className="mt-2">
              <PublicationStatusBadge status={experience.status} />
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-4 font-semibold text-slate-950">
        EUR {experience.basePrice}
        <p className="mt-1 text-xs font-normal text-slate-500">
          Deposit EUR {experience.depositAmount}
        </p>
      </td>
      <td className="px-3 py-4 text-slate-600">
        {formatDurationMinutes(experience.durationMinutes)} ·{" "}
        {experience.capacity} guests
        <p className="mt-1 text-xs text-slate-500">
          {experience.slotPolicyType.replace("_", " ")}
        </p>
      </td>
      <td className="px-3 py-4">
        <div className="flex flex-wrap gap-1.5">
          {Object.values(experience.translations).map((translation) => (
            <TranslationStatusBadge
              key={translation.locale}
              status={translation.status}
            />
          ))}
        </div>
      </td>
      <td className="px-3 py-4">
        <MediaStatusBadge status={experience.media.status} />
      </td>
      <td className="px-3 py-4">
        <ReadinessBadge score={readiness.score} />
      </td>
      <td className="px-3 py-4">
        <div className="flex justify-end gap-2">
          <IconButton
            href={`/admin/experiences/${experience.id}`}
            icon={<Pencil className="size-4" aria-hidden="true" />}
            label={`Edit ${experience.internalName}`}
          />
          <IconButton
            icon={<Copy className="size-4" aria-hidden="true" />}
            label={`Duplicate ${experience.internalName}`}
            onClick={() => {
              void duplicateExperience(experience.id);
            }}
          />
          <IconButton
            icon={<Archive className="size-4" aria-hidden="true" />}
            label={`Archive ${experience.internalName}`}
            onClick={() => {
              void archiveExperience(experience.id);
            }}
          />
        </div>
      </td>
    </tr>
  );
}

function ExperienceMobileCard({
  archiveExperience,
  duplicateExperience,
  experience,
}: {
  archiveExperience: (experienceId: string) => Promise<void>;
  duplicateExperience: (experienceId: string) => Promise<string>;
  experience: AdminExperience;
}) {
  const readiness = getExperienceReadiness(experience);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <ExperienceThumb experience={experience} />
        <div className="min-w-0 flex-1">
          <a
            className="font-semibold text-slate-950"
            href={`/admin/experiences/${experience.id}`}
          >
            {experience.internalName}
          </a>
          <p className="mt-1 text-sm text-slate-500">{experience.type}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <PublicationStatusBadge status={experience.status} />
            <ReadinessBadge score={readiness.score} />
            <MediaStatusBadge status={experience.media.status} />
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Metric label="Price" value={`EUR ${experience.basePrice}`} />
        <Metric
          label="Booking"
          value={`${formatDurationMinutes(experience.durationMinutes)} · ${experience.capacity}`}
        />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <IconButton
          href={`/admin/experiences/${experience.id}`}
          icon={<Pencil className="size-4" aria-hidden="true" />}
          label={`Edit ${experience.internalName}`}
        />
        <IconButton
          icon={<Copy className="size-4" aria-hidden="true" />}
          label={`Duplicate ${experience.internalName}`}
          onClick={() => {
            void duplicateExperience(experience.id);
          }}
        />
        <IconButton
          icon={<Archive className="size-4" aria-hidden="true" />}
          label={`Archive ${experience.internalName}`}
          onClick={() => {
            void archiveExperience(experience.id);
          }}
        />
      </div>
    </article>
  );
}

function ExperienceThumb({ experience }: { experience: AdminExperience }) {
  if (!experience.media.primaryImageUrl) {
    return (
      <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-500">
        No image
      </div>
    );
  }

  return (
    <Image
      alt=""
      className="size-16 shrink-0 rounded-md object-cover"
      height={64}
      src={experience.media.primaryImageUrl}
      width={64}
    />
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}
