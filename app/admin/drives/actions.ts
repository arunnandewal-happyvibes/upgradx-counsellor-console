"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { str } from "@/lib/adminParsing";

function data(formData: FormData) {
  return {
    company: str(formData.get("company")),
    role: str(formData.get("role")),
    cityId: str(formData.get("cityId")),
    date: new Date(str(formData.get("date"))),
  };
}

export async function createDrive(formData: FormData) {
  await prisma.placementDrive.create({ data: data(formData) });
  revalidatePath("/admin/drives");
  revalidatePath("/console");
  redirect("/admin/drives");
}

export async function updateDrive(id: string, formData: FormData) {
  await prisma.placementDrive.update({ where: { id }, data: data(formData) });
  revalidatePath("/admin/drives");
  revalidatePath("/console");
  redirect("/admin/drives");
}

export async function deleteDrive(id: string) {
  await prisma.placementDrive.delete({ where: { id } });
  revalidatePath("/admin/drives");
  revalidatePath("/console");
}
