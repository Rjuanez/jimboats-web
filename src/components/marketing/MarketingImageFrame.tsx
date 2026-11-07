import { cn } from "@/design/variants";

export type MarketingImage = {
  alt: string;
  height: number;
  sizes: string;
  src: string;
  srcSet: string;
  width: number;
};

type MarketingImageFrameProps = {
  className?: string;
  image: MarketingImage;
  mobileImage?: MarketingImage;
  imgClassName?: string;
  priority?: boolean;
};

export function MarketingImageFrame({
  className,
  image,
  mobileImage,
  imgClassName,
  priority = false,
}: MarketingImageFrameProps) {
  return (
    <picture className={cn("block h-full w-full", className)}>
      {mobileImage && (
        <source
          media="(max-width: 639px)"
          sizes={mobileImage.sizes}
          srcSet={mobileImage.srcSet}
          type="image/webp"
        />
      )}
      <source sizes={image.sizes} srcSet={image.srcSet} type="image/webp" />
      <img
        alt={image.alt}
        className={cn("h-full w-full object-cover", imgClassName)}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        height={image.height}
        loading={priority ? "eager" : "lazy"}
        sizes={image.sizes}
        src={image.src}
        srcSet={image.srcSet}
        width={image.width}
      />
    </picture>
  );
}
