import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/design/variants";

type PublicTextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  description?: string;
  label: string;
  type?: "email" | "tel" | "text";
};

export function PublicTextField({
  className,
  description,
  id,
  label,
  type = "text",
  ...props
}: PublicTextFieldProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block min-w-0" htmlFor={inputId}>
      <span className="block text-sm font-semibold text-text">{label}</span>
      <input
        className={cn(
          "mt-2 min-h-12 w-full rounded-lg border border-sand/60 bg-background px-4 text-base text-text shadow-sm transition placeholder:text-text-muted/55",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text",
          "disabled:bg-sand/20 disabled:text-text-muted",
          className,
        )}
        id={inputId}
        type={type}
        {...props}
      />
      {description ? (
        <span className="mt-2 block text-sm leading-6 text-text-muted">
          {description}
        </span>
      ) : null}
    </label>
  );
}

type PublicCheckboxFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  children?: ReactNode;
  description?: string;
  label: string;
};

export function PublicCheckboxField({
  children,
  className,
  description,
  id,
  label,
  ...props
}: PublicCheckboxFieldProps) {
  const inputId = id ?? props.name;

  return (
    <label
      className={cn(
        "flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border border-sand/50 bg-background px-4 py-3 text-sm text-text transition hover:border-sand hover:bg-sand/15",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-text",
        className,
      )}
      htmlFor={inputId}
    >
      <input
        className="mt-1 size-4 shrink-0 rounded border-sand accent-text"
        id={inputId}
        type="checkbox"
        {...props}
      />
      <span className="min-w-0">
        <span className="block font-semibold">{label}</span>
        {description ? (
          <span className="mt-1 block leading-5 text-text-muted">
            {description}
          </span>
        ) : null}
        {children}
      </span>
    </label>
  );
}
