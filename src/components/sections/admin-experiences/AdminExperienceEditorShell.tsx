import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/design/variants";

import {
  PublicationStatusBadge,
  ReadinessBadge,
} from "./AdminExperienceBadges";
import type {
  AdminExperience,
  AdminExperienceReadiness,
  AdminExperienceView,
} from "./AdminExperienceTypes";

type AdminExperienceEditorShellProps = {
  activeView: Exclude<AdminExperienceView, "create" | "list">;
  children: ReactNode;
  experience: AdminExperience;
  readiness: AdminExperienceReadiness;
};

const editorTabs: Array<{
  hrefSuffix: string;
  id: Exclude<AdminExperienceView, "create" | "list">;
  label: string;
}> = [
  { hrefSuffix: "", id: "overview", label: "Overview" },
  { hrefSuffix: "/content", id: "content", label: "Content & search" },
  { hrefSuffix: "/availability", id: "availability", label: "Availability" },
  { hrefSuffix: "/extras", id: "extras", label: "Extras" },
  { hrefSuffix: "/media", id: "media", label: "Media" },
  { hrefSuffix: "/publish", id: "publish", label: "Publish" },
];

export function AdminExperienceEditorShell({
  activeView,
  children,
  experience,
  readiness,
}: AdminExperienceEditorShellProps) {
  const publicPath = experience.translations.en.publicPageEnabled
    ? `/en/experiences/${experience.translations.en.slug}`
    : "";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <Link
              className="inline-flex min-h-8 items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
              href="/admin/experiences"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Experiences
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-normal text-slate-950">
                {experience.internalName}
              </h1>
              <PublicationStatusBadge status={experience.status} />
              <ReadinessBadge score={readiness.score} />
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Configure the product sold on the public site: booking rules,
              localized content, media and publication readiness.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {publicPath ? (
              <Button href={publicPath} variant="secondary">
                <ExternalLink className="size-4" aria-hidden="true" />
                Preview
              </Button>
            ) : null}
            <Button href="/admin/experiences/new" variant="primary">
              New experience
            </Button>
          </div>
        </div>

        <nav
          aria-label="Experience sections"
          className="-mx-1 flex overflow-x-auto px-1"
        >
          <div className="flex min-w-max gap-2">
            {editorTabs.map((tab) => (
              <a
                aria-current={tab.id === activeView ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-md px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700",
                  tab.id === activeView
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                )}
                href={`/admin/experiences/${experience.id}${tab.hrefSuffix}`}
                key={tab.id}
              >
                {tab.label}
              </a>
            ))}
          </div>
        </nav>
      </div>

      {children}
    </div>
  );
}
