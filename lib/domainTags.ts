export const DOMAIN_TAGS = [
  "FinTech",
  "E-commerce",
  "Tech",
  "AI and Machine Learning",
  "Business",
  "Consulting",
  "Product",
  "Services",
  // Added from the hiring-partner sector categorization (see scripts/import-hiring-partners.mjs)
  "AI & Deeptech",
  "Agritech",
  "Healthtech",
  "IT / ITES",
  "NBFCs & BFSI",
  "SaaS / Enterprise Software",
  "Edtech",
  "GCCs (Global Capability Centers)",
] as const;

export type DomainTag = (typeof DOMAIN_TAGS)[number];

export const MAX_STUDENT_INTERESTS = 4;
export const MAX_HIRING_PARTNER_TAGS = 3;
