import { readFileSync } from "fs";
import { put } from "@vercel/blob";

async function main() {
  const buffer = readFileSync("/Users/arunnandewal/Downloads/Gen-AI Powered Data Science E-Brochure.pdf");
  const blob = await put("brochures/gen-ai-powered-data-science.pdf", buffer, {
    access: "public",
    contentType: "application/pdf",
    allowOverwrite: true,
  });
  console.log(blob.url);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
