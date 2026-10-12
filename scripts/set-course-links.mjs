import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE = "https://www.upgrad.com/offline-centres/";

// Matched by name keywords so it works against local and production course names.
const RULES = [
  // Partner-specific courses first — their names also contain "full stack" / "gen ai data science".
  { test: (n) => n.includes("jammu") && n.includes("full stack"), url: "full-stack-development-course-certificate-iit-jammu/" },
  { test: (n) => n.includes("jammu") && n.includes("data science"), url: "data-science-ai-ml-course-certificate-iit-jammu/" },
  { test: (n) => n.includes("future") && n.includes("stack"), url: "advanced-certificate-in-future-stack-data-science-gen-ai/" },
  { test: (n) => n.includes("ai pro"), url: "advanced-certificate-in-generative-ai-and-agentic-ai/" },
  { test: (n) => n.includes("digital marketing"), url: "advanced-certificate-in-digital-marketing/" },
  { test: (n) => n.includes("banking"), url: "certificate-global-investment-banking-operations-course/" },
  { test: (n) => n.includes("data analytics"), url: "advanced-certificate-in-data-analytics/" },
  { test: (n) => n.includes("full stack") && n.includes("advanced certificate"), url: "advanced-certificate-in-full-stack-development/" },
  { test: (n) => n.includes("full stack") && n.includes("ai"), url: "advanced-certificate-in-full-stack-development/" },
  { test: (n) => n.includes("data science") && n.includes("gen ai"), url: "advanced-certificate-in-data-science/" },
];

const programs = await prisma.program.findMany({ select: { id: true, name: true, courseUrl: true } });
for (const p of programs) {
  const rule = RULES.find((r) => r.test(p.name.toLowerCase()));
  if (!rule) {
    console.log(`SKIPPED (no confident match): ${p.name}`);
    continue;
  }
  await prisma.program.update({ where: { id: p.id }, data: { courseUrl: BASE + rule.url } });
  console.log(`${p.name} -> ${BASE + rule.url}`);
}
await prisma.$disconnect();
