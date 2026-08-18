import { PrismaClient } from "@prisma/client";
import stories from "./success-stories-data.json";

const prisma = new PrismaClient();

// Replaces all Success Stories with the real "Testimonials Given" tab from
// the user-supplied "Placements till date.xlsx". Name, LinkedIn, program,
// role, company and package figures all came directly from the sheet. 8 of
// the 20 rows had a real written testimonial in the sheet — kept verbatim
// (only whitespace-normalized) as the `description`. The other 12 rows had
// no testimonial text at all, so their `description` is a short factual
// sentence synthesized only from that row's own real fields (program, role,
// company, package) — no invented backstory or embellishment.
//
// avatarUrl is left null for every row on purpose: the sheet's Photograph
// column is a mix of bare local filenames (no accessible file), private
// Google Drive links, and one explicit "No Consent" — none of which can be
// safely auto-applied. linkedinUrl is populated and shown as a clickable
// link in /admin/success-stories so a real headshot can be pulled from each
// person's LinkedIn profile manually.
//
// One data quirk worth knowing: Rohith AP's real testimonial text thanks
// "All Soft" by name, but the sheet's own Company Name column for his row
// says "upGrad" — kept the testimonial verbatim and used the structured
// column (upGrad) for the `company` field, since that's the more reliable
// source, but the mismatch is unresolved in the source data itself.
async function main() {
  await prisma.successStory.deleteMany();
  await prisma.successStory.createMany({
    data: (stories as any[]).map((s, order) => ({
      studentName: s.studentName,
      linkedinUrl: s.linkedinUrl,
      courseName: s.courseName,
      roleLanded: s.roleLanded,
      company: s.company,
      description: s.description,
      packageLabel: s.packageLabel,
      avatarUrl: null,
      order,
    })),
  });
  console.log(`Created ${stories.length} real success stories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
