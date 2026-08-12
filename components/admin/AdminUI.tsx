import { cn } from "@/lib/cn";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-brand-ink2">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-brand-gray-400">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-brand-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red";

export function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-brand-gray-400">{children}</th>;
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-3 py-2 text-sm text-brand-ink2", className)}>{children}</td>;
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-card border border-brand-gray-200 bg-white">
      <table className="w-full">{children}</table>
    </div>
  );
}
