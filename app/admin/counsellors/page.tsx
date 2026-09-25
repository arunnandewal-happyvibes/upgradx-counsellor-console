import { prisma } from "@/lib/prisma";
import { Table, Th, Td } from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

export default async function CounsellorsAdminPage() {
  const [logins, sessions] = await Promise.all([
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

  const sessionCountByEmail = new Map(sessions.map((s) => [s.counsellorEmail!, s._count._all]));

  const rows = logins
    .map((l) => ({
      email: l.email,
      loginCount: l._count._all,
      lastLogin: l._max.loggedInAt,
      sessionsCompleted: sessionCountByEmail.get(l.email) ?? 0,
    }))
    .sort((a, b) => (b.lastLogin?.getTime() ?? 0) - (a.lastLogin?.getTime() ?? 0));

  // Emails that closed sessions but (for some reason) have no matching login
  // row — surface them too rather than silently dropping their session count.
  const loggedEmails = new Set(logins.map((l) => l.email));
  const orphanRows = sessions
    .filter((s) => !loggedEmails.has(s.counsellorEmail!))
    .map((s) => ({
      email: s.counsellorEmail!,
      loginCount: 0,
      lastLogin: null as Date | null,
      sessionsCompleted: s._count._all,
    }));

  const allRows = [...rows, ...orphanRows];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Counsellors</h1>
      <p className="mb-6 max-w-2xl text-sm text-brand-ink2">
        Every counsellor who has checked in on the console, how many times they've logged in, and how many
        student sessions they've completed.
      </p>

      <Table>
        <thead>
          <tr>
            <Th>Email</Th>
            <Th>Logins</Th>
            <Th>Last Login</Th>
            <Th>Sessions Completed</Th>
          </tr>
        </thead>
        <tbody>
          {allRows.map((r) => (
            <tr key={r.email} className="border-t border-brand-gray-100">
              <Td className="font-semibold text-brand-ink">{r.email}</Td>
              <Td>{r.loginCount}</Td>
              <Td>{r.lastLogin ? r.lastLogin.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}</Td>
              <Td>{r.sessionsCompleted}</Td>
            </tr>
          ))}
          {allRows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-2 text-sm text-brand-gray-400">
                No counsellor check-ins yet.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
