import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-gray-50 px-4">
      <Suspense>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
