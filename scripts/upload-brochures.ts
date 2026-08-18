import { readFileSync } from "fs";
import { put } from "@vercel/blob";

const FILES: Array<{ key: string; path: string }> = [
  { key: "gen-ai-powered-data-analytics", path: "/Users/arunnandewal/Downloads/Data Analytics E-Brochure.pdf" },
  { key: "full-stack-development-with-ai", path: "/Users/arunnandewal/Downloads/Full Stack Development E-Brochure.pdf" },
  { key: "ai-pro", path: "/Users/arunnandewal/Downloads/AI Pro E-Brochure.pdf" },
  { key: "digital-marketing", path: "/Users/arunnandewal/Downloads/Digital Marketing E-Brochure.pdf" },
  { key: "futurestack-data-science", path: "/Users/arunnandewal/Downloads/Future Stack with IIIT-B E-Brochure.pdf" },
  {
    key: "global-investment-banking-operations",
    path: "/Users/arunnandewal/Downloads/Global & Investment Banking Operations E-Brochure.pdf",
  },
];

async function main() {
  const urls: Record<string, string> = {};
  for (const file of FILES) {
    const buffer = readFileSync(file.path);
    const blob = await put(`brochures/${file.key}.pdf`, buffer, {
      access: "public",
      contentType: "application/pdf",
      allowOverwrite: true,
    });
    urls[file.key] = blob.url;
    console.log(`${file.key} -> ${blob.url}`);
  }
  console.log("\nJSON:\n" + JSON.stringify(urls, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
