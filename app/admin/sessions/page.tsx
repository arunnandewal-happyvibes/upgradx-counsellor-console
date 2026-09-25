import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Th, Td } from "@/components/admin/AdminUI";
import { buildSessionsWhere } from "@/lib/sessionFilters";

export const dynamic = "force-dynamic";

const selectClass =
  "h-10 rounded-lg border border-brand-gray-200 px-3 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red";

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
      include: { recommendedProgram: { select: { name: true } } },
    }),
    prisma.lead.findMany({
      where: { sessionClosedAt: { not: null }, counsellorCity: { not: null } },
      distinct: ["counsellorCity"],
      select: { counsellorCity: true },
      orderBy: { counsellorCity: "asc" },
    }),
  ]);

  const cities = cityRows.map((r) => r.counsellorCity!).filter(Boolean);

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
            <Th>Student</Th>
            <Th>Phone</Th>
            <Th>Email</Th>
            <Th>Recommended Program</Th>
            <Th>Counsellor</Th>
            <Th>City</Th>
            <Th>Rating</Th>
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
              <Td>{s.recommendedProgram?.name ?? "—"}</Td>
              <Td>{s.counsellorName ?? "—"}</Td>
              <Td>{s.counsellorCity ?? "—"}</Td>
              <Td className="whitespace-nowrap">
                {s.rating ? (
                  <span aria-label={`${s.rating} out of 5 stars`}>
                    <span className="text-brand-red">{"★".repeat(s.rating)}</span>
                    <span className="text-brand-gray-200">{"★".repeat(5 - s.rating)}</span>
                  </span>
                ) : (
                  "—"
                )}
              </Td>
            </tr>
          ))}
          {sessions.length === 0 && (
            <tr>
              <td colSpan={8} className="px-3 py-2 text-sm text-brand-gray-400">
                No closed sessions match these filters yet.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
