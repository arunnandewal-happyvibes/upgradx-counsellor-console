"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { str } from "@/lib/adminParsing";

export async function createEvent(formData: FormData) {
  await prisma.event.create({
    data: {
      name: str(formData.get("name")),
      description: str(formData.get("description")),
      isEnabled: formData.get("isEnabled") === "on",
    },
  });
  revalidatePath("/admin/events");
  revalidatePath("/console");
  redirect("/admin/events");
}

export async function toggleEvent(id: string, isEnabled: boolean) {
  await prisma.event.update({ where: { id }, data: { isEnabled: !isEnabled } });
  revalidatePath("/admin/events");
  revalidatePath("/console");
}

export async function deleteEvent(id: string) {
  await prisma.event.delete({ where: { id } });
  revalidatePath("/admin/events");
  revalidatePath("/console");
}

export async function addOccurrence(eventId: string, formData: FormData) {
  await prisma.eventOccurrence.create({
    data: {
      eventId,
      cityId: str(formData.get("cityId")),
      date: new Date(str(formData.get("date"))),
    },
  });
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/console");
}

export async function deleteOccurrence(eventId: string, id: string) {
  await prisma.eventOccurrence.delete({ where: { id } });
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/console");
}
