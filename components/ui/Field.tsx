"use client";

import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, useId } from "react";
import { cn } from "@/lib/cn";
import { fieldClass } from "@/components/ui/fieldStyles";

export { fieldClass };

type FieldChrome = { label?: string; hint?: string; error?: string | null; wrapperClassName?: string };

function Chrome({
  id,
  label,
  hint,
  error,
  wrapperClassName,
  children,
}: FieldChrome & { id: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      {label && (
        <label htmlFor={id} className="text-[14px] font-semibold text-ink">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-msg`} role="alert" className="text-[13px] font-medium text-primary">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-msg`} className="text-[13px] text-on-surface-variant">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldChrome>(
  function TextField({ label, hint, error, wrapperClassName, className, id, ...props }, ref) {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <Chrome id={fid} label={label} hint={hint} error={error} wrapperClassName={wrapperClassName}>
        <input
          ref={ref}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${fid}-msg` : undefined}
          className={cn(fieldClass, "h-12", className)}
          {...props}
        />
      </Chrome>
    );
  },
);

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldChrome>(
  function TextArea({ label, hint, error, wrapperClassName, className, id, ...props }, ref) {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <Chrome id={fid} label={label} hint={hint} error={error} wrapperClassName={wrapperClassName}>
        <textarea
          ref={ref}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${fid}-msg` : undefined}
          className={cn(fieldClass, "min-h-[112px] py-3 leading-6", className)}
          {...props}
        />
      </Chrome>
    );
  },
);

export const SelectField = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldChrome>(
  function SelectField({ label, hint, error, wrapperClassName, className, id, children, ...props }, ref) {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <Chrome id={fid} label={label} hint={hint} error={error} wrapperClassName={wrapperClassName}>
        <div className="relative">
          <select
            ref={ref}
            id={fid}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || hint ? `${fid}-msg` : undefined}
            className={cn(fieldClass, "h-12 appearance-none pr-11", className)}
            {...props}
          >
            {children}
          </select>
          <svg
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </Chrome>
    );
  },
);
