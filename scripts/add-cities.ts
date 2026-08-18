import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Full learning-centre city list (matches the upGrad city grid + brochure footers).
// monumentImageUrl left null everywhere — no source image file was available to
// extract per-city photos from; these are seeded as placeholders for the admin
// to fill in via /admin/cities.
const CITIES = [
  "Hyderabad",
  "Chennai",
  "Belagavi",
  "Bhopal",
  "Bhubaneswar",
  "Coimbatore",
  "Dehradun",
  "Indore",
  "Gurugram",
  "Jabalpur",
  "Jaipur",
  "Kolkata",
  "Mangalore",
  "Chandigarh",
  "Bilaspur",
  "Raipur",
  "Panipat",
  "Rajkot",
  "Sambhajinagar",
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  // The existing "Bangalore" city is the same place as "Bengaluru" in the
  // reference city grid — rename in place so all existing batches/instructors/
  // drives tied to it keep working.
  await prisma.city.updateMany({ where: { slug: "bangalore" }, data: { name: "Bengaluru" } });

  for (const name of CITIES) {
    const slug = slugify(name);
    await prisma.city.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  const all = await prisma.city.findMany({ orderBy: { name: "asc" } });
  console.log(`Cities now in DB (${all.length}):`, all.map((c) => c.name).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
