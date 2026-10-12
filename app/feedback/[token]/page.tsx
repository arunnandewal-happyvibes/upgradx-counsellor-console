import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/ui/Logo";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rate your session — upGrad X" };

export default async function FeedbackPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { rating?: string };
}) {
  const lead = /^[a-f0-9]{32}$/.test(params.token)
    ? await prisma.lead.findUnique({
        where: { feedbackToken: params.token },
        select: { name: true, rating: true },
      })
    : null;

  const fromEmail = Number(searchParams.rating);
  const preselected = Number.isInteger(fromEmail) && fromEmail >= 1 && fromEmail <= 5 ? fromEmail : 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border-t-4 border-t-primary bg-surface-container-lowest p-8 text-center shadow-xl">
        <div className="mb-6 flex justify-center">
          <Logo height={34} />
        </div>
        {lead ? (
          <FeedbackForm
            token={params.token}
            firstName={lead.name.trim().split(/\s+/)[0] || lead.name}
            initialRating={lead.rating ?? preselected}
            alreadyRated={lead.rating !== null}
          />
        ) : (
          <>
            <h1 className="mb-2 text-headline-md text-on-surface">This link isn&apos;t valid</h1>
            <p className="text-body-md text-on-surface-variant">
              Please use the rating link from your session summary email.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
