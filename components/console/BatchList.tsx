import { cn } from "@/lib/cn";

export type BatchRow = {
  id: string;
  startDate: string;
  applicationCloseDate: string;
  timing: string;
  location: string;
  program: { name: string };
  mode: string;
  city: { name: string } | null;
};

const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** Responsive batch list (rows on desktop, stacked cards on phones). Shared by the home
 * section, the All batches page and program pages. `hideProgram` drops the program name
 * when the page is already about one program. */
export function BatchList({ batches, hideProgram }: { batches: BatchRow[]; hideProgram?: boolean }) {
  return (
    <ul className="overflow-hidden rounded-[24px] border border-outline-variant bg-white">
      {batches.map((b) => (
        <li
          key={b.id}
          className="grid grid-cols-2 gap-x-6 gap-y-3 border-b border-outline-variant px-6 py-5 transition-colors last:border-0 hover:bg-primary-fixed/40 md:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)] md:items-center md:px-7"
        >
          <div className="col-span-2 flex min-w-0 flex-col gap-1.5 md:col-span-1">
            {!hideProgram && <span className="text-[17px] font-semibold text-ink">{b.program.name}</span>}
            <span className={cn("flex flex-wrap items-center gap-2 text-on-surface-variant", hideProgram ? "text-[16px] font-medium text-ink" : "text-[14px]")}>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em]",
                  b.mode === "Online" ? "bg-ink text-white" : "bg-primary text-white",
                )}
              >
                {b.mode}
              </span>
              {b.city?.name ?? "Open to every city"}
              {b.location && <span className="truncate">· {b.location}</span>}
            </span>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Starts</div>
            <div className="mt-0.5 text-[15px] font-semibold text-ink">{fmt(b.startDate)}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Apply by</div>
            <div className="mt-0.5 text-[15px] font-semibold text-primary-container">{fmt(b.applicationCloseDate)}</div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Timing</div>
            <div className="mt-0.5 text-[15px] text-ink">{b.timing}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
