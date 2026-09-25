import ExcelJS from "exceljs";

export const BATCH_TEMPLATE_HEADERS = [
  "Program Name",
  "City Name",
  "Start Date",
  "Application Close Date",
  "Timing",
  "Location",
] as const;

type ProgramRef = { id: string; name: string };
type CityRef = { id: string; name: string };
type ExistingBatch = {
  programId: string;
  cityId: string;
  startDate: Date;
  applicationCloseDate: Date;
};

export type ParsedBatchRow = {
  programId: string;
  cityId: string;
  startDate: Date;
  applicationCloseDate: Date;
  timing: string;
  location: string;
};

export type BatchUploadResult = {
  inserted: number;
  skippedDuplicates: number;
  errors: string[];
  totalDataRows: number;
};

/** Builds the downloadable .xlsx template — a data sheet with a header row and
 * one filled-in example row, plus a reference sheet listing every valid
 * Program/City name so admins can copy-paste exact spellings. */
export async function buildBatchTemplate(programs: ProgramRef[], cities: CityRef[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet("Batches");
  sheet.columns = [
    { header: BATCH_TEMPLATE_HEADERS[0], key: "program", width: 34 },
    { header: BATCH_TEMPLATE_HEADERS[1], key: "city", width: 20 },
    { header: BATCH_TEMPLATE_HEADERS[2], key: "startDate", width: 16 },
    { header: BATCH_TEMPLATE_HEADERS[3], key: "applicationCloseDate", width: 20 },
    { header: BATCH_TEMPLATE_HEADERS[4], key: "timing", width: 26 },
    { header: BATCH_TEMPLATE_HEADERS[5], key: "location", width: 30 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEDEDED" } };

  const exampleRow = sheet.addRow({
    program: programs[0]?.name ?? "Full Stack Development with AI",
    city: cities[0]?.name ?? "Bengaluru",
    startDate: new Date(),
    applicationCloseDate: new Date(),
    timing: "Mon–Fri, 6:00 PM – 9:00 PM",
    location: "upGrad X Centre, Bangalore",
  });
  exampleRow.font = { italic: true, color: { argb: "FF9A9A9A" } };
  exampleRow.getCell("startDate").numFmt = "yyyy-mm-dd";
  exampleRow.getCell("applicationCloseDate").numFmt = "yyyy-mm-dd";
  sheet.getCell("A2").note = "This row is an example — replace or delete it before uploading.";

  const refSheet = workbook.addWorksheet("Valid Names (reference)");
  refSheet.columns = [
    { header: "Program Name", key: "program", width: 40 },
    { header: "City Name", key: "city", width: 24 },
  ];
  refSheet.getRow(1).font = { bold: true };
  const maxLen = Math.max(programs.length, cities.length);
  for (let i = 0; i < maxLen; i++) {
    refSheet.addRow({ program: programs[i]?.name ?? "", city: cities[i]?.name ?? "" });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function cellToString(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "object" && "text" in (value as { text?: string })) {
    return String((value as { text?: string }).text ?? "");
  }
  if (typeof value === "object" && "richText" in (value as { richText?: { text: string }[] })) {
    return ((value as { richText: { text: string }[] }).richText ?? []).map((r) => r.text).join("");
  }
  return String(value).trim();
}

function cellToDate(value: ExcelJS.CellValue): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    // Excel serial date fallback (shouldn't normally hit this — numFmt keeps cells as Date).
    const epoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(epoch.getTime() + value * 86400000);
  }
  const text = cellToString(value);
  if (!text) return null;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Parses an uploaded .xlsx buffer against the template shape, validates every
 * row, and skips rows that already exist (same program+city+dates) so a
 * re-uploaded sheet only adds the genuinely new "delta" rows. */
export async function parseBatchUpload(
  buffer: ArrayBuffer,
  programs: ProgramRef[],
  cities: CityRef[],
  existingBatches: ExistingBatch[],
): Promise<{ toInsert: ParsedBatchRow[]; result: Omit<BatchUploadResult, "inserted"> }> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];

  const programByName = new Map(programs.map((p) => [p.name.trim().toLowerCase(), p]));
  const cityByName = new Map(cities.map((c) => [c.name.trim().toLowerCase(), c]));

  const errors: string[] = [];
  const toInsert: ParsedBatchRow[] = [];
  let skippedDuplicates = 0;
  let totalDataRows = 0;

  if (!sheet) {
    return { toInsert, result: { errors: ["The file has no sheets."], skippedDuplicates, totalDataRows } };
  }

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header
    const values = row.values as ExcelJS.CellValue[]; // 1-indexed, [0] unused
    const programName = cellToString(values[1]);
    const cityName = cellToString(values[2]);
    const startDate = cellToDate(values[3]);
    const applicationCloseDate = cellToDate(values[4]);
    const timing = cellToString(values[5]);
    const location = cellToString(values[6]);

    const isBlankRow = !programName && !cityName && !timing && !location && !startDate && !applicationCloseDate;
    if (isBlankRow) return;

    totalDataRows++;
    const rowErrors: string[] = [];

    const program = programName ? programByName.get(programName.trim().toLowerCase()) : undefined;
    if (!programName) rowErrors.push("Program Name is missing");
    else if (!program) rowErrors.push(`Program "${programName}" doesn't match any existing program — check the "Valid Names" sheet`);

    const city = cityName ? cityByName.get(cityName.trim().toLowerCase()) : undefined;
    if (!cityName) rowErrors.push("City Name is missing");
    else if (!city) rowErrors.push(`City "${cityName}" doesn't match any existing city — check the "Valid Names" sheet`);

    if (!startDate) rowErrors.push("Start Date is missing or not a valid date");
    if (!applicationCloseDate) rowErrors.push("Application Close Date is missing or not a valid date");
    if (startDate && applicationCloseDate && applicationCloseDate > startDate) {
      rowErrors.push("Application Close Date is after Start Date");
    }
    if (!timing) rowErrors.push("Timing is missing");
    if (!location) rowErrors.push("Location is missing");

    if (rowErrors.length > 0) {
      errors.push(`Row ${rowNumber}: ${rowErrors.join("; ")}`);
      return;
    }

    const duplicate = existingBatches.some(
      (b) =>
        b.programId === program!.id &&
        b.cityId === city!.id &&
        b.startDate.toDateString() === startDate!.toDateString() &&
        b.applicationCloseDate.toDateString() === applicationCloseDate!.toDateString(),
    );
    if (duplicate) {
      skippedDuplicates++;
      return;
    }

    toInsert.push({
      programId: program!.id,
      cityId: city!.id,
      startDate: startDate!,
      applicationCloseDate: applicationCloseDate!,
      timing,
      location,
    });
  });

  return { toInsert, result: { errors, skippedDuplicates, totalDataRows } };
}
