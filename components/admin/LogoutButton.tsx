"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin-logout", { method: "POST" });
    router.push("/admin-login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="block w-full rounded-lg border border-brand-gray-200 px-3 py-2 text-center text-sm font-semibold text-brand-ink2 hover:border-brand-red hover:text-brand-red"
    >
      Log Out
    </button>
  );
}
