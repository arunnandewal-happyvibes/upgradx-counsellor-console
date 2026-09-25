import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { buildSessionsWhere } from "@/lib/sessionFilters";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city")?.trim() || "";
  const from = req.nextUrl.searchParams.get("from")?.trim() || "";
  const to = req.nextUrl.searchParams.get("to")?.trim() || "";
  const sort = req.nextUrl.searchParams.get("sort") === "date_asc" ? "asc" : "desc";

  const sessions = await prisma.lead.findMany({
    where: buildSessionsWhere({ city, from, to }),
    orderBy: { sessionClosedAt: sort },
    include: { recommendedProgram: { select: { name: true } } },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Closed Sessions");

  sheet.columns = [
    { header: "Closed At", key: "closedAt", width: 20 },
    { header: "Student Name", key: "name", width: 24 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Email", key: "email", width: 28 },
    { header: "Recommended Program", key: "program", width: 32 },
    { header: "Counsellor", key: "counsellor", width: 20 },
    { header: "City", key: "city", width: 16 },
    { header: "Rating", key: "rating", width: 10 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEEEEE" } };

  for (const s of sessions) {
    sheet.addRow({
      closedAt: s.sessionClosedAt
        ? s.sessionClosedAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
        : "",
      name: s.name,
      phone: s.phone ?? "",
      email: s.email ?? "",
      program: s.recommendedProgram?.name ?? "",
      counsellor: s.counsellorName ?? "",
      city: s.counsellorCity ?? "",
      rating: s.rating ?? "",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `closed-sessions-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
