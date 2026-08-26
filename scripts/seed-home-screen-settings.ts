import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Seeds the singleton HomeScreenSettings row with the copy that was
// previously hardcoded directly in HeroSection.tsx — a no-op visually,
// just moving the same text into the database so it's admin-editable.
async function main() {
  const existing = await prisma.homeScreenSettings.findFirst();
  if (existing) {
    console.log("HomeScreenSettings row already exists — leaving it as-is.");
    return;
  }
  await prisma.homeScreenSettings.create({ data: {} });
  console.log("Created default HomeScreenSettings row");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
