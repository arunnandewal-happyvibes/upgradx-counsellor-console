"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { linesToArray, str, strOrNull } from "@/lib/adminParsing";
import { maybeUploadImage } from "@/lib/blob";

async function data(formData: FormData) {
  const uploadedPhoto = await maybeUploadImage(formData, "photoFile", "instructors");
  return {
    name: str(formData.get("name")),
    linkedinUrl: strOrNull(formData.get("linkedinUrl")),
    subjectTaught: str(formData.get("subjectTaught")),
    bio: str(formData.get("bio")),
    experienceYears: Number(formData.get("experienceYears")) || 0,
    tags: linesToArray(formData.get("tags")),
    cityId: str(formData.get("cityId")),
    photoUrl: uploadedPhoto ?? strOrNull(formData.get("photoUrl")),
  };
}

export async function createInstructor(isIndustryLeader: boolean, formData: FormData) {
  await prisma.instructor.create({
    data: { ...(await data(formData)), isIndustryLeader },
  });

  const path = isIndustryLeader ? "/admin/industry-leaders" : "/admin/instructors";
  revalidatePath(path);
  revalidatePath("/console");
  redirect(path);
}

export async function updateInstructor(id: string, isIndustryLeader: boolean, formData: FormData) {
  await prisma.instructor.update({
    where: { id },
    data: await data(formData),
  });

  const path = isIndustryLeader ? "/admin/industry-leaders" : "/admin/instructors";
  revalidatePath(path);
  revalidatePath("/console");
  redirect(path);
}

export async function deleteInstructor(id: string, isIndustryLeader: boolean) {
  await prisma.instructor.delete({ where: { id } });
  const path = isIndustryLeader ? "/admin/industry-leaders" : "/admin/instructors";
  revalidatePath(path);
  revalidatePath("/console");
}
