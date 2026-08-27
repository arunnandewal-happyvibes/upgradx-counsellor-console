"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { buildSnapshot, restoreSnapshot, type Snapshot } from "@/lib/snapshot";

function requireBlobToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Backups aren't configured yet — BLOB_READ_WRITE_TOKEN is missing.");
  }
}

export async function createBackup() {
  requireBlobToken();
  const snapshot = await buildSnapshot();
  const filename = `snapshot-${snapshot.capturedAt.replace(/[:.]/g, "-")}.json`;
  await put(`backups/${filename}`, JSON.stringify(snapshot, null, 2), {
    access: "public",
    contentType: "application/json",
  });
  revalidatePath("/admin/backups");
}

export async function restoreBackup(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Couldn't fetch backup: ${res.status}`);
  const snapshot = (await res.json()) as Snapshot;
  await restoreSnapshot(snapshot);

  revalidatePath("/", "layout");
}
