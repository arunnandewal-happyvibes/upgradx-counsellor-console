"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { linesToArray, linesToTuples, str, strOrNull } from "@/lib/adminParsing";
import { maybeUploadImage } from "@/lib/blob";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProgram(formData: FormData) {
  const name = str(formData.get("name"));
  const certs = linesToTuples(formData.get("certifications"), 3);
  const modules = linesToTuples(formData.get("modules"), 2);
  const uploadedBrochure = await maybeUploadImage(formData, "brochureFile", "brochures");

  await prisma.program.create({
    data: {
      name,
      slug: slugify(name),
      duration: str(formData.get("duration")),
      mode: str(formData.get("mode")),
      category: str(formData.get("category")),
      description: str(formData.get("description")),
      bullets: linesToArray(formData.get("bullets")),
      brochureUrl: uploadedBrochure ?? strOrNull(formData.get("brochureUrl")),
      certifications: {
        create: certs.map(([certName, partnerInstitution, brochureUrl]) => ({
          name: certName,
          partnerInstitution,
          brochureUrl,
        })),
      },
      curriculumModules: {
        create: modules.map(([title, content], order) => ({ title, order, content })),
      },
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/console");
  redirect("/admin/courses");
}

export async function updateProgram(id: string, formData: FormData) {
  const certs = linesToTuples(formData.get("certifications"), 3);
  const modules = linesToTuples(formData.get("modules"), 2);
  const uploadedBrochure = await maybeUploadImage(formData, "brochureFile", "brochures");

  await prisma.$transaction([
    prisma.certification.deleteMany({ where: { programId: id } }),
    prisma.curriculumModule.deleteMany({ where: { programId: id } }),
    prisma.program.update({
      where: { id },
      data: {
        name: str(formData.get("name")),
        duration: str(formData.get("duration")),
        mode: str(formData.get("mode")),
        category: str(formData.get("category")),
        description: str(formData.get("description")),
        bullets: linesToArray(formData.get("bullets")),
        brochureUrl: uploadedBrochure ?? strOrNull(formData.get("brochureUrl")),
        certifications: {
          create: certs.map(([certName, partnerInstitution, brochureUrl]) => ({
            name: certName,
            partnerInstitution,
            brochureUrl,
          })),
        },
        curriculumModules: {
          create: modules.map(([title, content], order) => ({ title, order, content })),
        },
      },
    }),
  ]);

  revalidatePath("/admin/courses");
  revalidatePath("/console");
  redirect("/admin/courses");
}

export async function deleteProgram(id: string) {
  await prisma.program.delete({ where: { id } });
  revalidatePath("/admin/courses");
  revalidatePath("/console");
}
