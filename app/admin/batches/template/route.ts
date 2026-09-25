import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildBatchTemplate } from "@/lib/batchImport";

export const dynamic = "force-dynamic";

export async function GET() {
  const [programs, cities] = await Promise.all([
    prisma.program.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.city.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const buffer = await buildBatchTemplate(programs, cities);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="upgradx-batches-template.xlsx"',
    },
  });
}
