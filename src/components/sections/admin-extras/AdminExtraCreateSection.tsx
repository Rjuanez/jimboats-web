import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  FieldGrid,
  NumberField,
  TextField,
} from "@/components/forms/AdminFormControls";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import type { AdminExtraCreateInput } from "./AdminExtraTypes";

type AdminExtraCreateSectionProps = {
  createExtra: (input: AdminExtraCreateInput) => Promise<string>;
};

export function AdminExtraCreateSection({
  createExtra,
}: AdminExtraCreateSectionProps) {
  const [form, setForm] = useState<AdminExtraCreateInput>({
    defaultNoticeHours: 24,
    name: "",
    price: 90,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            className="inline-flex min-h-8 items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            href="/admin/extras"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Extras
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950">
            New extra
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Create the operational draft first. Media can be attached after
            creation.
          </p>
        </div>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          setIsSubmitting(true);
          void createExtra(form)
            .then((createdId) => {
              window.location.assign(`/admin/extras/${createdId}`);
            })
            .catch((caughtError: unknown) => {
              setError(
                caughtError instanceof Error
                  ? caughtError.message
                  : "Could not create the extra.",
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
              disabled={!form.name.trim()}
              loading={isSubmitting}
              type="submit"
            >
              <Save className="size-4" aria-hidden="true" />
              Create
            </Button>
          }
          description="Draft extras are not selectable until they are marked active."
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
            <TextField
              label="Name"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              required
              value={form.name}
            />
            <FieldGrid>
              <NumberField
                label="Price"
                min={0}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    price: Number(event.target.value),
                  }))
                }
                value={form.price}
              />
              <NumberField
                label="Default notice hours"
                min={0}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    defaultNoticeHours: Number(event.target.value),
                  }))
                }
                value={form.defaultNoticeHours}
              />
            </FieldGrid>
          </div>
        </Surface>
      </form>
    </div>
  );
}
