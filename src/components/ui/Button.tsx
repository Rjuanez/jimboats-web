import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { buttonVariants, cn, type ButtonVariantProps } from "@/design/variants";

type ButtonBaseProps = ButtonVariantProps & {
  children: ReactNode;
  className?: string;
  loading?: boolean;
};

type NativeButtonProps = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type AnchorButtonProps = ButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    disabled?: boolean;
    href: string;
  };

export type ButtonProps = NativeButtonProps | AnchorButtonProps;

export function Button(props: ButtonProps) {
  if ("href" in props && props.href) {
    const {
      children,
      className,
      disabled,
      loading,
      shape,
      size,
      variant,
      href,
      ...anchorProps
    } = props;
    const composedClassName = cn(
      buttonVariants({ shape, size, variant }),
      className,
    );
    const isDisabled = Boolean(disabled || loading);

    return (
      <a
        aria-busy={loading ? "true" : undefined}
        aria-disabled={isDisabled ? "true" : undefined}
        className={composedClassName}
        href={isDisabled ? undefined : href}
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  const button = props as NativeButtonProps;
  const {
    children,
    className,
    disabled,
    loading,
    shape,
    size,
    type = "button",
    variant,
    ...buttonProps
  } = button;
  const composedClassName = cn(
    buttonVariants({ shape, size, variant }),
    className,
  );
  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      aria-busy={loading ? "true" : undefined}
      className={composedClassName}
      disabled={isDisabled}
      type={type}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
