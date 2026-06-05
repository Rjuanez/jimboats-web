import { Plus, Trash2 } from "lucide-react";

import {
  CheckboxField,
  FieldGrid,
  NumberField,
  SelectField,
  TextField,
} from "@/components/forms/AdminFormControls";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Surface } from "@/components/ui/Surface";

import {
  getFixedSlotIssues,
  getFlexibleAvailabilityIssues,
} from "./AdminExperienceReadiness";
import type {
  AdminExperience,
  AdminExperienceMutation,
  AdminExperienceSlot,
  AdminSlotPolicyType,
} from "./AdminExperienceTypes";

type AdminExperienceAvailabilitySectionProps = {
  experience: AdminExperience;
  updateExperience: AdminExperienceMutation;
};

const slotPolicyOptions: Array<{
  label: string;
  value: AdminSlotPolicyType;
}> = [
  { label: "Fixed slots", value: "fixed_slots" },
  { label: "Any available time", value: "any_available" },
  { label: "Manual approval", value: "manual_approval" },
];

export function AdminExperienceAvailabilitySection({
  experience,
  updateExperience,
}: AdminExperienceAvailabilitySectionProps) {
  return (
    <div className="space-y-5">
      <Surface
        description="Configure how this experience can be placed in the only boat calendar."
        title="Booking policy"
      >
        <div className="space-y-4">
          <FieldGrid columns={3}>
            <SelectField
              label="Slot policy"
              onChange={(event) => {
                const nextPolicy = event.target.value as AdminSlotPolicyType;

                updateExperience((current) => ({
                  ...current,
                  slots:
                    nextPolicy === "fixed_slots" && current.slots.length === 0
                      ? [createSuggestedSlot(current)]
                      : current.slots,
                  slotPolicyType: nextPolicy,
                }));
              }}
              value={experience.slotPolicyType}
            >
              {slotPolicyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <NumberField
              label="Buffer minutes"
              min={0}
              onChange={(event) =>
                updateExperience((current) => ({
                  ...current,
                  bufferMinutes: Number(event.target.value),
                }))
              }
              value={experience.bufferMinutes}
            />
            <NumberField
              label="Minimum advance hours"
              min={1}
              onChange={(event) =>
                updateExperience((current) => ({
                  ...current,
                  minAdvanceHours: Number(event.target.value),
                }))
              }
              value={experience.minAdvanceHours}
            />
          </FieldGrid>
          <FieldGrid>
            <NumberField
              label="Maximum advance months"
              max={6}
              min={1}
              onChange={(event) =>
                updateExperience((current) => ({
                  ...current,
                  maxAdvanceMonths: Number(event.target.value),
                }))
              }
              value={experience.maxAdvanceMonths}
            />
            <CheckboxField
              checked={experience.allowManualScheduling}
              description="Staff can place this experience outside fixed public slots."
              label="Allow manual scheduling"
              onChange={(event) =>
                updateExperience((current) => ({
                  ...current,
                  allowManualScheduling: event.target.checked,
                }))
              }
            />
          </FieldGrid>
        </div>
      </Surface>

      {experience.slotPolicyType === "fixed_slots" ? (
        <FixedSlotsPanel
          experience={experience}
          updateExperience={updateExperience}
        />
      ) : null}

      {experience.slotPolicyType === "any_available" ? (
        <FlexibleAvailabilityPanel
          experience={experience}
          updateExperience={updateExperience}
        />
      ) : null}

      {experience.slotPolicyType === "manual_approval" ? (
        <ManualApprovalPanel />
      ) : null}

      <Surface title="Calendar guardrails">
        <div className="grid gap-3 sm:grid-cols-3">
          <Guardrail label="Single boat" value="No overlaps allowed" />
          <Guardrail
            label="Manual blocks"
            value="Block availability from calendar"
          />
          <Guardrail
            label="Checkout hold"
            value="15 minutes before payment expires"
          />
        </div>
      </Surface>
    </div>
  );
}

function FixedSlotsPanel({
  experience,
  updateExperience,
}: AdminExperienceAvailabilitySectionProps) {
  const issues = getFixedSlotIssues(experience);
  const enabledSlotCount = experience.slots.filter(
    (slot) => slot.enabled,
  ).length;

  return (
    <Surface
      action={
        <Button
          onClick={() =>
            updateExperience((current) => ({
              ...current,
              slots: [...current.slots, createSuggestedSlot(current)],
            }))
          }
          variant="secondary"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add fixed slot
        </Button>
      }
      description="Enabled slots become selectable templates for public bookings."
      title="Fixed slot templates"
    >
      <div className="space-y-4">
        <AvailabilityStatus
          issues={issues}
          successMessage="Enabled slot templates are ready."
        />

        {experience.slots.map((slot) => (
          <SlotEditor
            canDisable={!slot.enabled || enabledSlotCount > 1}
            canRemove={
              experience.slots.length > 1 &&
              (!slot.enabled || enabledSlotCount > 1)
            }
            key={slot.id}
            onRemove={() =>
              updateExperience((current) => ({
                ...current,
                slots: current.slots.filter((item) => item.id !== slot.id),
              }))
            }
            onUpdate={(nextSlot) =>
              updateExperience((current) => ({
                ...current,
                slots: current.slots.map((item) => {
                  if (item.id !== slot.id) {
                    return item;
                  }

                  return nextSlot;
                }),
              }))
            }
            slot={slot}
          />
        ))}
      </div>
    </Surface>
  );
}

function FlexibleAvailabilityPanel({
  experience,
  updateExperience,
}: AdminExperienceAvailabilitySectionProps) {
  const issues = getFlexibleAvailabilityIssues(experience);

  return (
    <Surface
      description="Public start times are generated from this daily operating window."
      title="Flexible availability"
    >
      <div className="space-y-4">
        <AvailabilityStatus
          issues={issues}
          successMessage="Flexible availability is ready."
        />
        <FieldGrid columns={3}>
          <TextField
            label="Window start"
            onChange={(event) =>
              updateExperience((current) => ({
                ...current,
                flexibleAvailability: {
                  ...current.flexibleAvailability,
                  startTime: event.target.value,
                },
              }))
            }
            value={experience.flexibleAvailability.startTime}
          />
          <TextField
            label="Window end"
            onChange={(event) =>
              updateExperience((current) => ({
                ...current,
                flexibleAvailability: {
                  ...current.flexibleAvailability,
                  endTime: event.target.value,
                },
              }))
            }
            value={experience.flexibleAvailability.endTime}
          />
          <NumberField
            label="Flexible step minutes"
            min={1}
            onChange={(event) =>
              updateExperience((current) => ({
                ...current,
                flexibleAvailability: {
                  ...current.flexibleAvailability,
                  granularityMinutes: Number(event.target.value),
                },
              }))
            }
            value={experience.flexibleAvailability.granularityMinutes}
          />
        </FieldGrid>
      </div>
    </Surface>
  );
}

function ManualApprovalPanel() {
  return (
    <Surface
      description="Requests are kept out of automatic slot selection and staff confirms the final schedule."
      title="Manual approval"
    >
      <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold leading-6 text-sky-900">
        Manual approval is active for this experience.
      </div>
    </Surface>
  );
}

function SlotEditor({
  canDisable,
  canRemove,
  onRemove,
  onUpdate,
  slot,
}: {
  canDisable: boolean;
  canRemove: boolean;
  onRemove: () => void;
  onUpdate: (slot: AdminExperienceSlot) => void;
  slot: AdminExperienceSlot;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <FieldGrid columns={4}>
            <CheckboxField
              checked={slot.enabled}
              disabled={!canDisable}
              label="Enabled"
              onChange={(event) =>
                onUpdate({
                  ...slot,
                  enabled: event.target.checked,
                })
              }
            />
            <TextField
              label="Label"
              onChange={(event) =>
                onUpdate({
                  ...slot,
                  label: event.target.value,
                })
              }
              value={slot.label}
            />
            <TextField
              label="Start time"
              onChange={(event) =>
                onUpdate({
                  ...slot,
                  startTime: event.target.value,
                })
              }
              value={slot.startTime}
            />
            <TextField
              label="End time"
              onChange={(event) =>
                onUpdate({
                  ...slot,
                  endTime: event.target.value,
                })
              }
              value={slot.endTime}
            />
          </FieldGrid>
        </div>
        <IconButton
          disabled={!canRemove}
          icon={<Trash2 className="size-4" aria-hidden="true" />}
          label={`Remove ${slot.label || "slot"}`}
          onClick={onRemove}
        />
      </div>
    </div>
  );
}

function AvailabilityStatus({
  issues,
  successMessage,
}: {
  issues: string[];
  successMessage: string;
}) {
  if (issues.length === 0) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
        {successMessage}
      </div>
    );
  }

  return (
    <div
      className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-800"
      role="alert"
    >
      {issues.join(" ")}
    </div>
  );
}

