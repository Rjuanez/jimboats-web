import { Plus } from "lucide-react";

import {
  MarketingImageFrame,
  type MarketingImage,
} from "./MarketingImageFrame";

export type UpgradeCardProps = {
  description: string;
  image: MarketingImage;
  title: string;
};

export function UpgradeCard({ description, image, title }: UpgradeCardProps) {
  return (
    <article className="flex items-center gap-4 rounded-3xl border border-sand/25 bg-white p-4 shadow-soft md:block md:rounded-4xl">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl md:h-[400px] md:w-full md:rounded-3xl">
        <MarketingImageFrame
          image={image}
          imgClassName="transition-transform duration-700 hover:scale-105"
        />
      </div>
      <div className="min-w-0 flex-1 md:px-3 md:pb-3 md:pt-6 md:text-center">
        <h3 className="font-display text-2xl leading-tight text-text md:text-3xl">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-5 text-text-muted md:text-sm">
          {description}
        </p>
      </div>
      <span
        aria-hidden="true"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sand/35 text-text md:hidden"
      >
        <Plus className="h-4 w-4" />
      </span>
    </article>
  );
}
