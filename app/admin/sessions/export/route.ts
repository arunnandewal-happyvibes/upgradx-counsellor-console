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
    { header: "Learner Name", key: "name", width: 24 },
    { header: "Learner Phone", key: "phone", width: 16 },
    { header: "Learner Email", key: "email", width: 28 },
    { header: "Student / Working", key: "occupation", width: 20 },
    { header: "Years of Experience", key: "experience", width: 20 },
    { header: "Recommended Program", key: "program", width: 32 },
    { header: "Counsellor", key: "counsellor", width: 20 },
    { header: "Counsellor Email", key: "counsellorEmail", width: 28 },
    { header: "City", key: "city", width: 16 },
    { header: "Rating", key: "rating", width: 10 },
    { header: "Referral", key: "referral", width: 24 },
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
      occupation: s.occupation ?? "",
      experience: s.yearsOfExperience ?? "",
      program: s.recommendedProgram?.name ?? "",
      counsellor: s.counsellorName ?? "",
      counsellorEmail: s.counsellorEmail ?? "",
      city: s.counsellorCity ?? "",
      rating: s.rating ?? "",
      referral: s.referralStatus ?? "",
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
