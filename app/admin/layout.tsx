import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware only checks the cookie's signature; this also signs out deactivated admins.
  await requireAdmin().catch(() => redirect("/admin-login"));
  return (
    <div className="min-h-screen bg-surface-container-low lg:flex">
      <AdminNav />
      <main className="admin-main min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-[1280px]">{children}</div>
      </main>
    </div>
  );
}
