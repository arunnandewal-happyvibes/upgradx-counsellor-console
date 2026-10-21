import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { FileField } from "@/components/admin/FileField";
import { AdditionalCertificateFields } from "@/components/admin/AdditionalCertificateFields";
import { COURSE_LABEL, LSQ_VERTICALS } from "@/lib/leadDrop";

type Program = {
  name: string;
  duration: string;
  mode: string;
  category: string;
  description: string;
  bullets: string[];
  brochureUrl?: string | null;
  certificateUrl?: string | null;
  courseUrl?: string | null;
  lsqVertical?: string | null;
  lsqProgramme?: string | null;
  certifications: { name: string; partnerInstitution: string; brochureUrl: string }[];
  curriculumModules: { title: string; content: string }[];
  addOnCertificates?: { id: string; name: string; pdfUrl: string; description: string | null }[];
};

export function ProgramForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: Program;
}) {
  return (
    <form action={action} className="max-w-2xl space-y-4">
      <Field label="Program name">
        <input required name="name" defaultValue={initial?.name} className={inputClass} />
      </Field>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Duration">
          <input required name="duration" defaultValue={initial?.duration ?? "6 months"} className={inputClass} />
        </Field>
        <Field label="Mode">
          <select name="mode" defaultValue={initial?.mode ?? "Offline"} className={inputClass}>
            <option>Offline</option>
            <option>Online</option>
          </select>
        </Field>
        <Field label="Category">
          <input required name="category" defaultValue={initial?.category} className={inputClass} />
        </Field>
      </div>
      <Field label="Description">
        <textarea required name="description" defaultValue={initial?.description} rows={3} className={inputClass} />
      </Field>
      <Field label="What it covers" hint="One bullet per line">
        <textarea
          name="bullets"
          defaultValue={initial?.bullets.join("\n")}
          rows={4}
          className={inputClass}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-outline-variant bg-white p-4">
        <p className="col-span-2 text-[13px] text-on-surface-variant">
          <strong className="text-ink">LeadSquared codes</strong> — required. They route closed sessions to LSQ with the
          right Program of Interest.
        </p>
        <Field label="LSQ vertical">
          <select required name="lsqVertical" defaultValue={initial?.lsqVertical ?? ""} className={inputClass}>
            <option value="" disabled>
              — Select —
            </option>
            {LSQ_VERTICALS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="LSQ programme">
          <select required name="lsqProgramme" defaultValue={initial?.lsqProgramme ?? ""} className={inputClass}>
            <option value="" disabled>
              — Select —
            </option>
            {Object.entries(COURSE_LABEL).map(([code, label]) => (
              <option key={code} value={code}>
                {code} — {label.replace(/\s+/g, " ")}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Course page link" hint="upGrad.com page for this course — counsellors click it to open the page in a new tab.">
        <input type="url" name="courseUrl" defaultValue={initial?.courseUrl ?? ""} className={inputClass} placeholder="https://www.upgrad.com/offline-centres/..." />
      </Field>
      <FileField
        label="Program brochure (PDF)"
        urlName="brochureUrl"
        fileName="brochureFile"
        defaultUrl={initial?.brochureUrl}
        hint="This is the single-click download shown on the program's tile and detail page."
      />
      <FileField
        label="Completion certificate (PDF)"
        urlName="certificateUrl"
        fileName="certificateFile"
        defaultUrl={initial?.certificateUrl}
        hint="Sample of the certificate a student receives on completing this program — shown on the program page and opens in a new tab when clicked."
      />
      <AdditionalCertificateFields existing={initial?.addOnCertificates} />
      <Field label="Certifications" hint="One per line: Certification Name | Partner Institution | Brochure URL">
        <textarea
          name="certifications"
          defaultValue={initial?.certifications.map((c) => `${c.name} | ${c.partnerInstitution} | ${c.brochureUrl}`).join("\n")}
          rows={3}
          className={inputClass}
          placeholder="AI/ML Certification | IIIT Bangalore | /brochures/ds.pdf"
        />
      </Field>
      <Field label="Curriculum modules" hint="One per line: Title | Content">
        <textarea
          name="modules"
          defaultValue={initial?.curriculumModules.map((m) => `${m.title} | ${m.content}`).join("\n")}
          rows={5}
          className={inputClass}
          placeholder="Python Foundations | Hands-on lessons covering..."
        />
      </Field>
      <Button type="submit">Save Program</Button>
    </form>
  );
}
