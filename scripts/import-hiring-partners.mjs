import ExcelJS from "exceljs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SECTOR_TAG_MAP = {
  "Fintech": "FinTech",
  "E-commerce / D2C": "E-commerce",
  "AI & Deeptech": "AI & Deeptech",
  "Agritech": "Agritech",
  "Healthtech": "Healthtech",
  "IT / ITES": "IT / ITES",
  "NBFCs & BFSI": "NBFCs & BFSI",
  "SaaS / Enterprise Software": "SaaS / Enterprise Software",
  "Edtech": "Edtech",
  "GCCs (Global Capability Centers)": "GCCs (Global Capability Centers)",
};

function cleanCompanyName(raw) {
  let name = raw.trim();
  name = name.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const canon = { "amazon india": "Amazon", amazon: "Amazon" };
  return canon[name.toLowerCase()] ?? name;
}

function uppercaseCount(s) {
  return (s.match(/[A-Z]/g) ?? []).length;
}

async function parseExcel() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile("/Users/arunnandewal/Downloads/For CI.xlsx");
  const ws = wb.worksheets[0];

  // key: lowercase name -> { canonicalName, tagCounts: Map(tag -> count) }
  const companies = new Map();

  for (let i = 3; i <= ws.rowCount; i++) {
    const row = ws.getRow(i);
    const sector = row.getCell(6).value;
    const companiesRaw = row.getCell(7).value;
    if (!sector || !companiesRaw) continue;

    const tag = SECTOR_TAG_MAP[String(sector).trim()];
    if (!tag) continue;

    const names = String(companiesRaw)
      .split(",")
      .map(cleanCompanyName)
      .filter(Boolean);

    for (const name of names) {
      const key = name.toLowerCase();
      if (!companies.has(key)) {
        companies.set(key, { canonicalName: name, tagCounts: new Map() });
      }
      const entry = companies.get(key);
      // Prefer the more distinctively-cased variant (e.g. "PharmEasy" over "Pharmeasy").
      if (uppercaseCount(name) > uppercaseCount(entry.canonicalName)) {
        entry.canonicalName = name;
      }
      entry.tagCounts.set(tag, (entry.tagCounts.get(tag) ?? 0) + 1);
    }
  }

  return [...companies.values()]
    .map(({ canonicalName, tagCounts }) => ({
      name: canonicalName,
      tags: [...tagCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([t]) => t)
        .slice(0, 3),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function main() {
  const parsed = await parseExcel();
  console.log(`Parsed ${parsed.length} unique companies from excel.`);

  const existing = await prisma.hiringPartner.findMany({ select: { id: true, name: true, order: true } });
  const existingByLower = new Map(existing.map((p) => [p.name.toLowerCase(), p]));
  const maxOrder = existing.reduce((m, p) => Math.max(m, p.order), -1);

  let updated = 0;
  let created = 0;
  let nextOrder = maxOrder + 1;

  for (const company of parsed) {
    const match = existingByLower.get(company.name.toLowerCase());
    if (match) {
      await prisma.hiringPartner.update({ where: { id: match.id }, data: { tags: company.tags } });
      updated++;
    } else {
      await prisma.hiringPartner.create({
        data: { name: company.name, tags: company.tags, order: nextOrder++ },
      });
      created++;
    }
  }

  console.log(`Updated ${updated} existing partners, created ${created} new partners.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
