import {
  FieldGrid,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/forms/AdminFormControls";
import { Badge } from "@/components/ui/Badge";
import { DynamicMediaImage } from "@/components/ui/DynamicMediaImage";
import { Surface } from "@/components/ui/Surface";

import { MediaStatusBadge } from "./AdminExperienceBadges";
import type {
  AdminExperience,
  AdminExperienceMutation,
  AdminPublicationStatus,
} from "./AdminExperienceTypes";

type AdminExperienceOverviewSectionProps = {
  experience: AdminExperience;
  updateExperience: AdminExperienceMutation;
};

const statusOptions: AdminPublicationStatus[] = [
  "draft",
  "ready",
  "published",
  "archived",
];

export function AdminExperienceOverviewSection({
  experience,
  updateExperience,
}: AdminExperienceOverviewSectionProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <Surface
          description="Core offer data used by the public catalog and booking flow."
          title="General"
        >
          <div className="space-y-4">
            <FieldGrid>
              <TextField
                label="Internal name"
                onChange={(event) =>
                  updateExperience((current) => ({
                    ...current,
                    internalName: event.target.value,
                  }))
                }
                value={experience.internalName}
              />
              <TextField
                label="Experience type"
                onChange={(event) =>
                  updateExperience((current) => ({
                    ...current,
                    type: event.target.value,
                  }))
                }
                value={experience.type}
              />
            </FieldGrid>
            <FieldGrid columns={4}>
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
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </SelectField>
              <NumberField
                label="Display order"
                min={1}
                onChange={(event) =>
                  updateExperience((current) => ({
                    ...current,
                    displayOrder: Number(event.target.value),
                  }))
                }
                value={experience.displayOrder}
              />
              <NumberField
                label="Base price"
                min={0}
                onChange={(event) =>
                  updateExperience((current) => ({
                    ...current,
                    basePrice: Number(event.target.value),
                  }))
                }
                value={experience.basePrice}
              />
              <NumberField
                label="Deposit"
                min={0}
                onChange={(event) =>
                  updateExperience((current) => ({
                    ...current,
                    depositAmount: Number(event.target.value),
                  }))
                }
                value={experience.depositAmount}
              />
            </FieldGrid>
            <FieldGrid columns={3}>
              <NumberField
                label="Duration minutes"
                min={0}
                onChange={(event) =>
                  updateExperience((current) => ({
                    ...current,
                    durationMinutes: Number(event.target.value),
                  }))
                }
                value={experience.durationMinutes}
              />
              <NumberField
                label="Capacity"
                min={1}
                onChange={(event) =>
                  updateExperience((current) => ({
                    ...current,
                    capacity: Number(event.target.value),
                  }))
                }
                value={experience.capacity}
              />
              <TextField
                label="Departure port"
                onChange={(event) =>
                  updateExperience((current) => ({
                    ...current,
                    departurePort: event.target.value,
                  }))
                }
                value={experience.departurePort}
              />
            </FieldGrid>
          </div>
        </Surface>

        <Surface
          description="Operational notes for staff. Public localized copy lives in Content & search."
          title="Staff notes"
        >
          <div className="space-y-4">
            <TextAreaField
              label="Included items"
              onChange={(event) =>
                updateExperience((current) => ({
                  ...current,
                  includedInternal: event.target.value,
                }))
              }
              value={experience.includedInternal}
            />
            <TextAreaField
              label="Internal notes"
              onChange={(event) =>
                updateExperience((current) => ({
                  ...current,
                  internalNotes: event.target.value,
                }))
              }
              value={experience.internalNotes}
            />
          </div>
        </Surface>
      </div>

      <aside aria-label="Experience summary" className="space-y-5">
        <Surface title="Payment rule">
          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>
              Customers pay EUR {experience.depositAmount} online to confirm the
              booking.
            </p>
            <p>
              The remaining EUR{" "}
              {Math.max(experience.basePrice - experience.depositAmount, 0)} is
              paid in cash on board.
            </p>
            <Badge
              tone={experience.depositAmount === 100 ? "emerald" : "amber"}
            >
              Launch deposit EUR 100
            </Badge>
          </div>
        </Surface>

        <Surface title="Primary media">
          <div className="space-y-3">
            {experience.media.primaryImageUrl ? (
              <DynamicMediaImage
                alt=""
                className="aspect-[4/3] overflow-hidden rounded-md"
                fallback="Image unavailable"
                sizes="320px"
                src={experience.media.primaryImageUrl}
                variants={experience.media.variants}
              />
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-700">
                No image
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-semibold text-slate-950">
                {experience.media.filename || "No file selected"}
              </p>
              <MediaStatusBadge status={experience.media.status} />
            </div>
          </div>
        </Surface>
      </aside>
    </div>
  );
}
