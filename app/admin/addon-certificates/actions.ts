"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { str, strOrNull } from "@/lib/adminParsing";
import { maybeUploadImage } from "@/lib/blob";

function programIdsFrom(formData: FormData) {
  return formData.getAll("programIds").map(String).filter(Boolean);
}

export async function createAddOnCertificate(formData: FormData) {
  const uploadedPdf = await maybeUploadImage(formData, "pdfFile", "addon-certificates");
  const pdfUrl = uploadedPdf ?? strOrNull(formData.get("pdfUrl"));
  if (!pdfUrl) throw new Error("A certificate PDF (file upload or URL) is required.");

  await prisma.addOnCertificate.create({
    data: {
      name: str(formData.get("name")),
      pdfUrl,
      programs: { connect: programIdsFrom(formData).map((id) => ({ id })) },
    },
  });

  revalidatePath("/admin/addon-certificates");
  revalidatePath("/console");
  redirect("/admin/addon-certificates");
}

export async function updateAddOnCertificate(id: string, formData: FormData) {
  const uploadedPdf = await maybeUploadImage(formData, "pdfFile", "addon-certificates");
  const pdfUrl = uploadedPdf ?? strOrNull(formData.get("pdfUrl"));
  if (!pdfUrl) throw new Error("A certificate PDF (file upload or URL) is required.");

  await prisma.addOnCertificate.update({
    where: { id },
    data: {
      name: str(formData.get("name")),
      pdfUrl,
      programs: { set: programIdsFrom(formData).map((pid) => ({ id: pid })) },
    },
  });

  revalidatePath("/admin/addon-certificates");
  revalidatePath("/console");
  redirect("/admin/addon-certificates");
}

export async function deleteAddOnCertificate(id: string) {
  await prisma.addOnCertificate.delete({ where: { id } });
  revalidatePath("/admin/addon-certificates");
  revalidatePath("/console");
}
