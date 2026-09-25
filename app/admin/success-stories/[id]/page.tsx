import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StoryForm } from "@/components/admin/StoryForm";
import { updateStory } from "@/app/admin/success-stories/actions";

export default async function EditStoryPage({ params }: { params: { id: string } }) {
  const [story, cities] = await Promise.all([
    prisma.successStory.findUnique({ where: { id: params.id } }),
    prisma.city.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!story) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-brand-ink">Edit Success Story</h1>
      <StoryForm action={updateStory.bind(null, story.id)} initial={story} cities={cities} />
    </div>
  );
}
