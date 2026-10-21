"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { str } from "@/lib/adminParsing";
import { requireAdmin } from "@/lib/requireAdmin";

export async function upsertCityContact(cityId: string, formData: FormData) {
  await requireAdmin();
  const data = {
    address: str(formData.get("address")),
    phone: str(formData.get("phone")),
    email: str(formData.get("email")),
  };

  await prisma.cityContact.upsert({
    where: { cityId },
    update: data,
    create: { cityId, ...data },
  });

  revalidatePath("/admin/city-contacts");
  revalidatePath("/console/contact");
}
