import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  FieldGrid,
  NumberField,
  TextAreaField,
  TextField,
} from "@/components/forms/AdminFormControls";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

type AdminExperienceCreateSectionProps = {
  createExperience: (input: {
    basePrice: number;
    capacity: number;
    durationMinutes: number;
    internalName: string;
    type: string;
  }) => Promise<string>;
};

export function AdminExperienceCreateSection({
  createExperience,
}: AdminExperienceCreateSectionProps) {
  const [form, setForm] = useState({
    basePrice: 290,
    capacity: 8,
    durationMinutes: 120,
    internalName: "",
    notes:
      "EUR 100 online deposit. Remaining amount paid in cash on board. Staff can adjust details before publishing.",
    type: "Private charter",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            className="inline-flex min-h-8 items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            href="/admin/experiences"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Experiences
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950">
            New experience
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Start with the operational data. Content, media, slots and extras
            can be configured after creation.
          </p>
        </div>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          setIsSubmitting(true);
          void createExperience(form)
            .then((createdId) => {
              window.location.assign(`/admin/experiences/${createdId}`);
            })
            .catch((caughtError: unknown) => {
              setError(
                caughtError instanceof Error
                  ? caughtError.message
                  : "Could not create the experience.",
              );
            })
            .finally(() => {
              setIsSubmitting(false);
            });
        }}
      >
        <Surface
          action={
            <Button
              disabled={!form.internalName.trim()}
              loading={isSubmitting}
              type="submit"
            >
              <Save className="size-4" aria-hidden="true" />
              Create
            </Button>
          }
          description="These fields define the first valid draft."
          title="Base configuration"
        >
          <div className="space-y-4">
            {error ? (
              <div
                className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800"
                role="alert"
              >
                {error}
              </div>
            ) : null}
            <FieldGrid>
              <TextField
                label="Internal name"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    internalName: event.target.value,
                  }))
                }
                required
                value={form.internalName}
              />
              <TextField
                label="Experience type"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target.value,
                  }))
                }
                value={form.type}
              />
            </FieldGrid>
            <FieldGrid columns={3}>
              <NumberField
                label="Base price"
                min={0}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    basePrice: Number(event.target.value),
                  }))
                }
                value={form.basePrice}
              />
              <NumberField
                label="Duration minutes"
                min={0}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    durationMinutes: Number(event.target.value),
                  }))
                }
                value={form.durationMinutes}
              />
              <NumberField
                label="Capacity"
                min={1}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    capacity: Number(event.target.value),
                  }))
                }
                value={form.capacity}
              />
            </FieldGrid>
            <TextAreaField
              label="Setup notes"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              value={form.notes}
            />
          </div>
        </Surface>
      </form>
    </div>
  );
}
