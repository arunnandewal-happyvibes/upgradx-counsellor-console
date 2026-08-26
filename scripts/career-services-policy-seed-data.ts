import { POLICY_SECTIONS, POLICY_VERSION, POLICY_EFFECTIVE_DATE } from "../app/console/career-services-policy/content";

// Converts the original static content.ts (verbatim from "Career Services
// Policy 12 Aug 26.docx") into the line-based markup stored in
// CareerServicesPolicy.body — see lib/policyBody.ts for the format.
function renderBody(): string {
  const lines: string[] = [];
  for (const section of POLICY_SECTIONS) {
    lines.push(`## ${section.number}. ${section.title}`);
    for (const block of section.blocks) {
      if (block.type === "p") lines.push(block.text);
      else if (block.type === "h4") lines.push(`### ${block.text}`);
      else if (block.type === "strong") lines.push(`**${block.text}**`);
      else if (block.type === "ul") for (const item of block.items) lines.push(`- ${item}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

export const CAREER_SERVICES_POLICY_SEED = {
  title: "Career Services & Placement Assistance Policy",
  version: POLICY_VERSION,
  effectiveDate: POLICY_EFFECTIVE_DATE,
  body: renderBody(),
};
