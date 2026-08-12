import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/admin/AdminUI";
import { approveSuggestion, dismissSuggestion } from "@/app/admin/faqs/actions";

export default async function SuggestedQuestionsPage() {
  const [pending, categories] = await Promise.all([
    prisma.suggestedQuestion.findMany({ where: { status: "pending" }, orderBy: { createdAt: "desc" } }),
    prisma.faqCategory.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Suggested Questions</h1>
      <p className="mb-6 text-sm text-brand-ink2">
        Questions counsellors were asked live but couldn't find in the FAQ.
      </p>

      {pending.length === 0 && (
        <p className="text-sm text-brand-gray-400">Nothing pending — queue is clear.</p>
      )}

      <div className="space-y-4">
        {pending.map((q) => (
          <Card key={q.id} className="p-4">
            <p className="mb-3 text-sm font-semibold text-brand-ink">{q.question}</p>
            <form action={approveSuggestion.bind(null, q.id)} className="mb-2 space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr_auto]">
                <select name="categoryId" className={inputClass} defaultValue={categories[0]?.id}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <textarea name="answer" placeholder="Write the answer to publish..." rows={2} className={inputClass} />
                <Button type="submit" variant="secondary">
                  Approve → Publish
                </Button>
              </div>
            </form>
            <form action={dismissSuggestion.bind(null, q.id)}>
              <button className="text-xs font-semibold text-brand-gray-400 hover:text-brand-red">Dismiss</button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
