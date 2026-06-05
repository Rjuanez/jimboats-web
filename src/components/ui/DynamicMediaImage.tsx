"use client";

import type { ImgHTMLAttributes, ReactNode } from "react";
import { useState } from "react";

import { cn } from "@/design/variants";

export type DynamicMediaImageVariant = {
  publicUrl: string;
  width: number;
};

type DynamicMediaImageProps = {
  alt: string;
  className?: string;
  fallback?: ReactNode;
  imageClassName?: string;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  sizes?: string;
  src: string;
  variants?: DynamicMediaImageVariant[];
};

export function DynamicMediaImage({
  alt,
  className,
  fallback,
  imageClassName,
  loading = "lazy",
  sizes,
  src,
  variants = [],
}: DynamicMediaImageProps) {
  const [failed, setFailed] = useState(false);
  const srcSet = buildSrcSet(variants);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-slate-100 text-slate-700",
          className,
        )}
      >
        {fallback}
      </div>
    );
  }

  return (
    <picture className={cn("block h-full w-full", className)}>
      {srcSet ? (
        <source sizes={sizes} srcSet={srcSet} type="image/webp" />
      ) : null}
      <img
        alt={alt}
        className={cn("h-full w-full object-cover", imageClassName)}
        decoding="async"
        loading={loading}
        onError={() => setFailed(true)}
        sizes={sizes}
        src={src}
      />
    </picture>
  );
}

function buildSrcSet(variants: DynamicMediaImageVariant[]) {
  return variants
    .filter((variant) => variant.publicUrl && variant.width > 0)
    .map((variant) => `${variant.publicUrl} ${variant.width}w`)
    .join(", ");
}
