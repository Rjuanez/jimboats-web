import { Anchor, Headset, ShieldCheck, Star } from "lucide-react";

const icons = {
  anchor: Anchor,
  headset: Headset,
  shield: ShieldCheck,
  star: Star,
} as const;

export type TrustItem = {
  icon: keyof typeof icons;
  label: string;
};

type TrustBarProps = {
  items: readonly TrustItem[];
};

export function TrustBar({ items }: TrustBarProps) {
  return (
    <section
      aria-label="JimBoats highlights"
      className="bg-background px-4 py-8 lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        {items.map((item) => {
          const Icon = icons[item.icon];

          return (
            <div className="flex flex-col items-center gap-2" key={item.label}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sand/45 text-primary">
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <span className="text-center text-[0.65rem] font-semibold uppercase leading-tight text-text-muted">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
