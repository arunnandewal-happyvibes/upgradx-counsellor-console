import { PrismaClient } from "@prisma/client";
import mentors from "./star-mentors-data.json";

const prisma = new PrismaClient();

// Real regular-teaching-staff roster ("Star Mentors") from the user-supplied
// "Star mentor details.xlsx" — name, LinkedIn, subject, 2-line bio, years of
// experience, and city all came straight from the sheet. The sheet's
// "Credibility Tags" column was empty for every row, so short tags below are
// reasoned from each person's bio/subject text (e.g. company names,
// specializations mentioned). photoUrl is left null: the sheet's "Image URL"
// column points at upGrad's internal SharePoint tenant (redirects to an
// SSO-gated OneDrive viewer), which can't be hotlinked or downloaded as a
// public image — upload real headshots via /admin/instructors once
// available as direct files.
async function main() {
  for (const m of mentors as any[]) {
    const city = await prisma.city.findUnique({ where: { slug: m.citySlug } });
    if (!city) {
      console.log(`Skipping ${m.name} — city ${m.citySlug} not found`);
      continue;
    }
    const existing = await prisma.instructor.findFirst({
      where: { name: m.name, isIndustryLeader: false },
    });
    const orderBase = await prisma.instructor.count({ where: { isIndustryLeader: false } });
    const data = {
      name: m.name,
      linkedinUrl: m.linkedinUrl,
      subjectTaught: m.subjectTaught,
      bio: m.bio,
      experienceYears: m.experienceYears,
      tags: m.tags,
      isIndustryLeader: false,
      cityId: city.id,
      order: existing ? existing.order : orderBase,
    };
    if (existing) {
      await prisma.instructor.update({ where: { id: existing.id }, data });
      console.log(`Updated ${m.name} (${city.name})`);
    } else {
      await prisma.instructor.create({ data });
      console.log(`Created ${m.name} (${city.name})`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
