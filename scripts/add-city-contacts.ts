import { PrismaClient } from "@prisma/client";
import contacts from "./city-contacts-data.json";

const prisma = new PrismaClient();

// Real contact-centre address/phone data extracted from the user-supplied
// "upgrad_locations_clean.xlsx" location export (310 upGrad locations across
// India). For each city we picked the highest-relevance real "Learning
// Support Centre" (or nearest equivalent) entry. Email has no source in the
// spreadsheet, so it follows the existing <city>@upgradx.com convention.
async function main() {
  for (const [slug, data] of Object.entries(contacts as Record<string, { address: string; phone: string; email: string }>)) {
    const city = await prisma.city.findUnique({ where: { slug } });
    if (!city) {
      console.log(`Skipping ${slug} — no matching city in DB`);
      continue;
    }
    await prisma.cityContact.upsert({
      where: { cityId: city.id },
      update: { address: data.address, phone: data.phone, email: data.email },
      create: { cityId: city.id, address: data.address, phone: data.phone, email: data.email },
    });
    console.log(`Upserted contact for ${city.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
