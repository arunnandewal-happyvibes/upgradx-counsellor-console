import { cn } from "@/lib/cn";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[14px] font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[13px] text-on-surface-variant">{hint}</span>}
    </label>
  );
}

/** Same look as the console's fields (components/ui/fieldStyles), sized for dense admin forms. */
export const inputClass =
  "w-full rounded-xl border border-outline-variant bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-[#8a8a8a] " +
  "transition-[border-color,box-shadow] duration-fast hover:border-[#c9c9c9] focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15";

export function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap bg-surface-container-low px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-[14px] text-ink", className)}>{children}</td>;
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-table overflow-x-auto rounded-[20px] border border-outline-variant bg-white">
      <table className="w-full">{children}</table>
    </div>
  );
}
