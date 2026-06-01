import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/design/variants";

type IconButtonTone = "dark" | "neutral";

type IconButtonBaseProps = {
  className?: string;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  loading?: boolean;
  tone?: IconButtonTone;
};

type NativeIconButtonProps = IconButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type AnchorIconButtonProps = IconButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type IconButtonProps = NativeIconButtonProps | AnchorIconButtonProps;

const toneClassName = {
  dark: "border-slate-950 bg-slate-950 text-white hover:bg-slate-800 focus-visible:outline-slate-950",
  neutral:
    "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 focus-visible:outline-sky-700",
} satisfies Record<IconButtonTone, string>;

export function IconButton(props: IconButtonProps) {
  if ("href" in props && props.href) {
    const {
      className,
      disabled,
      href,
      icon,
      label,
      loading,
      tone = "neutral",
      ...anchorProps
    } = props;
    const isDisabled = Boolean(disabled || loading);

    return (
      <a
        aria-busy={loading ? "true" : undefined}
        aria-disabled={isDisabled ? "true" : undefined}
        aria-label={label}
        className={getIconButtonClassName({ className, tone })}
        href={isDisabled ? undefined : href}
        title={label}
        {...anchorProps}
      >
        {icon}
      </a>
    );
  }

  const {
    className,
    disabled,
    icon,
    label,
    loading,
    tone = "neutral",
    type = "button",
    ...buttonProps
  } = props as NativeIconButtonProps;

  return (
    <button
      aria-busy={loading ? "true" : undefined}
      aria-label={label}
      className={getIconButtonClassName({ className, tone })}
      disabled={Boolean(disabled || loading)}
      title={label}
      type={type}
      {...buttonProps}
    >
      {icon}
    </button>
  );
}

function getIconButtonClassName({
  className,
  tone,
}: {
  className?: string;
  tone: IconButtonTone;
}) {
  return cn(
    "inline-flex size-10 shrink-0 items-center justify-center rounded-md border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    toneClassName[tone],
    className,
  );
}
