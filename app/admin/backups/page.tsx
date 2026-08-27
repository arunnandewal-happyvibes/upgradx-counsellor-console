import { list } from "@vercel/blob";
import { Table, Th, Td } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { createBackup, restoreBackup } from "./actions";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function BackupsAdminPage() {
  const configured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const { blobs } = configured
    ? await list({ prefix: "backups/" })
    : { blobs: [] as Awaited<ReturnType<typeof list>>["blobs"] };
  const sorted = [...blobs].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Backups</h1>
      <p className="mb-6 max-w-2xl text-sm text-brand-ink2">
        A full snapshot of every table — programs, leads, instructors, batches, FAQs, everything.
        Restoring a snapshot recreates any rows that were deleted since it was taken; it never
        deletes anything, so it's safe to restore even if you're not sure what changed.
      </p>

      {!configured && (
        <p className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Backups aren't configured yet — BLOB_READ_WRITE_TOKEN is missing from this environment.
        </p>
      )}

      <form action={createBackup} className="mb-6">
        <Button type="submit" disabled={!configured}>
          Create Backup Now
        </Button>
      </form>

      <Table>
        <thead>
          <tr>
            <Th>Snapshot</Th>
            <Th>Size</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((b) => (
            <tr key={b.pathname} className="border-t border-brand-gray-100">
              <Td className="font-semibold text-brand-ink">
                {new Date(b.uploadedAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Td>
              <Td>{formatBytes(b.size)}</Td>
              <Td>
                <div className="flex gap-3">
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-brand-red hover:underline"
                  >
                    View Raw JSON
                  </a>
                  <form action={restoreBackup.bind(null, b.url)}>
                    <button className="text-sm font-semibold text-brand-gray-400 hover:text-brand-red">
                      Restore This Backup
                    </button>
                  </form>
                </div>
              </Td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={3} className="px-3 py-2 text-sm text-brand-gray-400">
                No backups yet — click &quot;Create Backup Now&quot; above.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
