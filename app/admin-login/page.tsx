import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-container-low px-4 py-12">
      <Suspense>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
