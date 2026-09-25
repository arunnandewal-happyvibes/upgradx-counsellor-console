"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import type { BatchUploadResult } from "@/lib/batchImport";

export function BatchUploadForm({
  action,
}: {
  action: (formData: FormData) => Promise<BatchUploadResult>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<BatchUploadResult | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setResult(null);
    startTransition(async () => {
      const r = await action(formData);
      setResult(r);
      if (r.errors.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    });
  }

  return (
    <div className="max-w-2xl space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <a
          href="/admin/batches/template"
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gray-200 px-4 py-2 text-sm font-bold text-brand-ink2 hover:border-brand-red hover:text-brand-red"
        >
          Download Template (.xlsx)
        </a>
        <span className="text-sm text-brand-gray-400">
          Fill it in, then upload below — rows already in the system are skipped automatically.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          required
          type="file"
          name="file"
          accept=".xlsx"
          className="text-sm text-brand-ink2 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-gray-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-ink2 hover:file:bg-brand-gray-100"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Uploading..." : "Upload Batches"}
        </Button>
      </form>

      {result && (
        <div className="rounded-lg border border-brand-gray-200 bg-white p-4 text-sm">
          <p className="font-semibold text-brand-ink">
            {result.inserted} new batch{result.inserted === 1 ? "" : "es"} added
            {result.skippedDuplicates > 0 && `, ${result.skippedDuplicates} duplicate row${result.skippedDuplicates === 1 ? "" : "s"} skipped`}
            {result.totalDataRows > 0 && ` (${result.totalDataRows} row${result.totalDataRows === 1 ? "" : "s"} read from the file)`}.
          </p>
          {result.errors.length > 0 && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="mb-1.5 font-semibold text-brand-red">
                {result.errors.length} row{result.errors.length === 1 ? "" : "s"} couldn&apos;t be added:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-brand-ink2">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
