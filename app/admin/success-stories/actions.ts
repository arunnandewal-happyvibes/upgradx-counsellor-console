"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { str } from "@/lib/adminParsing";

function data(formData: FormData) {
  return {
    studentName: str(formData.get("studentName")),
    courseName: str(formData.get("courseName")),
    roleLanded: str(formData.get("roleLanded")),
    company: str(formData.get("company")),
    description: str(formData.get("description")),
    packageLabel: str(formData.get("packageLabel")),
  };
}

export async function createStory(formData: FormData) {
  await prisma.successStory.create({ data: data(formData) });
  revalidatePath("/admin/success-stories");
  revalidatePath("/console");
  redirect("/admin/success-stories");
}

export async function updateStory(id: string, formData: FormData) {
  await prisma.successStory.update({ where: { id }, data: data(formData) });
  revalidatePath("/admin/success-stories");
  revalidatePath("/console");
  redirect("/admin/success-stories");
}

export async function deleteStory(id: string) {
  await prisma.successStory.delete({ where: { id } });
  revalidatePath("/admin/success-stories");
  revalidatePath("/console");
}
