"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { str, strOrNull } from "@/lib/adminParsing";
import { maybeUploadImage } from "@/lib/blob";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function data(formData: FormData) {
  const uploadedMonument = await maybeUploadImage(formData, "monumentFile", "cities");
  return {
    monumentImageUrl: uploadedMonument ?? strOrNull(formData.get("monumentImageUrl")),
  };
}

export async function createCity(formData: FormData) {
  const name = str(formData.get("name"));
  await prisma.city.create({
    data: { name, slug: slugify(name), ...(await data(formData)) },
  });
  revalidatePath("/admin/cities");
  revalidatePath("/console");
  redirect("/admin/cities");
}

export async function updateCity(id: string, formData: FormData) {
  await prisma.city.update({
    where: { id },
    data: { name: str(formData.get("name")), ...(await data(formData)) },
  });
  revalidatePath("/admin/cities");
  revalidatePath("/console");
  redirect("/admin/cities");
}

export async function deleteCity(id: string) {
  try {
    await prisma.city.delete({ where: { id } });
    revalidatePath("/admin/cities");
    revalidatePath("/console");
  } catch (err) {
    // City still has instructors, batches, drives, leads, or a contact record
    // pointing at it — Postgres' foreign-key constraint blocks the delete.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      redirect("/admin/cities?error=in-use");
    }
    throw err;
  }
}
