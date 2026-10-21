import { prisma } from "@/lib/prisma";
import { parsePolicyBody, type PolicyBlock } from "@/lib/policyBody";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

function BlockView({ block }: { block: PolicyBlock }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 className="mb-4 mt-12 border-t border-outline-variant pt-8 font-display text-[28px] font-bold tracking-[-0.02em] text-ink first:mt-0 first:border-0 first:pt-0">
          {block.text}
        </h2>
      );
    case "h4":
      return <h4 className="mb-2 mt-6 text-[18px] font-bold text-ink">{block.text}</h4>;
    case "strong":
      return <p className="mb-2 mt-4 text-[16px] font-bold text-ink">{block.text}</p>;
    case "ul":
      return (
        <ul className="mb-4 space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[16px] leading-relaxed text-[#3d3d3d]">
              <span className="mt-[11px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      );
    case "p":
      return <p className="mb-4 text-[16px] leading-relaxed text-[#3d3d3d]">{block.text}</p>;
  }
}

export default async function CareerServicesPolicyPage() {
  const policy = await prisma.careerServicesPolicy.findFirst();

  if (!policy) {
    return (
      <PageHeader
        back={{ href: "/console", label: "Console" }}
        eyebrow="Policy"
        title="Career services & placement assistance."
        lead="This policy hasn't been published yet — an admin can add it under Career Services Policy."
      />
    );
  }

  const blocks = parsePolicyBody(policy.body);

  return (
    <div className="flex flex-col gap-12">
      <PageHeader back={{ href: "/console", label: "Console" }} eyebrow="Policy" title={policy.title}>
        {policy.version && (
          <span className="rounded-full bg-surface-container px-3 py-1.5 text-[13px] font-semibold text-ink">{policy.version}</span>
        )}
        {policy.effectiveDate && (
          <span className="rounded-full border border-outline-variant px-3 py-1.5 text-[13px] text-on-surface-variant">
            {policy.effectiveDate}
          </span>
        )}
      </PageHeader>
      <article className="max-w-3xl">
        {blocks.map((block, i) => (
          <BlockView key={i} block={block} />
        ))}
      </article>
    </div>
  );
}
