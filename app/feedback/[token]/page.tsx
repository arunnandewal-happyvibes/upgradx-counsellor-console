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
    <div className="flex min-h-screen flex-col bg-white">
      <header className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center px-container-margin lg:px-12">
        <Logo height={34} />
      </header>
      <main className="flex flex-grow items-center justify-center px-container-margin pb-20">
        <div className="w-full max-w-xl">
          {lead ? (
            <FeedbackForm
              token={params.token}
              firstName={lead.name.trim().split(/\s+/)[0] || lead.name}
              initialRating={lead.rating ?? preselected}
              alreadyRated={lead.rating !== null}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <span className="eyebrow">Rate your session</span>
              <h1 className="font-display text-[clamp(36px,5vw,56px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-ink">
                This link isn&apos;t valid.
              </h1>
              <p className="text-body-lg text-on-surface-variant">Please use the rating link from your session summary email.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
