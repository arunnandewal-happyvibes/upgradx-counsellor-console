import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Th, Td } from "@/components/admin/AdminUI";
import { CounsellorForm } from "@/components/admin/CounsellorForm";
import { createCounsellor, setCounsellorActive } from "@/app/admin/counsellors/actions";
import { getCentre } from "@/lib/centres";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  name: "Enter the counsellor's name.",
  email: "Enter a valid email address.",
  centre: "Pick a centre.",
  duplicate: "A counsellor with that email already exists.",
};

export default async function CounsellorsAdminPage({ searchParams }: { searchParams: { error?: string; saved?: string } }) {
  const [counsellors, logins, sessions] = await Promise.all([
    prisma.counsellor.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] }),
    prisma.counsellorLogin.groupBy({
      by: ["email"],
      _count: { _all: true },
      _max: { loggedInAt: true },
    }),
    prisma.lead.groupBy({
      by: ["counsellorEmail"],
      where: { sessionClosedAt: { not: null }, counsellorEmail: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const loginByEmail = new Map(logins.map((l) => [l.email, l]));
  const sessionsByEmail = new Map(sessions.map((s) => [s.counsellorEmail!, s._count._all]));
  const listed = new Set(counsellors.map((c) => c.email));
  // People who have checked in but aren't on the list yet — the starting point for adding them.
  const unlisted = logins
    .filter((l) => !listed.has(l.email))
    .sort((a, b) => (b._max.loggedInAt?.getTime() ?? 0) - (a._max.loggedInAt?.getTime() ?? 0));
  const allowlistOn = process.env.COUNSELLOR_ALLOWLIST_ENABLED === "true";
  const fmt = (d: Date | null | undefined) => (d ? d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—");

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="mb-2">Counsellors</h1>
        <p className="max-w-3xl text-[15px] text-on-surface-variant">
          Who may run sessions. Each counsellor&apos;s email is sent to LeadSquared as the lead owner, and their centre
          pre-fills Close Session.{" "}
          {allowlistOn ? (
            <strong className="text-ink">Check-in is limited to active counsellors on this list.</strong>
          ) : (
            <>
              Check-in is currently <strong className="text-ink">open to anyone</strong> — add every counsellor here
              before switching on <code className="rounded bg-surface-container px-1">COUNSELLOR_ALLOWLIST_ENABLED</code>.
            </>
          )}
        </p>
      </div>

      {searchParams.error && ERRORS[searchParams.error] && (
        <div role="alert" className="rounded-2xl bg-primary-fixed px-4 py-3 text-[14px] font-medium text-primary-container">
          {ERRORS[searchParams.error]}
        </div>
      )}
      {searchParams.saved && (
        <div role="status" className="rounded-2xl bg-ink px-4 py-3 text-[14px] font-medium text-white">
          Saved. Make sure the email is their active LSQ login — otherwise their leads leave Learning Centre.
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-[22px] font-bold">Counsellor list</h2>
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>LSQ email</Th>
              <Th>Centre</Th>
              <Th>Status</Th>
              <Th>Last check-in</Th>
              <Th>Sessions</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {counsellors.map((c) => {
              const centre = getCentre(c.centre);
              return (
                <tr key={c.id} className="border-t border-outline-variant">
                  <Td className="font-semibold">{c.name}</Td>
                  <Td>{c.email}</Td>
                  <Td>
                    {centre?.label ?? c.centre}
                    {centre && !centre.hasRule && (
                      <span className="ml-2 rounded-full bg-primary-fixed px-2 py-0.5 text-[11px] font-bold text-primary">No LSQ rule</span>
                    )}
                  </Td>
                  <Td>
                    {c.active ? (
                      <span className="rounded-full bg-ink px-2.5 py-1 text-[12px] font-semibold text-white">Active</span>
                    ) : (
                      <span className="rounded-full bg-surface-container px-2.5 py-1 text-[12px] font-semibold text-on-surface-variant">Inactive</span>
                    )}
                  </Td>
                  <Td>{fmt(loginByEmail.get(c.email)?._max.loggedInAt)}</Td>
                  <Td>{sessionsByEmail.get(c.email) ?? 0}</Td>
                  <Td>
                    <div className="flex gap-3">
                      <Link href={`/admin/counsellors/${c.id}`} className="text-sm font-semibold text-primary hover:underline">
                        Edit
                      </Link>
                      <form action={setCounsellorActive.bind(null, c.id, !c.active)}>
                        <button className="text-sm font-semibold text-on-surface-variant hover:text-primary">
                          {c.active ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                    </div>
                  </Td>
                </tr>
              );
            })}
            {counsellors.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-4 text-sm text-on-surface-variant">
                  No counsellors yet — add the first one below.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-[22px] font-bold">Add a counsellor</h2>
        <CounsellorForm action={createCounsellor} submitLabel="Add counsellor" />
      </section>

      {unlisted.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[22px] font-bold">Checked in but not on the list</h2>
          <p className="max-w-3xl text-[14px] text-on-surface-variant">
            Emails used to check in on the console. Check each against the person&apos;s LSQ login before adding them —
            a personal or misspelt address would send leads out of LC.
          </p>
          <Table>
            <thead>
              <tr>
                <Th>Email</Th>
                <Th>Logins</Th>
                <Th>Last check-in</Th>
                <Th>Sessions</Th>
              </tr>
            </thead>
            <tbody>
              {unlisted.map((l) => (
                <tr key={l.email} className="border-t border-outline-variant">
                  <Td className="font-semibold">{l.email}</Td>
                  <Td>{l._count._all}</Td>
                  <Td>{fmt(l._max.loggedInAt)}</Td>
                  <Td>{sessionsByEmail.get(l.email) ?? 0}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      )}
    </div>
  );
}
