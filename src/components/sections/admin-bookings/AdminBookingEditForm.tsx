"use client";
import { adminEs } from "@/i18n/admin/es";

import { Save } from "lucide-react";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  FieldGrid,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/forms/AdminFormControls";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import type {
  AdminBooking,
  AdminBookingActions,
  AdminBookingsState,
  AdminBookingUpdateInput,
} from "./AdminBookingTypes";

type AdminBookingEditFormProps = {
  booking: AdminBooking;
  isSaving: boolean;
  state: AdminBookingsState;
  updateBooking: (
    input: AdminBookingUpdateInput,
  ) => ReturnType<AdminBookingActions["updateBooking"]>;
};

export function AdminBookingEditForm({
  booking,
  isSaving,
  state,
  updateBooking,
}: AdminBookingEditFormProps) {
  const [form, setForm] = useState(() => createFormFromBooking(booking));
  const selectedExperience = useMemo(
    () =>
      state.experienceOptions.find((experience) => {
        return experience.id === form.experienceId;
      }),
    [form.experienceId, state.experienceOptions],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateBooking(form);
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <Surface
        description={
          adminEs[
            "Move the selected slot or adjust guest count. The calendar block is updated with the same save."
          ]
        }
        title={adminEs["Reservation"]}
      >
        <div className="space-y-4">
          <FieldGrid>
            <TextField
              disabled
              label={adminEs["Experience"]}
              value={booking.experienceName}
            />
            <NumberField
              disabled={booking.status !== "confirmed"}
              label={adminEs["Guests"]}
              max={selectedExperience?.capacity}
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

          <FieldGrid columns={4}>
            <TextField
              disabled={booking.status !== "confirmed"}
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
              disabled={
                booking.status !== "confirmed" ||
                !selectedExperience?.slots.length
              }
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
              disabled={booking.status !== "confirmed"}
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
              disabled={booking.status !== "confirmed"}
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

      <Surface
        ariaLabel={adminEs["Editable customer details"]}
        title={adminEs["Customer"]}
      >
        <div className="space-y-4">
          <FieldGrid>
            <TextField
              disabled={booking.status !== "confirmed"}
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
              disabled={booking.status !== "confirmed"}
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
              disabled={booking.status !== "confirmed"}
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
          {booking.whatsappEnabled &&
          booking.whatsappPhone !== booking.customerPhone ? (
            <TextField
              disabled
              label={adminEs["WhatsApp pass"]}
              value={booking.whatsappPhone}
            />
          ) : null}
          <TextAreaField
            disabled={booking.status !== "confirmed"}
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
            "Changing extras refreshes the booking price snapshot and keeps the deposit/cash breakdown visible."
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
                disabled={booking.status !== "confirmed"}
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

      <Surface
        ariaLabel={adminEs["Editable internal notes"]}
        title={adminEs["Internal notes"]}
      >
        <TextAreaField
          disabled={booking.status !== "confirmed"}
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
        <Button
          disabled={booking.status !== "confirmed" || isSaving}
          loading={isSaving}
          type="submit"
        >
          <Save className="size-4" aria-hidden="true" />
          {adminEs["Save changes"]}
        </Button>
      </div>
    </form>
  );
}

function createFormFromBooking(booking: AdminBooking): AdminBookingUpdateInput {
  return {
    bookingId: booking.id,
    customerEmail: booking.customerEmail,
    customerName: booking.customerName,
    customerNotes: booking.customerNotes,
    customerPhone: booking.customerPhone,
    endTime: booking.endTime,
    experienceId: booking.experienceId,
    guestCount: booking.guestCount,
    internalNotes: booking.internalNotes,
    localDate: booking.localDate,
    selectedExtras: booking.extras.map((extra) => ({
      extraId: extra.extraId,
      quantity: extra.quantity,
    })),
    slotKey: booking.slotKey,
    startTime: booking.startTime,
  };
}

function upsertExtraQuantity(
  selectedExtras: AdminBookingUpdateInput["selectedExtras"],
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
