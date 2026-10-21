"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin-logout", { method: "POST" });
    router.push("/admin-login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-outline-variant text-[14px] font-semibold text-ink transition-colors hover:border-ink"
    >
      <Icon name="logout" size={18} />
      Log out
    </button>
  );
}
