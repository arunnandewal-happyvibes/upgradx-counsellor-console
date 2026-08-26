import { PrismaClient } from "@prisma/client";
import { DEGREE_RECOMMENDATIONS } from "./degree-recommendations-data";

const prisma = new PrismaClient();

async function main() {
  const programs = await prisma.program.findMany({ select: { id: true, name: true } });
  const byName = new Map(programs.map((p) => [p.name, p.id]));

  for (const [i, rec] of DEGREE_RECOMMENDATIONS.entries()) {
    const [c1, c2, c3] = rec.choices;
    const ids = [c1, c2, c3].map((c) => byName.get(c.program));
    ids.forEach((id, idx) => {
      if (!id) console.warn(`  ⚠ No matching program found for "${rec.choices[idx].program}" (${rec.degree})`);
    });

    await prisma.degreeRecommendation.upsert({
      where: { degree: rec.degree },
      update: {
        choice1ProgramId: ids[0] ?? null,
        choice1Why: c1.why,
        choice2ProgramId: ids[1] ?? null,
        choice2Why: c2.why,
        choice3ProgramId: ids[2] ?? null,
        choice3Why: c3.why,
      },
      create: {
        degree: rec.degree,
        order: i,
        choice1ProgramId: ids[0] ?? null,
        choice1Why: c1.why,
        choice2ProgramId: ids[1] ?? null,
        choice2Why: c2.why,
        choice3ProgramId: ids[2] ?? null,
        choice3Why: c3.why,
      },
    });
    console.log(`Upserted recommendation for ${rec.degree}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
