"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type City = { id: string; name: string; slug: string };

const QUALIFICATIONS = [
  "12th / Diploma",
  "Undergraduate (pursuing)",
  "Graduate",
  "Postgraduate",
  "Working Professional",
];

export function OnboardingForm({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    cityId: cities[0]?.id ?? "",
    qualification: QUALIFICATIONS[1],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Could not save details");
      const city = cities.find((c) => c.id === form.cityId);
      router.push(`/console${city ? `?city=${city.slug}` : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const inputClass =
    "h-10 px-3 py-2 text-body-md rounded border border-surface-variant bg-white text-on-surface transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";
  const labelClass = "text-label-bold font-bold text-on-surface-variant uppercase";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Name</label>
        <input required className={inputClass} value={form.name} onChange={update("name")} placeholder="Full Name" />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Phone Number</label>
        <input
          required
          type="tel"
          className={inputClass}
          value={form.phone}
          onChange={update("phone")}
          placeholder="+91 XXXXX XXXXX"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Email ID</label>
        <input
          required
          type="email"
          className={inputClass}
          value={form.email}
          onChange={update("email")}
          placeholder="work@example.com"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>City</label>
        <select required className={inputClass} value={form.cityId} onChange={update("cityId")}>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Highest Qualification</label>
        <select required className={inputClass} value={form.qualification} onChange={update("qualification")}>
          {QUALIFICATIONS.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-body-sm text-primary">{error}</p>}

      <div className="pt-4 mt-2 border-t border-surface-variant">
        <Button type="submit" disabled={submitting} className="w-full py-3">
          {submitting ? "Loading..." : "Continue to upGrad X"}
        </Button>
      </div>
    </form>
  );
}
