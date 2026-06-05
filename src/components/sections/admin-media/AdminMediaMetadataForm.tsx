"use client";

import { Save } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import {
  FieldGrid,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/forms/AdminFormControls";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import type {
  AdminMediaAsset,
  AdminMediaCollection,
  AdminMediaMetadataInput,
} from "./AdminMediaTypes";

type AdminMediaMetadataFormProps = {
  asset: AdminMediaAsset;
  isSaving: boolean;
  updateMetadata: (input: AdminMediaMetadataInput) => Promise<boolean>;
};

const collections: AdminMediaCollection[] = [
  "Experiences",
  "Extras",
  "Gallery",
  "Pages",
];

export function AdminMediaMetadataForm({
  asset,
  isSaving,
  updateMetadata,
}: AdminMediaMetadataFormProps) {
  const [title, setTitle] = useState(asset.title);
  const [collection, setCollection] = useState(asset.collection);
  const [altText, setAltText] = useState(asset.altText);

  async function submitMetadata(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateMetadata({
      altText,
      assetId: asset.id,
      collection,
      title,
    });
  }

  return (
    <Surface
      className="min-w-0"
      title="Editable metadata"
      description="Metadata is saved on the media asset and reused when the asset is attached to public content."
    >
      <form className="space-y-4" onSubmit={submitMetadata}>
        <FieldGrid>
          <TextField
            label="Asset title"
            onChange={(event) => setTitle(event.target.value)}
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

        <div className="flex justify-end">
          <Button loading={isSaving} type="submit">
            <Save className="size-4" aria-hidden="true" />
            Save metadata
          </Button>
        </div>
      </form>
    </Surface>
  );
}
