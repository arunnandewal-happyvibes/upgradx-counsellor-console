import { prisma } from "@/lib/prisma";
import { parsePolicyBody, type PolicyBlock } from "@/lib/policyBody";

export const dynamic = "force-dynamic";

function BlockView({ block }: { block: PolicyBlock }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 className="text-headline-sm text-on-surface mb-4 mt-8 pb-2 border-b border-surface-variant first:mt-0">
          {block.text}
        </h2>
      );
    case "h4":
      return <h4 className="text-body-lg font-bold text-on-surface mt-4 mb-2">{block.text}</h4>;
    case "strong":
      return <p className="text-body-md font-bold text-on-surface mt-3 mb-2">{block.text}</p>;
    case "ul":
      return (
        <ul className="list-disc pl-6 mb-3 space-y-1.5">
          {block.items.map((item, i) => (
            <li key={i} className="text-body-md text-on-surface-variant leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      );
    case "p":
      return <p className="text-body-md text-on-surface-variant mb-3 leading-relaxed">{block.text}</p>;
  }
}

export default async function CareerServicesPolicyPage() {
  const policy = await prisma.careerServicesPolicy.findFirst();

  if (!policy) {
    return (
      <div className="pb-16 max-w-3xl">
        <h1 className="text-display-lg text-on-surface mb-2">Career Services &amp; Placement Assistance Policy</h1>
        <p className="text-body-md text-secondary">This policy hasn't been published yet — add it via /admin/career-services-policy.</p>
      </div>
    );
  }

  const blocks = parsePolicyBody(policy.body);

  return (
    <div className="pb-16 max-w-3xl">
      <h1 className="text-display-lg text-on-surface mb-2">{policy.title}</h1>
      <div className="h-0.5 bg-primary w-16 mb-4" />
      <p className="text-body-sm text-secondary mb-1">{policy.version}</p>
      <p className="text-body-sm text-secondary mb-section-gap">{policy.effectiveDate}</p>

      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}
