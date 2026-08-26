"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { str } from "@/lib/adminParsing";

export async function updateHomeScreenSettings(formData: FormData) {
  const data = {
    headline: str(formData.get("headline")),
    subheadline: str(formData.get("subheadline")),
    primaryCtaLabel: str(formData.get("primaryCtaLabel")),
    secondaryCtaLabel: str(formData.get("secondaryCtaLabel")),
    placementRecordPercent: str(formData.get("placementRecordPercent")),
    placementRecordCaption: str(formData.get("placementRecordCaption")),
    careerGrowthCaption: str(formData.get("careerGrowthCaption")),
  };

  const existing = await prisma.homeScreenSettings.findFirst();
  if (existing) {
    await prisma.homeScreenSettings.update({ where: { id: existing.id }, data });
  } else {
    await prisma.homeScreenSettings.create({ data });
  }

  revalidatePath("/admin/home-screen");
  revalidatePath("/console");
}