function Guardrail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{label}</p>
        <Badge tone="sky">Rule</Badge>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{value}</p>
    </div>
  );
}

function createSuggestedSlot(experience: AdminExperience): AdminExperienceSlot {
  const duration = Math.max(30, experience.durationMinutes);
  const latestStart = 22 * 60 - duration;

  for (let start = 8 * 60; start <= latestStart; start += 30) {
    const end = start + duration;

    if (!overlapsExistingSlot(experience.slots, start, end)) {
      return {
        enabled: true,
        endTime: minutesToTime(end),
        id: uniqueSlotId(experience, `slot-${minutesToSlotKey(start)}`),
        label: `Departure ${minutesToTime(start)}`,
        startTime: minutesToTime(start),
      };
    }
  }

  const fallbackStart = 10 * 60;
  const fallbackEnd = Math.min(23 * 60, fallbackStart + duration);

  return {
    enabled: true,
    endTime: minutesToTime(fallbackEnd),
    id: uniqueSlotId(experience, `slot-${experience.slots.length + 1}`),
    label: "New departure",
    startTime: minutesToTime(fallbackStart),
  };
}

function overlapsExistingSlot(
  slots: AdminExperienceSlot[],
  startMinutes: number,
  endMinutes: number,
) {
  return slots.some((slot) => {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);

    if (slotStart < 0 || slotEnd <= slotStart) {
      return false;
    }

    return startMinutes < slotEnd && slotStart < endMinutes;
  });
}

function uniqueSlotId(experience: AdminExperience, baseId: string) {
  const usedIds = new Set(experience.slots.map((slot) => slot.id));

  if (!usedIds.has(baseId)) {
    return baseId;
  }

  for (let index = 2; index < 100; index += 1) {
    const candidate = `${baseId}-${index}`;

    if (!usedIds.has(candidate)) {
      return candidate;
    }
  }

  return `${baseId}-${experience.slots.length + 1}`;
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return -1;
  }

  return hour * 60 + minute;
}

function minutesToTime(minutes: number) {
  const hour = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const minute = (minutes % 60).toString().padStart(2, "0");

  return `${hour}:${minute}`;
}

function minutesToSlotKey(minutes: number) {
  return minutesToTime(minutes).replace(":", "");
}
