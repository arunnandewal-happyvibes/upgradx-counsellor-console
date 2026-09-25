"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { str } from "@/lib/adminParsing";
import { parseBatchUpload, type BatchUploadResult } from "@/lib/batchImport";

function data(formData: FormData) {
  return {
    programId: str(formData.get("programId")),
    cityId: str(formData.get("cityId")),
    startDate: new Date(str(formData.get("startDate"))),
    applicationCloseDate: new Date(str(formData.get("applicationCloseDate"))),
    timing: str(formData.get("timing")),
    location: str(formData.get("location")),
  };
}

export async function createBatch(formData: FormData) {
  await prisma.batch.create({ data: data(formData) });
  revalidatePath("/admin/batches");
  revalidatePath("/console");
  redirect("/admin/batches");
}

export async function updateBatch(id: string, formData: FormData) {
  await prisma.batch.update({ where: { id }, data: data(formData) });
  revalidatePath("/admin/batches");
  revalidatePath("/console");
  redirect("/admin/batches");
}

export async function deleteBatch(id: string) {
  await prisma.batch.delete({ where: { id } });
  revalidatePath("/admin/batches");
  revalidatePath("/console");
}

export async function uploadBatchesExcel(formData: FormData): Promise<BatchUploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { inserted: 0, skippedDuplicates: 0, errors: ["No file was selected."], totalDataRows: 0 };
  }

  const [programs, cities, existingBatches] = await Promise.all([
    prisma.program.findMany({ select: { id: true, name: true } }),
    prisma.city.findMany({ select: { id: true, name: true } }),
    prisma.batch.findMany({ select: { programId: true, cityId: true, startDate: true, applicationCloseDate: true } }),
  ]);

  let parsed;
  try {
    const buffer = await file.arrayBuffer();
    parsed = await parseBatchUpload(buffer, programs, cities, existingBatches);
  } catch {
    return {
      inserted: 0,
      skippedDuplicates: 0,
      errors: ["Couldn't read this file — make sure it's a .xlsx file saved from the downloaded template."],
      totalDataRows: 0,
    };
  }

  const { toInsert, result } = parsed;

  if (toInsert.length > 0) {
    await prisma.batch.createMany({ data: toInsert });
    revalidatePath("/admin/batches");
    revalidatePath("/console");
  }

  return { inserted: toInsert.length, ...result };
}
