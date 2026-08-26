import { POLICY_SECTIONS, POLICY_VERSION, POLICY_EFFECTIVE_DATE, type Block } from "./content";

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p className="text-body-md text-on-surface-variant mb-3 leading-relaxed">{block.text}</p>;
    case "ul":
      return (
        <ul className="list-disc pl-6 mb-3 space-y-1.5">
          {block.items.map((item) => (
            <li key={item} className="text-body-md text-on-surface-variant leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      );
    case "h4":
      return <h4 className="text-body-lg font-bold text-on-surface mt-4 mb-2">{block.text}</h4>;
    case "strong":
      return <p className="text-body-md font-bold text-on-surface mt-3 mb-2">{block.text}</p>;
  }
}

export default function CareerServicesPolicyPage() {
  return (
    <div className="pb-16 max-w-3xl">
      <h1 className="text-display-lg text-on-surface mb-2">Career Services &amp; Placement Assistance Policy</h1>
      <div className="h-0.5 bg-primary w-16 mb-4" />
      <p className="text-body-sm text-secondary mb-1">{POLICY_VERSION}</p>
      <p className="text-body-sm text-secondary mb-section-gap">{POLICY_EFFECTIVE_DATE}</p>

      <div className="flex flex-col gap-section-gap">
        {POLICY_SECTIONS.map((section) => (
          <section key={section.number}>
            <h2 className="text-headline-sm text-on-surface mb-4 pb-2 border-b border-surface-variant">
              {section.number}. {section.title}
            </h2>
            {section.blocks.map((block, i) => (
              <BlockView key={i} block={block} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
