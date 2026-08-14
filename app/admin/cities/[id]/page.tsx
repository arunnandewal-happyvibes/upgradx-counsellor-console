import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CityForm } from "@/components/admin/CityForm";
import { updateCity } from "@/app/admin/cities/actions";

export default async function EditCityPage({ params }: { params: { id: string } }) {
  const city = await prisma.city.findUnique({ where: { id: params.id } });
  if (!city) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-brand-ink">Edit — {city.name}</h1>
      <CityForm action={updateCity.bind(null, city.id)} initial={city} />
    </div>
  );
}
