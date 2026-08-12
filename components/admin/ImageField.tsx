"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/admin/AdminUI";

export function ImageField({
  label,
  urlName,
  fileName,
  defaultUrl,
  rounded = "rounded",
}: {
  label: string;
  urlName: string;
  fileName: string;
  defaultUrl?: string | null;
  rounded?: string;
}) {
  const [preview, setPreview] = useState<string | null>(defaultUrl ?? null);

  return (
    <Field label={label} hint="Upload a file, or paste an image URL — uploading takes priority.">
      <div className="flex items-center gap-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className={`h-14 w-14 ${rounded} object-cover border border-brand-gray-200`} />
        ) : (
          <div className={`h-14 w-14 ${rounded} bg-brand-gray-100 flex items-center justify-center text-brand-gray-400 text-[10px] text-center`}>
            No image
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            type="file"
            name={fileName}
            accept="image/*"
            className="block w-full text-sm text-brand-ink2 file:mr-3 file:rounded file:border-0 file:bg-brand-redLight file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brand-red file:cursor-pointer"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPreview(URL.createObjectURL(f));
            }}
          />
          <input
            type="url"
            name={urlName}
            defaultValue={defaultUrl ?? ""}
            placeholder="...or paste an image URL"
            className={inputClass}
            onChange={(e) => {
              if (e.target.value) setPreview(e.target.value);
            }}
          />
        </div>
      </div>
    </Field>
  );
}
