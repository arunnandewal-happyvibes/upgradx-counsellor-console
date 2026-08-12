import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";

type Category = { id: string; name: string };
type Faq = { question: string; answer: string; categoryId: string };

export function FaqForm({
  action,
  categories,
  initial,
}: {
  action: (formData: FormData) => void;
  categories: Category[];
  initial?: Faq;
}) {
  return (
    <form action={action} className="max-w-xl space-y-4">
      <Field label="Category">
        <select required name="categoryId" defaultValue={initial?.categoryId} className={inputClass}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Question">
        <input required name="question" defaultValue={initial?.question} className={inputClass} />
      </Field>
      <Field label="Answer (2-3 lines)">
        <textarea required name="answer" defaultValue={initial?.answer} rows={3} className={inputClass} />
      </Field>
      <Button type="submit">Save FAQ</Button>
    </form>
  );
}
