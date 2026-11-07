"use client";
import { adminEs } from "@/i18n/admin/es";

import { CalendarPlus } from "lucide-react";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  FieldGrid,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/forms/AdminFormControls";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import type {
  AdminBookingActions,
  AdminBookingCreateInput,
  AdminBookingExperienceOption,
  AdminBookingsState,
} from "./AdminBookingTypes";

type AdminBookingCreateSectionProps = {
  createBooking: (
    input: AdminBookingCreateInput,
  ) => ReturnType<AdminBookingActions["createBooking"]>;
  isSaving: boolean;
  state: AdminBookingsState;
};

export function AdminBookingCreateSection({
  createBooking,
  isSaving,
  state,
}: AdminBookingCreateSectionProps) {
  const [form, setForm] = useState(() => createDefaultForm(state));
  const selectedExperience = useMemo(
    () =>
      state.experienceOptions.find((experience) => {
        return experience.id === form.experienceId;
      }) ?? state.experienceOptions[0],
    [form.experienceId, state.experienceOptions],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createBooking(form);

    if (result.ok) {
      setForm(createDefaultForm(result.data.state));
    }
  }

  function updateExperience(experienceId: string) {
    const experience = state.experienceOptions.find((candidate) => {
      return candidate.id === experienceId;
    });
    const slot = experience?.slots[0] ?? null;

    setForm((current) => ({
      ...current,
      endTime: slot?.endTime ?? current.endTime,
      experienceId,
      slotKey: slot?.id ?? null,
      startTime: slot?.startTime ?? current.startTime,
    }));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
            {adminEs["Bookings"]}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            {adminEs["Create booking"]}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {
              adminEs[
                "Manual bookings are confirmed with the deposit marked as paid and block the boat calendar."
              ]
            }
          </p>
        </div>
        <Button href="/admin/bookings" variant="secondary">
          {adminEs["Back to bookings"]}
        </Button>
      </div>

      <form className="space-y-5" onSubmit={submit}>
        <Surface
          description={
            adminEs[
              "Choose the experience and the concrete local departure slot."
            ]
          }
          title={adminEs["Experience and slot"]}
        >
          <div className="space-y-4">
            <FieldGrid>
              <SelectField
                label={adminEs["Experience"]}
                onChange={(event) => updateExperience(event.target.value)}
                value={form.experienceId}
              >
                {state.experienceOptions.map((experience) => (
                  <option key={experience.id} value={experience.id}>
                    {experience.name}
                  </option>
                ))}
              </SelectField>
              <NumberField
                label={adminEs["Guests"]}
                min={1}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    guestCount: Number(event.target.value),
                  }))
                }
                value={form.guestCount}
              />
            </FieldGrid>

            {selectedExperience ? (
              <ExperienceHint experience={selectedExperience} />
            ) : null}

            <FieldGrid columns={4}>
              <TextField
                label={adminEs["Date"]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    localDate: event.target.value,
                  }))
                }
                pattern="\d{4}-\d{2}-\d{2}"
                placeholder="2026-06-10"
                value={form.localDate}
              />
              <SelectField
                disabled={!selectedExperience?.slots.length}
                label={adminEs["Slot"]}
                onChange={(event) => {
                  const slot = selectedExperience?.slots.find((candidate) => {
                    return candidate.id === event.target.value;
                  });

                  setForm((current) => ({
                    ...current,
                    endTime: slot?.endTime ?? current.endTime,
                    slotKey: slot?.id ?? null,
                    startTime: slot?.startTime ?? current.startTime,
                  }));
                }}
                value={form.slotKey ?? ""}
              >
                {selectedExperience?.slots.length ? (
                  selectedExperience.slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.label}
                    </option>
                  ))
                ) : (
                  <option value="">{adminEs["Manual time"]}</option>
                )}
              </SelectField>
              <TextField
                label={adminEs["Start time"]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    startTime: event.target.value,
                  }))
                }
                pattern="([01]\d|2[0-3]):[0-5]\d"
                placeholder="10:00"
                value={form.startTime}
              />
              <TextField
                label={adminEs["End time"]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    endTime: event.target.value,
                  }))
                }
                pattern="([01]\d|2[0-3]):[0-5]\d"
                placeholder="14:00"
                value={form.endTime}
              />
            </FieldGrid>
          </div>
        </Surface>

        <Surface title={adminEs["Customer"]}>
          <div className="space-y-4">
            <FieldGrid>
              <TextField
                label={adminEs["Full name"]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    customerName: event.target.value,
                  }))
                }
                value={form.customerName}
              />
              <TextField
                label={adminEs["Email"]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    customerEmail: event.target.value,
                  }))
                }
                value={form.customerEmail}
              />
              <TextField
                label={adminEs["Phone"]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    customerPhone: event.target.value,
                  }))
                }
                value={form.customerPhone}
              />
            </FieldGrid>
            <TextAreaField
              label={adminEs["Customer notes"]}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  customerNotes: event.target.value,
                }))
              }
              value={form.customerNotes}
            />
          </div>
        </Surface>

        <Surface
          description={
            adminEs[
              "Only extras configured as active and selectable can be accepted by the server."
            ]
          }
          title={adminEs["Extras"]}
        >
          {state.extraOptions.length === 0 ? (
            <p className="text-sm text-slate-600">
              {adminEs["No active extras available."]}
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {state.extraOptions.map((extra) => (
                <NumberField
                  description={adminEs.euros(extra.price)}
                  key={extra.id}
                  label={extra.name}
                  min={0}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      selectedExtras: upsertExtraQuantity(
                        current.selectedExtras,
                        extra.id,
                        Number(event.target.value),
                      ),
                    }))
                  }
                  value={
                    form.selectedExtras.find((selected) => {
                      return selected.extraId === extra.id;
                    })?.quantity ?? 0
                  }
                />
              ))}
            </div>
          )}
        </Surface>

        <Surface title={adminEs["Internal notes"]}>
          <TextAreaField
            label={adminEs["Staff notes"]}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                internalNotes: event.target.value,
              }))
            }
            value={form.internalNotes}
          />
        </Surface>

        <div className="flex flex-wrap gap-3">
          <Button disabled={isSaving} loading={isSaving} type="submit">
            <CalendarPlus className="size-4" aria-hidden="true" />
            {adminEs["Create booking"]}
          </Button>
          <Button href="/admin/bookings" variant="secondary">
            {adminEs["Cancel"]}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ExperienceHint({
  experience,
}: {
  experience: AdminBookingExperienceOption;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge tone="sky">{adminEs.euros(experience.basePrice)}</Badge>
      <Badge tone="emerald">
        {adminEs.euros(experience.depositAmount)} {adminEs["deposit"]}
      </Badge>
      <Badge tone="neutral">
        {experience.capacity} {adminEs["max guests"]}
      </Badge>
      <Badge tone="neutral">
        {experience.availableDurations
          ? experience.availableDurations.join(" / ")
          : experience.durationMinutes / 60}{" "}
        {adminEs["hours"]}
      </Badge>
    </div>
  );
}

function createDefaultForm(state: AdminBookingsState): AdminBookingCreateInput {
  const experience = state.experienceOptions[0];
  const slot = experience?.slots[0] ?? null;

  return {
    customerEmail: "",
    customerName: "",
    customerNotes: "",
    customerPhone: "",
    endTime: slot?.endTime ?? "14:00",
    experienceId: experience?.id ?? "",
    guestCount: 1,
    internalNotes: "",
    localDate: "2026-06-10",
    selectedExtras: [],
    slotKey: slot?.id ?? null,
    startTime: slot?.startTime ?? "10:00",
  };
}

function upsertExtraQuantity(
  selectedExtras: AdminBookingCreateInput["selectedExtras"],
  extraId: string,
  quantity: number,
) {
  const next = selectedExtras.filter(
    (selected) => selected.extraId !== extraId,
  );

  if (quantity > 0) {
    next.push({ extraId, quantity });
  }

  return next;
}
