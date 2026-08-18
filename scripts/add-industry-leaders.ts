import { PrismaClient } from "@prisma/client";
import leaders from "./industry-leaders-data.json";

const prisma = new PrismaClient();

// Real guest-lecturer/SME roster from the user-supplied "Guest Lecturer
// Details.xlsx" (name, email, mobile, LinkedIn, skills, current company).
// The sheet has no photo, subject label, bio, experience-years, or city
// column, so those are reasoned from the Skills/Company fields:
//   - subjectTaught / tags / bio: summarized from the Skills + Current
//     Company columns.
//   - experienceYears: inferred from seniority of title (not in the sheet).
//   - photoUrl: left null — no source image, placeholder shown until a
//     real headshot is uploaded via /admin/industry-leaders.
//   - city: Industry Leaders are shown across every centre (not
//     city-filtered), so cityId is only a required-by-schema placeholder —
//     defaulted to Bangalore and has no effect on where they're shown.
//   - email / mobile from the sheet are not stored: there's no schema field
//     for them and they're not displayed anywhere on the public console.
async function main() {
  const bangalore = await prisma.city.findUnique({ where: { slug: "bangalore" } });
  if (!bangalore) throw new Error("Bangalore city not found — run city seed scripts first");

  const existingCount = await prisma.instructor.count({ where: { isIndustryLeader: true } });

  for (const [i, leader] of (leaders as any[]).entries()) {
    const existing = await prisma.instructor.findFirst({
      where: { name: leader.name, isIndustryLeader: true },
    });
    const data = {
      name: leader.name,
      linkedinUrl: leader.linkedinUrl,
      subjectTaught: leader.subjectTaught,
      bio: leader.bio,
      experienceYears: leader.experienceYears,
      tags: leader.tags,
      isIndustryLeader: true,
      cityId: bangalore.id,
      order: existingCount + i,
    };
    if (existing) {
      await prisma.instructor.update({ where: { id: existing.id }, data });
      console.log(`Updated ${leader.name}`);
    } else {
      await prisma.instructor.create({ data });
      console.log(`Created ${leader.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
