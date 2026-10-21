"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { linesToArray, linesToTuples, str, strOrNull } from "@/lib/adminParsing";
import { LSQ_PROGRAMMES, LSQ_VERTICALS } from "@/lib/leadDrop";
import { maybeUploadImage } from "@/lib/blob";
import { requireAddOnDescription } from "@/lib/addOnCertificate";
import { requireAdmin } from "@/lib/requireAdmin";

/** Reads the optional "additional certificate" block; returns null when it's left entirely empty. */
async function additionalCertificateFrom(formData: FormData) {
  const name = str(formData.get("addOnName"));
  const uploaded = await maybeUploadImage(formData, "addOnPdfFile", "addon-certificates");
  const pdfUrl = uploaded ?? strOrNull(formData.get("addOnPdfUrl"));
  const rawDescription = str(formData.get("addOnDescription"));
  if (!name && !pdfUrl && !rawDescription) return null;
  if (!name || !pdfUrl) throw new Error("An additional certificate needs both a name and a PDF.");
  return { name, pdfUrl, description: requireAddOnDescription(rawDescription) };
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Both LSQ codes are required: they build the Source Campaign and pick the Program of
// Interest label (lib/leadDrop.ts). The form's selects are `required`; this is the backstop.
function lsqCodes(formData: FormData) {
  const lsqVertical = str(formData.get("lsqVertical"));
  const lsqProgramme = str(formData.get("lsqProgramme"));
  if (!(LSQ_VERTICALS as readonly string[]).includes(lsqVertical) || !LSQ_PROGRAMMES.includes(lsqProgramme)) {
    throw new Error("Pick the LSQ vertical and programme for this program.");
  }
  return { lsqVertical, lsqProgramme };
}

export async function createProgram(formData: FormData) {
  await requireAdmin();
  const name = str(formData.get("name"));
  const certs = linesToTuples(formData.get("certifications"), 3);
  const modules = linesToTuples(formData.get("modules"), 2);
  const uploadedBrochure = await maybeUploadImage(formData, "brochureFile", "brochures");
  const uploadedCertificate = await maybeUploadImage(formData, "certificateFile", "certificates");
  const addOn = await additionalCertificateFrom(formData);

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
      certificateUrl: uploadedCertificate ?? strOrNull(formData.get("certificateUrl")),
      courseUrl: strOrNull(formData.get("courseUrl")),
      ...lsqCodes(formData),
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
      ...(addOn ? { addOnCertificates: { create: addOn } } : {}),
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/admin/addon-certificates");
  revalidatePath("/console");
  redirect("/admin/courses");
}

export async function updateProgram(id: string, formData: FormData) {
  await requireAdmin();
  const certs = linesToTuples(formData.get("certifications"), 3);
  const modules = linesToTuples(formData.get("modules"), 2);
  const uploadedBrochure = await maybeUploadImage(formData, "brochureFile", "brochures");
  const uploadedCertificate = await maybeUploadImage(formData, "certificateFile", "certificates");
  const addOn = await additionalCertificateFrom(formData);

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
        certificateUrl: uploadedCertificate ?? strOrNull(formData.get("certificateUrl")),
        courseUrl: strOrNull(formData.get("courseUrl")),
        ...lsqCodes(formData),
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
        ...(addOn ? { addOnCertificates: { create: addOn } } : {}),
      },
    }),
  ]);

  revalidatePath("/admin/courses");
  revalidatePath("/console");
  redirect("/admin/courses");
}

export async function deleteProgram(id: string) {
  await requireAdmin();
  await prisma.program.delete({ where: { id } });
  revalidatePath("/admin/courses");
  revalidatePath("/console");
}
