"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { strOrNull } from "@/lib/adminParsing";

export async function updateRecommendations(formData: FormData) {
  const ids = formData.getAll("recId").map(String);

  await prisma.$transaction(
    ids.map((id) =>
      prisma.degreeRecommendation.update({
        where: { id },
        data: {
          choice1ProgramId: strOrNull(formData.get(`choice1_${id}`)),
          choice1Why: strOrNull(formData.get(`why1_${id}`)),
          choice2ProgramId: strOrNull(formData.get(`choice2_${id}`)),
          choice2Why: strOrNull(formData.get(`why2_${id}`)),
          choice3ProgramId: strOrNull(formData.get(`choice3_${id}`)),
          choice3Why: strOrNull(formData.get(`why3_${id}`)),
        },
      }),
    ),
  );

  revalidatePath("/admin/recommendations");
  revalidatePath("/console");
}
