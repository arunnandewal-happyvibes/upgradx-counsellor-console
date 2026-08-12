"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { linesToArray, str } from "@/lib/adminParsing";

export async function createInstructor(isIndustryLeader: boolean, formData: FormData) {
  await prisma.instructor.create({
    data: {
      name: str(formData.get("name")),
      linkedinUrl: str(formData.get("linkedinUrl")) || null,
      subjectTaught: str(formData.get("subjectTaught")),
      bio: str(formData.get("bio")),
      experienceYears: Number(formData.get("experienceYears")) || 0,
      tags: linesToArray(formData.get("tags")),
      cityId: str(formData.get("cityId")),
      isIndustryLeader,
    },
  });

  const path = isIndustryLeader ? "/admin/industry-leaders" : "/admin/instructors";
  revalidatePath(path);
  revalidatePath("/console");
  redirect(path);
}

export async function updateInstructor(id: string, isIndustryLeader: boolean, formData: FormData) {
  await prisma.instructor.update({
    where: { id },
    data: {
      name: str(formData.get("name")),
      linkedinUrl: str(formData.get("linkedinUrl")) || null,
      subjectTaught: str(formData.get("subjectTaught")),
      bio: str(formData.get("bio")),
      experienceYears: Number(formData.get("experienceYears")) || 0,
      tags: linesToArray(formData.get("tags")),
      cityId: str(formData.get("cityId")),
    },
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
