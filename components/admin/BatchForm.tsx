"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { BATCH_MODES, normalizeBatchMode, type BatchMode } from "@/lib/batchMode";

type Option = { id: string; name: string };
type Batch = {
  programId: string;
  cityId: string | null;
  mode: string;
  startDate: Date;
  applicationCloseDate: Date;
  timing: string;
  location: string;
};

function toInputDate(d?: Date) {
  return d ? d.toISOString().slice(0, 10) : "";
}

export function BatchForm({
  action,
  programs,
  cities,
  initial,
}: {
  action: (formData: FormData) => void;
  programs: Option[];
  cities: Option[];
  initial?: Batch;
}) {
  const [mode, setMode] = useState<BatchMode>(normalizeBatchMode(initial?.mode));
  const offline = mode === "Offline";

  return (
    <form action={action} className="max-w-xl space-y-4">
      <Field label="Program">
        <select required name="programId" defaultValue={initial?.programId} className={inputClass}>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Mode" hint="Online batches are open to every student, so a city is optional for them.">
        <select
          required
          name="mode"
          value={mode}
          onChange={(e) => setMode(normalizeBatchMode(e.target.value))}
          className={inputClass}
        >
          {BATCH_MODES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </Field>
      <Field label={offline ? "City (required for offline)" : "City (optional for online)"}>
        <select
          required={offline}
          name="cityId"
          defaultValue={initial?.cityId ?? ""}
          className={inputClass}
        >
          <option value="">{offline ? "— Select a city —" : "— No city (open to all) —"}</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start date">
          <input required type="date" name="startDate" defaultValue={toInputDate(initial?.startDate)} className={inputClass} />
        </Field>
        <Field label="Application closes">
          <input required type="date" name="applicationCloseDate" defaultValue={toInputDate(initial?.applicationCloseDate)} className={inputClass} />
        </Field>
      </div>
      <Field label="Timing">
        <input required name="timing" defaultValue={initial?.timing ?? "Mon–Fri, 6:00 PM – 9:00 PM"} className={inputClass} />
      </Field>
      <Field label={offline ? "Location" : "Location (optional for online)"}>
        <input
          required={offline}
          name="location"
          defaultValue={initial?.location}
          placeholder={offline ? "" : "Online"}
          className={inputClass}
        />
      </Field>
      <Button type="submit">Save Batch</Button>
    </form>
  );
}
