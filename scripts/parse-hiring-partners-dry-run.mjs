import ExcelJS from "exceljs";

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
  // Strip a trailing parenthetical annotation like "(Hub)", "(Largest Campus)"
  name = name.replace(/\s*\([^)]*\)\s*$/, "").trim();
  // A few known canonicalizations so the same real company doesn't fork into
  // multiple rows (e.g. "Amazon India" and "Amazon" from different cities).
  const canon = {
    "amazon india": "Amazon",
    "amazon": "Amazon",
  };
  const key = name.toLowerCase();
  return canon[key] ?? name;
}

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile("/Users/arunnandewal/Downloads/For CI.xlsx");
  const ws = wb.worksheets[0];

  const companyTags = new Map(); // name -> Map(tag -> count)
  const unmappedSectors = new Set();

  for (let i = 3; i <= ws.rowCount; i++) {
    const row = ws.getRow(i);
    const city = row.getCell(5).value;
    const sector = row.getCell(6).value;
    const companiesRaw = row.getCell(7).value;
    if (!city || !sector || !companiesRaw) continue;

    const tag = SECTOR_TAG_MAP[String(sector).trim()];
    if (!tag) {
      unmappedSectors.add(String(sector));
      continue;
    }

    const names = String(companiesRaw)
      .split(",")
      .map((s) => cleanCompanyName(s))
      .filter(Boolean);

    for (const name of names) {
      if (!companyTags.has(name)) companyTags.set(name, new Map());
      const tagCounts = companyTags.get(name);
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  console.log("Unmapped sectors:", [...unmappedSectors]);
  console.log("Total unique companies:", companyTags.size);
  console.log("");

  const rows = [...companyTags.entries()]
    .map(([name, tagCounts]) => {
      const tags = [...tagCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([t]) => t)
        .slice(0, 3);
      return { name, tags };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  rows.forEach((r) => console.log(r.name, "->", r.tags.join(" | ")));
}

main();
