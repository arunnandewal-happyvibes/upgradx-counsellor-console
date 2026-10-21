import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CounsellorForm } from "@/components/admin/CounsellorForm";
import { updateCounsellor } from "@/app/admin/counsellors/actions";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  name: "Enter the counsellor's name.",
  email: "Enter a valid email address.",
  centre: "Pick a centre.",
  duplicate: "Another counsellor already uses that email.",
};

export default async function EditCounsellorPage({ params, searchParams }: { params: { id: string }; searchParams: { error?: string } }) {
  const c = await prisma.counsellor.findUnique({ where: { id: params.id } });
  if (!c) notFound();
  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/counsellors" className="text-sm font-semibold text-on-surface-variant hover:text-ink">
        ← Counsellors
      </Link>
      <h1>Edit {c.name}</h1>
      {searchParams.error && ERRORS[searchParams.error] && (
        <div role="alert" className="max-w-xl rounded-2xl bg-primary-fixed px-4 py-3 text-[14px] font-medium text-primary-container">
          {ERRORS[searchParams.error]}
        </div>
      )}
      <CounsellorForm action={updateCounsellor.bind(null, c.id)} initial={c} />
    </div>
  );
}
