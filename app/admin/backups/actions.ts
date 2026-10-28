"use server";

import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { buildSnapshot, restoreSnapshot, type Snapshot } from "@/lib/snapshot";

function requireBlobToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Backups aren't configured yet — BLOB_READ_WRITE_TOKEN is missing.");
  }
}

// Restoring fetches the given URL server-side and overwrites the database with its contents,
// so only allow our own Vercel Blob backup files — never an arbitrary caller-supplied URL (SSRF).
function assertTrustedBackupUrl(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid backup URL.");
  }
  const okHost = parsed.protocol === "https:" && parsed.hostname.endsWith(".public.blob.vercel-storage.com");
  const okPath = parsed.pathname.startsWith("/backups/") && parsed.pathname.endsWith(".json");
  if (!okHost || !okPath) {
    throw new Error("Refusing to restore from an untrusted URL — only this app's own Blob backups are allowed.");
  }
}

export async function createBackup() {
  await requireAdmin();
  requireBlobToken();
  const snapshot = await buildSnapshot();
  const filename = `snapshot-${snapshot.capturedAt.replace(/[:.]/g, "-")}.json`;
  await put(`backups/${filename}`, JSON.stringify(snapshot, null, 2), {
    access: "public",
    // Random suffix: without it the URL is just the timestamp, which is guessable, and
    // these files hold every learner's details.
    addRandomSuffix: true,
    contentType: "application/json",
  });
  revalidatePath("/admin/backups");
}

export async function restoreBackup(url: string) {
  await requireAdmin();
  assertTrustedBackupUrl(url);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Couldn't fetch backup: ${res.status}`);
  const snapshot = (await res.json()) as Snapshot;
  await restoreSnapshot(snapshot);

  revalidatePath("/", "layout");
}
