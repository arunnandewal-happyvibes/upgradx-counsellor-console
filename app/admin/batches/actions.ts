"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { str } from "@/lib/adminParsing";

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
