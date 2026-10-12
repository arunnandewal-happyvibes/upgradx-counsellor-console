"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/admin/AdminUI";
import { FileField } from "@/components/admin/FileField";
import {
  ADD_ON_DESCRIPTION_MAX,
  ADD_ON_DESCRIPTION_MIN,
  ADD_ON_DESCRIPTION_PLACEHOLDER,
} from "@/lib/addOnCertificate";

type Existing = { id: string; name: string; pdfUrl: string; description: string | null };

/** Optional "additional certificate" block on the course form. Leave it all empty to skip;
 * as soon as a name or PDF is given, the description becomes mandatory. */
export function AdditionalCertificateFields({ existing = [] }: { existing?: Existing[] }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pdfPicked, setPdfPicked] = useState(false);
  const inUse = name.trim() !== "" || description.trim() !== "" || pdfPicked;

  return (
    <fieldset
      className="space-y-4 rounded-lg border border-brand-gray-200 p-4"
      onChange={(e) => {
        const t = e.target as HTMLInputElement;
        if (t.type === "file") setPdfPicked((t.files?.length ?? 0) > 0);
      }}
    >
      <legend className="px-2 text-sm font-bold text-brand-ink">Additional certificate (optional)</legend>

      {existing.length > 0 && (
        <ul className="space-y-1 text-sm text-brand-ink2">
          {existing.map((c) => (
            <li key={c.id}>
              <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-red hover:underline">
                {c.name} ↗
              </a>
              {c.description ? (
                <span> — {c.description}</span>
              ) : (
                <span className="font-semibold text-brand-red"> — description missing (edit under Add-on Certificates)</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <Field label="Certificate name">
        <input
          name="addOnName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required={inUse}
          className={inputClass}
          placeholder="e.g. DivyaSampark — IIT Roorkee"
        />
      </Field>
      <FileField
        label="Additional certificate PDF"
        urlName="addOnPdfUrl"
        fileName="addOnPdfFile"
        hint="A sample of the additional certificate — opens in a new tab for the counsellor."
      />
      <Field
        label={inUse ? "Description (required)" : "Description"}
        hint="2-3 lines on the additional masterclasses or projects this certificate adds."
      >
        <textarea
          name="addOnDescription"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required={inUse}
          minLength={inUse ? ADD_ON_DESCRIPTION_MIN : undefined}
          maxLength={ADD_ON_DESCRIPTION_MAX}
          className={inputClass}
          placeholder={ADD_ON_DESCRIPTION_PLACEHOLDER}
        />
      </Field>
    </fieldset>
  );
}
