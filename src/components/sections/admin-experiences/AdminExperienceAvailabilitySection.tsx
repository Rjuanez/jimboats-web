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

import { hasOverlappingSlots } from "./AdminExperienceReadiness";
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
  const overlaps = hasOverlappingSlots(experience);

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
              onChange={(event) =>
                updateExperience((current) => ({
                  ...current,
                  slotPolicyType: event.target.value as AdminSlotPolicyType,
                }))
              }
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

      <Surface
        action={
          <Button
            onClick={() =>
              updateExperience((current) => ({
                ...current,
                slots: [
                  ...current.slots,
                  {
                    enabled: true,
                    endTime: "12:00",
                    id: `${current.id}-slot-${current.slots.length + 1}`,
                    label: "New departure",
                    startTime: "10:00",
                  },
                ],
              }))
            }
            variant="secondary"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add slot
          </Button>
        }
        description="Enabled slots become selectable templates. Booked selected slots and manual calendar blocks must never overlap."
        title="Fixed slot templates"
      >
        <div className="space-y-4">
          {overlaps ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
              Enabled slots overlap. Adjust times before publishing.
            </div>
          ) : (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              Enabled slot templates do not overlap.
            </div>
          )}

          {experience.slots.map((slot) => (
            <SlotEditor
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

          {experience.slots.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
              No fixed slot templates yet.
            </div>
          ) : null}
        </div>
      </Surface>

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

function SlotEditor({
  onRemove,
  onUpdate,
  slot,
}: {
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
          icon={<Trash2 className="size-4" aria-hidden="true" />}
          label={`Remove ${slot.label}`}
          onClick={onRemove}
        />
      </div>
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
