"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/admin/AdminUI";
import { Icon } from "@/components/ui/Icon";

export function FileField({
  label,
  urlName,
  fileName,
  defaultUrl,
  accept = "application/pdf",
  hint = "Upload a PDF, or paste a file URL — uploading takes priority.",
}: {
  label: string;
  urlName: string;
  fileName: string;
  defaultUrl?: string | null;
  accept?: string;
  hint?: string;
}) {
  const [fileChosen, setFileChosen] = useState<string | null>(null);

  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded border-2 border-dashed border-brand-gray-300 bg-brand-gray-50 text-brand-gray-400">
          <Icon name="picture_as_pdf" size={26} />
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="file"
            name={fileName}
            accept={accept}
            className="block w-full text-sm text-brand-ink2 file:mr-3 file:rounded file:border-0 file:bg-brand-redLight file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brand-red file:cursor-pointer"
            onChange={(e) => setFileChosen(e.target.files?.[0]?.name ?? null)}
          />
          <input
            type="url"
            name={urlName}
            defaultValue={defaultUrl ?? ""}
            placeholder="...or paste a PDF URL"
            className={inputClass}
          />
          {(fileChosen || defaultUrl) && (
            <p className="text-xs text-brand-gray-400">
              {fileChosen ? (
                `Selected: ${fileChosen}`
              ) : (
                <a href={defaultUrl!} target="_blank" rel="noreferrer" className="text-brand-red hover:underline">
                  View current file
                </a>
              )}
            </p>
          )}
        </div>
      </div>
    </Field>
  );
}
