import { Badge } from "@/components/ui/Badge";

import type {
  AdminMediaStatus,
  AdminPublicationStatus,
  AdminTranslationStatus,
} from "./AdminExperienceTypes";

export function PublicationStatusBadge({
  status,
}: {
  status: AdminPublicationStatus;
}) {
  const labels = {
    archived: "Archived",
    draft: "Draft",
    published: "Published",
    ready: "Ready",
  } satisfies Record<AdminPublicationStatus, string>;

  return <Badge tone={publicationTone(status)}>{labels[status]}</Badge>;
}

export function TranslationStatusBadge({
  status,
}: {
  status: AdminTranslationStatus;
}) {
  const labels = {
    draft: "Draft",
    missing: "Missing",
    needs_review: "Review",
    published: "Published",
    ready: "Ready",
  } satisfies Record<AdminTranslationStatus, string>;

  return (
    <Badge size="sm" tone={translationTone(status)}>
      {labels[status]}
    </Badge>
  );
}

export function MediaStatusBadge({ status }: { status: AdminMediaStatus }) {
  const labels = {
    failed: "Failed",
    missing: "Missing",
    processing: "Processing",
    ready: "Ready",
  } satisfies Record<AdminMediaStatus, string>;

  return (
    <Badge size="sm" tone={mediaTone(status)}>
      {labels[status]}
    </Badge>
  );
}

export function ReadinessBadge({ score }: { score: number }) {
  if (score >= 90) {
    return <Badge tone="emerald">{score}% ready</Badge>;
  }

  if (score >= 70) {
    return <Badge tone="amber">{score}% ready</Badge>;
  }

  return <Badge tone="rose">{score}% ready</Badge>;
}

function publicationTone(status: AdminPublicationStatus) {
  if (status === "published" || status === "ready") {
    return "emerald";
  }

  if (status === "archived") {
    return "neutral";
  }

  return "amber";
}

function translationTone(status: AdminTranslationStatus) {
  if (status === "published" || status === "ready") {
    return "emerald";
  }

  if (status === "missing") {
    return "rose";
  }

  return "amber";
}

function mediaTone(status: AdminMediaStatus) {
  if (status === "ready") {
    return "emerald";
  }

  if (status === "failed" || status === "missing") {
    return "rose";
  }

  return "amber";
}
