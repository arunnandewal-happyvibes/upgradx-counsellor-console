import { prisma } from "@/lib/prisma";
import { Field, inputClass, Table, Th, Td } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/requireAdmin";
import { ownerEmail } from "@/lib/adminAuth";
import { MIN_ADMIN_PASSWORD } from "@/lib/adminPasswords";
import { createAdminUser, setAdminActive, setAdminPassword } from "@/app/admin/admins/actions";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  name: "Enter the person's name.",
  email: "Enter a valid email address.",
  owner: "That's the owner account — it's managed in Vercel, not here.",
  password: `Passwords need at least ${MIN_ADMIN_PASSWORD} characters.`,
  duplicate: "An admin with that email already exists.",
};

export default async function AdminsPage({ searchParams }: { searchParams: { error?: string; saved?: string } }) {
  const me = await requireAdmin();
  // ADMIN_INVITES (Vercel env, "email:Name,email:Name") pre-adds people without a password,
  // so their addresses never have to live in this public repo.
  const invites = (process.env.ADMIN_INVITES ?? "")
    .split(",")
    .map((entry) => entry.split(":").map((x) => x.trim()))
    .filter(([email]) => !!email && email.includes("@") && email.toLowerCase() !== ownerEmail());
  for (const [email, name] of invites) {
    await prisma.adminUser.upsert({
      where: { email: email.toLowerCase() },
      create: { email: email.toLowerCase(), name: name || email.split("@")[0] },
      update: {},
    });
  }
  const admins = await prisma.adminUser.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] });
  const fmt = (d: Date | null) => (d ? d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—");

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="mb-2">Admins</h1>
        <p className="max-w-3xl text-[15px] text-on-surface-variant">
          People who can sign in to this admin panel with their own email and password. The owner account (
          <strong className="text-ink">{ownerEmail() ?? "not set"}</strong>) comes from Vercel and is the only one that can
          add admins, set passwords or deactivate them. Share a new password with the person directly, never in a group chat.
        </p>
      </div>

      {searchParams.error && ERRORS[searchParams.error] && (
        <div role="alert" className="rounded-2xl bg-primary-fixed px-4 py-3 text-[14px] font-medium text-primary-container">
          {ERRORS[searchParams.error]}
        </div>
      )}
      {searchParams.saved && (
        <div role="status" className="rounded-2xl bg-ink px-4 py-3 text-[14px] font-medium text-white">
          {searchParams.saved === "password" ? "Password set. They can sign in at /admin-login now." : "Saved."}
        </div>
      )}

      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Status</Th>
            <Th>Last sign-in</Th>
            {me.isOwner && <Th>Set password</Th>}
            {me.isOwner && <Th></Th>}
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a.id} className="border-t border-outline-variant align-middle">
              <Td className="font-semibold">{a.name}</Td>
              <Td>{a.email}</Td>
              <Td>
                {!a.active ? (
                  <span className="rounded-full bg-surface-container px-2.5 py-1 text-[12px] font-semibold text-on-surface-variant">Inactive</span>
                ) : a.passwordHash ? (
                  <span className="rounded-full bg-ink px-2.5 py-1 text-[12px] font-semibold text-white">Active</span>
                ) : (
                  <span className="rounded-full bg-primary-fixed px-2.5 py-1 text-[12px] font-bold text-primary">Needs a password</span>
                )}
              </Td>
              <Td>{fmt(a.lastLoginAt)}</Td>
              {me.isOwner && (
                <Td>
                  <form action={setAdminPassword.bind(null, a.id)} className="flex gap-2">
                    <input
                      required
                      type="password"
                      name="password"
                      minLength={MIN_ADMIN_PASSWORD}
                      autoComplete="new-password"
                      placeholder={a.passwordHash ? "New password" : "Set a password"}
                      className={`${inputClass} !w-48`}
                    />
                    <Button size="sm" variant="dark" type="submit">
                      Save
                    </Button>
                  </form>
                </Td>
              )}
              {me.isOwner && (
                <Td>
                  <form action={setAdminActive.bind(null, a.id, !a.active)}>
                    <button className="text-sm font-semibold text-on-surface-variant hover:text-primary">
                      {a.active ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </Td>
              )}
            </tr>
          ))}
          {admins.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-4 text-sm text-on-surface-variant">
                No additional admins yet.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {me.isOwner ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-[22px] font-bold">Add an admin</h2>
          <form action={createAdminUser} className="max-w-xl space-y-4">
            <Field label="Name">
              <input required minLength={2} name="name" className={inputClass} placeholder="e.g. Priya Sharma" />
            </Field>
            <Field label="Work email">
              <input required type="email" name="email" className={inputClass} placeholder="name@upgrad.com" />
            </Field>
            <Field label="Password" hint={`At least ${MIN_ADMIN_PASSWORD} characters. You can also leave it blank and set it later.`}>
              <input type="password" name="password" minLength={MIN_ADMIN_PASSWORD} autoComplete="new-password" className={inputClass} />
            </Field>
            <Button type="submit">Add admin</Button>
          </form>
        </section>
      ) : (
        <p className="text-[14px] text-on-surface-variant">Only the owner account can change this list.</p>
      )}
    </div>
  );
}
