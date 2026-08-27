import fs from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";
import { buildSnapshot } from "@/lib/snapshot";

// Dumps every row of every table to one JSON snapshot — saved locally under
// backups/ (so it's committed to git and recoverable independent of both the
// live DB and Vercel Blob) and, when BLOB_READ_WRITE_TOKEN is set, also
// uploaded to Vercel Blob (so it's downloadable/restorable from the admin
// panel in production, where the local filesystem doesn't persist).
async function main() {
  const snapshot = await buildSnapshot();
  const filename = `snapshot-${snapshot.capturedAt.replace(/[:.]/g, "-")}.json`;
  const json = JSON.stringify(snapshot, null, 2);

  const dir = path.join(process.cwd(), "backups");
  fs.mkdirSync(dir, { recursive: true });
  const localPath = path.join(dir, filename);
  fs.writeFileSync(localPath, json);
  console.log(`Saved local snapshot: ${localPath}`);
  console.log("Row counts:", snapshot.counts);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`backups/${filename}`, json, {
      access: "public",
      contentType: "application/json",
    });
    console.log(`Uploaded to Vercel Blob: ${blob.url}`);
  } else {
    console.log("BLOB_READ_WRITE_TOKEN not set — skipped Blob upload (local copy only).");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
