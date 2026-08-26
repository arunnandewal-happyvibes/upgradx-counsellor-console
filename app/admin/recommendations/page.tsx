import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { updateRecommendations } from "./actions";

export const dynamic = "force-dynamic";

const selectClass =
  "w-48 rounded-lg border border-brand-gray-200 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red";
const textareaClass =
  "w-64 rounded-lg border border-brand-gray-200 px-2 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red";

export default async function RecommendationsAdminPage() {
  const [recommendations, programs] = await Promise.all([
    prisma.degreeRecommendation.findMany({
      orderBy: { order: "asc" },
      include: { choice1Program: true, choice2Program: true, choice3Program: true },
    }),
    prisma.program.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  const ProgramSelect = ({ name, defaultValue }: { name: string; defaultValue?: string | null }) => (
    <select name={name} defaultValue={defaultValue ?? ""} className={selectClass}>
      <option value="">— None —</option>
      {programs.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Program Recommendations</h1>
      <p className="mb-6 text-sm text-brand-ink2">
        One row per degree (matches the onboarding flow's degree options, plus "Other" as the
        fallback for a custom-typed degree). Shown as up to 3 recommended programs, in order, on
        the console home hero once a student completes onboarding.
      </p>

      <form action={updateRecommendations}>
        <div className="overflow-x-auto rounded-card border border-brand-gray-200 bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-brand-gray-50 border-b border-brand-gray-200">
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-brand-gray-400">Degree</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-brand-gray-400">Choice 1</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-brand-gray-400">Why</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-brand-gray-400">Choice 2</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-brand-gray-400">Why</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-brand-gray-400">Choice 3</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-brand-gray-400">Why</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((rec) => (
                <tr key={rec.id} className="border-t border-brand-gray-100 align-top">
                  <input type="hidden" name="recId" value={rec.id} />
                  <td className="px-3 py-3 font-semibold text-brand-ink whitespace-nowrap">{rec.degree}</td>
                  <td className="px-3 py-3">
                    <ProgramSelect name={`choice1_${rec.id}`} defaultValue={rec.choice1ProgramId} />
                  </td>
                  <td className="px-3 py-3">
                    <textarea name={`why1_${rec.id}`} defaultValue={rec.choice1Why ?? ""} rows={3} className={textareaClass} />
                  </td>
                  <td className="px-3 py-3">
                    <ProgramSelect name={`choice2_${rec.id}`} defaultValue={rec.choice2ProgramId} />
                  </td>
                  <td className="px-3 py-3">
                    <textarea name={`why2_${rec.id}`} defaultValue={rec.choice2Why ?? ""} rows={3} className={textareaClass} />
                  </td>
                  <td className="px-3 py-3">
                    <ProgramSelect name={`choice3_${rec.id}`} defaultValue={rec.choice3ProgramId} />
                  </td>
                  <td className="px-3 py-3">
                    <textarea name={`why3_${rec.id}`} defaultValue={rec.choice3Why ?? ""} rows={3} className={textareaClass} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Button type="submit">Save All</Button>
        </div>
      </form>
    </div>
  );
}
