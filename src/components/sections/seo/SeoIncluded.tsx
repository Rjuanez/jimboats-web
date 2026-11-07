import { Anchor, UsersRound, Clock3, MapPin, Star } from "lucide-react";
import { cn } from "@/design/variants";

const icons = [UsersRound, Anchor, Clock3, MapPin];
export function SeoIncluded({
  items,
  compact = false,
}: {
  items: string[];
  compact?: boolean;
}) {
  return (
    <ul
      className={cn(
        compact
          ? "flex flex-wrap items-center justify-between gap-x-8 gap-y-5 py-8 lg:py-10"
          : "mt-7 grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-6",
      )}
    >
      {items.map((item, index) => {
        const Icon = compact && index === 2 ? Star : icons[index];
        return (
          <li
            key={item}
            className={cn(
              "flex min-w-0 items-start gap-2 sm:gap-3",
              compact && "w-max max-w-full",
              !compact &&
                "flex-col rounded-2xl border border-sand/60 bg-background p-5",
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sand bg-white/70 text-primary-dark">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 self-center text-xs font-medium leading-6 text-text [overflow-wrap:anywhere] sm:text-sm">
              {item}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
