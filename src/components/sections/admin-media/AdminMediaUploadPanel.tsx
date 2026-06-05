"use client";

import { UploadCloud } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useRef, useState } from "react";

import {
  FieldGrid,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/forms/AdminFormControls";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import type { AdminMediaCollection } from "./AdminMediaTypes";

type AdminMediaUploadPanelProps = {
  isSaving: boolean;
  uploadAsset: (input: FormData) => Promise<string | null>;
};

const collections: AdminMediaCollection[] = [
  "Experiences",
  "Extras",
  "Gallery",
  "Pages",
];

export function AdminMediaUploadPanel({
  isSaving,
  uploadAsset,
}: AdminMediaUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [collection, setCollection] =
    useState<AdminMediaCollection>("Experiences");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [altText, setAltText] = useState({
    ca: "",
    en: "",
    es: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0] ?? null;

    if (!file) {
      setLocalError("Choose an image before uploading.");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("title", title);
    formData.set("collection", collection);
    formData.set("altText.ca", altText.ca);
    formData.set("altText.en", altText.en);
    formData.set("altText.es", altText.es);

    const uploadedAssetId = await uploadAsset(formData);

    if (!uploadedAssetId) {
      return;
    }

    setTitle("");
    setSelectedFileName("");
    setAltText({ ca: "", en: "", es: "" });
    setLocalError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <Surface
      title="Upload media"
      description="Store a private original and queue the worker that will generate public variants."
    >
      <form className="space-y-4" onSubmit={submitUpload}>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <FieldGrid>
            <TextField
              label="Asset title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Sunset hero"
              required
              value={title}
            />
            <SelectField
              label="Collection"
              onChange={(event) =>
                setCollection(event.target.value as AdminMediaCollection)
              }
              value={collection}
            >
              {collections.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>
          </FieldGrid>

          <label className="block min-w-0">
            <span className="text-sm font-semibold text-slate-950">Image</span>
            <span className="mt-1.5 flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm transition hover:bg-slate-100">
              <span className="min-w-0 truncate text-slate-600">
                {selectedFileName || "JPEG, PNG or WebP"}
              </span>
              <UploadCloud
                className="size-4 shrink-0 text-slate-500"
                aria-hidden="true"
              />
              <input
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                name="file"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setSelectedFileName(event.target.files?.[0]?.name ?? "");
                  setLocalError(null);
                }}
                ref={fileInputRef}
                type="file"
              />
            </span>
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <TextAreaField
            label="EN alt text"
            onChange={(event) =>
              setAltText((current) => ({ ...current, en: event.target.value }))
            }
            value={altText.en}
          />
          <TextAreaField
            label="ES alt text"
            onChange={(event) =>
              setAltText((current) => ({ ...current, es: event.target.value }))
            }
            value={altText.es}
          />
          <TextAreaField
            label="CA alt text"
            onChange={(event) =>
              setAltText((current) => ({ ...current, ca: event.target.value }))
            }
            value={altText.ca}
          />
        </div>

        {localError ? (
          <p className="text-sm font-semibold text-rose-700" role="alert">
            {localError}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button loading={isSaving} type="submit">
            <UploadCloud className="size-4" aria-hidden="true" />
            Upload asset
          </Button>
        </div>
      </form>
    </Surface>
  );
}
