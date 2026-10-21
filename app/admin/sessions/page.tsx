import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Th, Td } from "@/components/admin/AdminUI";
import { buildSessionsWhere } from "@/lib/sessionFilters";
import { leadDropEnabled } from "@/lib/leadDrop";
import { resendLsq } from "@/app/admin/sessions/actions";

export const dynamic = "force-dynamic";

const selectClass =
  "h-10 rounded-2xl border border-outline-variant px-3 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red";

export default async function SessionsAdminPage({
  searchParams,
}: {
  searchParams: { city?: string; from?: string; to?: string; sort?: string };
}) {
  const city = searchParams.city?.trim() || "";
  const from = searchParams.from?.trim() || "";
  const to = searchParams.to?.trim() || "";
  const sort = searchParams.sort === "date_asc" ? "asc" : "desc";
  const where = buildSessionsWhere({ city, from, to });

  const [sessions, cityRows] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { sessionClosedAt: sort },
      include: { recommendedProgram: { select: { name: true } }, recording: { select: { id: true } } },
    }),
    prisma.lead.findMany({
      where: { sessionClosedAt: { not: null }, counsellorCity: { not: null } },
      distinct: ["counsellorCity"],
      select: { counsellorCity: true },
      orderBy: { counsellorCity: "asc" },
    }),
  ]);

  const cities = cityRows.map((r) => r.counsellorCity!).filter(Boolean);
  const lsqOn = leadDropEnabled();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Closed Sessions</h1>
      <p className="mb-6 max-w-2xl text-sm text-brand-ink2">
        Every session a counsellor has closed — student contact details, the program recommended, and who
        ran the call. Filter and sort below.
      </p>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-brand-ink2">City</label>
          <select name="city" defaultValue={city} className={selectClass}>
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-brand-ink2">From</label>
          <input type="date" name="from" defaultValue={from} className={selectClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-brand-ink2">To</label>
          <input type="date" name="to" defaultValue={to} className={selectClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-brand-ink2">Sort</label>
          <select name="sort" defaultValue={searchParams.sort === "date_asc" ? "date_asc" : "date_desc"} className={selectClass}>
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
          </select>
        </div>
        <button
          type="submit"
          className="h-10 rounded-lg bg-brand-red px-4 text-sm font-bold text-white hover:bg-brand-red/90"
        >
          Apply
        </button>
        {(city || from || to || searchParams.sort) && (
          <Link href="/admin/sessions" className="text-sm font-semibold text-brand-gray-400 hover:text-brand-red">
            Clear filters
          </Link>
        )}
        <a
          href={`/admin/sessions/export?${new URLSearchParams({
            ...(city ? { city } : {}),
            ...(from ? { from } : {}),
            ...(to ? { to } : {}),
            sort: sort === "asc" ? "date_asc" : "date_desc",
          }).toString()}`}
          className="ml-auto flex h-10 items-center gap-1.5 rounded-lg border border-brand-red px-4 text-sm font-bold text-brand-red hover:bg-brand-redLight"
        >
          Export to Excel
        </a>
      </form>

      <Table>
        <thead>
          <tr>
            <Th>Closed</Th>
            <Th>Learner</Th>
            <Th>Learner Phone</Th>
            <Th>Learner Email</Th>
            <Th>Profile</Th>
            <Th>Recommended Program</Th>
            <Th>Counsellor</Th>
            <Th>Counsellor Email</Th>
            <Th>City</Th>
            <Th>Rating</Th>
            <Th>LeadSquared</Th>
            <Th>Transcript</Th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id} className="border-t border-brand-gray-100">
              <Td className="whitespace-nowrap font-semibold text-brand-ink">
                {s.sessionClosedAt?.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </Td>
              <Td className="font-semibold text-brand-ink">{s.name}</Td>
              <Td>{s.phone ?? "—"}</Td>
              <Td>{s.email ?? "—"}</Td>
              <Td className="whitespace-nowrap">
                {s.occupation
                  ? s.occupation === "Working Professional" && s.yearsOfExperience != null
                    ? `Working · ${s.yearsOfExperience} yrs`
                    : s.occupation
                  : "—"}
              </Td>
              <Td>{s.recommendedProgram?.name ?? "—"}</Td>
              <Td>{s.counsellorName ?? "—"}</Td>
              <Td>{s.counsellorEmail ?? "—"}</Td>
              <Td>{s.counsellorCity ?? "—"}</Td>
              <Td className="whitespace-nowrap">
                {s.rating ? (
                  <span aria-label={`${s.rating} out of 5 stars`}>
                    <span className="text-brand-red">{"★".repeat(s.rating)}</span>
                    <span className="text-brand-gray-200">{"★".repeat(5 - s.rating)}</span>
                  </span>
                ) : (
                  <span className="text-brand-gray-400">Awaiting student</span>
                )}
              </Td>
              <Td className="min-w-[220px]">
                {s.referralStatus ? (
                  <div className="flex flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                        title={s.referralStatus}
                        className={
                          !s.referralSentAt
                            ? "rounded-full bg-primary px-2.5 py-0.5 text-[12px] font-bold text-white"
                            : /^(Reactivated|Repeat)/.test(s.referralStatus)
                              ? "rounded-full bg-[#fff1d6] px-2.5 py-0.5 text-[12px] font-bold text-[#8a5a00]"
                              : "rounded-full bg-ink px-2.5 py-0.5 text-[12px] font-bold text-white"
                        }
                      >
                        {s.referralSentAt ? s.referralStatus : `Failed`}
                      </span>
                      {!s.referralSentAt && (
                        <form action={resendLsq.bind(null, s.id)}>
                          <button
                            disabled={!lsqOn}
                            title={lsqOn ? "Send again with the stored values" : "LSQ sending is switched off"}
                            className="text-[13px] font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:text-on-surface-variant disabled:no-underline"
                          >
                            Re-send
                          </button>
                        </form>
                      )}
                    </span>
                    {!s.referralSentAt && <span className="text-[12px] text-primary">{s.referralStatus}</span>}
                    {s.referralSentAt && /^(Reactivated|Repeat)/.test(s.referralStatus) && (
                      <span className="text-[12px] text-[#8a5a00]">Existing lead — owner may be outside LC. Check in LSQ.</span>
                    )}
                    {s.lsqCampaign && <code className="break-all text-[11px] text-on-surface-variant">{s.lsqCampaign}</code>}
                    {s.lsqLeadId && <span className="text-[11px] text-on-surface-variant">ID {s.lsqLeadId}</span>}
                    {s.lsqOwnerEmail && <span className="text-[11px] text-on-surface-variant">Owner sent: {s.lsqOwnerEmail}</span>}
                  </div>
                ) : (
                  <span className="text-on-surface-variant">{lsqOn ? "—" : "Not sent (off)"}</span>
                )}
              </Td>
              <Td>
                {s.recording ? (
                  <Link href={`/admin/transcripts/${s.recording.id}`} className="font-semibold text-brand-red hover:underline">
                    View
                  </Link>
                ) : (
                  <span className="text-brand-gray-400">—</span>
                )}
              </Td>
            </tr>
          ))}
          {sessions.length === 0 && (
            <tr>
              <td colSpan={12} className="px-3 py-2 text-sm text-brand-gray-400">
                No closed sessions match these filters yet.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
