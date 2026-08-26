import { PrismaClient } from "@prisma/client";
import { CAREER_SERVICES_POLICY_SEED } from "./career-services-policy-seed-data";

const prisma = new PrismaClient();

// One-time migration: upserts the singleton CareerServicesPolicy row from
// the original static content.ts. Safe to re-run — always overwrites the
// same row.
async function main() {
  const existing = await prisma.careerServicesPolicy.findFirst();

  if (existing) {
    await prisma.careerServicesPolicy.update({ where: { id: existing.id }, data: CAREER_SERVICES_POLICY_SEED });
    console.log("Updated existing Career Services Policy row");
  } else {
    await prisma.careerServicesPolicy.create({ data: CAREER_SERVICES_POLICY_SEED });
    console.log("Created Career Services Policy row");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
