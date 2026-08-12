"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { str } from "@/lib/adminParsing";

export async function createFaq(formData: FormData) {
  await prisma.faq.create({
    data: {
      question: str(formData.get("question")),
      answer: str(formData.get("answer")),
      categoryId: str(formData.get("categoryId")),
    },
  });
  revalidatePath("/admin/faqs");
  revalidatePath("/console");
  redirect("/admin/faqs");
}

export async function updateFaq(id: string, formData: FormData) {
  await prisma.faq.update({
    where: { id },
    data: {
      question: str(formData.get("question")),
      answer: str(formData.get("answer")),
      categoryId: str(formData.get("categoryId")),
    },
  });
  revalidatePath("/admin/faqs");
  revalidatePath("/console");
  redirect("/admin/faqs");
}

export async function deleteFaq(id: string) {
  await prisma.faq.delete({ where: { id } });
  revalidatePath("/admin/faqs");
  revalidatePath("/console");
}

export async function approveSuggestion(id: string, formData: FormData) {
  const answer = str(formData.get("answer"));
  const categoryId = str(formData.get("categoryId"));
  const suggestion = await prisma.suggestedQuestion.findUnique({ where: { id } });
  if (!suggestion) return;

  await prisma.$transaction([
    prisma.faq.create({
      data: { question: suggestion.question, answer, categoryId },
    }),
    prisma.suggestedQuestion.update({ where: { id }, data: { status: "approved" } }),
  ]);

  revalidatePath("/admin/faqs/suggested");
  revalidatePath("/admin/faqs");
  revalidatePath("/console");
}

export async function dismissSuggestion(id: string) {
  await prisma.suggestedQuestion.update({ where: { id }, data: { status: "dismissed" } });
  revalidatePath("/admin/faqs/suggested");
}
