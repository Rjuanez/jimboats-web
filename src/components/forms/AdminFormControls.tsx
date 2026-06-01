import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/design/variants";

type FieldShellProps = {
  children: ReactNode;
  description?: string;
  label: string;
};

const fieldClassName =
  "w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:bg-slate-100 disabled:text-slate-500";

function FieldShell({ children, description, label }: FieldShellProps) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-semibold text-slate-950">{label}</span>
      <div className="mt-1.5">{children}</div>
      {description ? (
        <p className="mt-1.5 text-xs leading-5 text-slate-500">
          {description}
        </p>
      ) : null}
    </label>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  description?: string;
  label: string;
};

export function TextField({
  className,
  description,
  label,
  ...props
}: TextFieldProps) {
  return (
    <FieldShell description={description} label={label}>
      <input
        className={cn("min-h-11", fieldClassName, className)}
        type="text"
        {...props}
      />
    </FieldShell>
  );
}

type NumberFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  description?: string;
  label: string;
};

export function NumberField({
  className,
  description,
  label,
  ...props
}: NumberFieldProps) {
  return (
    <FieldShell description={description} label={label}>
      <input
        className={cn("min-h-11", fieldClassName, className)}
        inputMode="numeric"
        type="number"
        {...props}
      />
    </FieldShell>
  );
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  description?: string;
  label: string;
};

export function TextAreaField({
  className,
  description,
  label,
  ...props
}: TextAreaFieldProps) {
  return (
    <FieldShell description={description} label={label}>
      <textarea
        className={cn("min-h-28 py-3 leading-6", fieldClassName, className)}
        {...props}
      />
    </FieldShell>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  children: ReactNode;
  description?: string;
  label: string;
};

export function SelectField({
  children,
  className,
  description,
  label,
  ...props
}: SelectFieldProps) {
  return (
    <FieldShell description={description} label={label}>
      <select
        className={cn("min-h-11", fieldClassName, className)}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

type CheckboxFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  description?: string;
  label: string;
};

export function CheckboxField({
  className,
  description,
  label,
  ...props
}: CheckboxFieldProps) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 transition hover:bg-slate-50",
        className,
      )}
    >
      <input
        className="mt-0.5 size-4 rounded border-slate-300 accent-sky-700"
        type="checkbox"
        {...props}
      />
      <span className="min-w-0">
        <span className="block font-semibold text-slate-950">{label}</span>
        {description ? (
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

type FieldGridProps = {
  children: ReactNode;
  columns?: 2 | 3 | 4;
};

export function FieldGrid({ children, columns = 2 }: FieldGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "md:grid-cols-2",
        columns === 3 && "md:grid-cols-3",
        columns === 4 && "md:grid-cols-2 xl:grid-cols-4",
      )}
    >
      {children}
    </div>
  );
}
