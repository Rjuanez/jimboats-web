import { describe, expect, it } from "vitest";

import {
  parseAdminMediaMetadata,
  parseAdminMediaUploadFormData,
} from "./adminMediaValidators";

describe("admin media validators", () => {
  it("parses a media upload form into an application command", async () => {
    const formData = new FormData();
    formData.set(
      "file",
      new File([new Uint8Array([1, 2, 3])], "sunset.png", {
        type: "image/png",
      }),
    );
    formData.set("title", "Sunset hero");
    formData.set("collection", "Experiences");
    formData.set("altText.en", "Private boat at sunset.");
    formData.set("altText.es", "Barco privado al atardecer.");
    formData.set("altText.ca", "Barca privada al capvespre.");

    const command = await parseAdminMediaUploadFormData(formData);

    expect(command).toMatchObject({
      altText: {
        ca: "Barca privada al capvespre.",
        en: "Private boat at sunset.",
        es: "Barco privado al atardecer.",
      },
      collection: "EXPERIENCES",
      file: {
        filename: "sunset.png",
        mimeType: "image/png",
      },
      title: "Sunset hero",
    });
    expect(command.file.contents).toEqual(new Uint8Array([1, 2, 3]));
  });

  it("rejects unsupported media upload mime types", async () => {
    const formData = new FormData();
    formData.set(
      "file",
      new File([new Uint8Array([1])], "sunset.gif", {
        type: "image/gif",
      }),
    );
    formData.set("title", "Sunset hero");
    formData.set("collection", "Experiences");

    await expect(parseAdminMediaUploadFormData(formData)).rejects.toThrow();
  });

  it("parses editable metadata into an application command", () => {
    const command = parseAdminMediaMetadata({
      altText: {
        ca: "",
        en: "Private boat at sunset.",
        es: "Barco privado al atardecer.",
      },
      assetId: "asset-sunset",
      collection: "Gallery",
      title: "Sunset hero",
    });

    expect(command).toEqual({
      altText: {
        ca: "",
        en: "Private boat at sunset.",
        es: "Barco privado al atardecer.",
      },
      assetId: "asset-sunset",
      collection: "GALLERY",
      title: "Sunset hero",
    });
  });
});
