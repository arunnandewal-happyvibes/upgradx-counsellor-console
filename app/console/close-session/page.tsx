import { prisma } from "@/lib/prisma";
import { CloseSessionClient } from "@/components/console/CloseSessionClient";

export const dynamic = "force-dynamic";

export default async function CloseSessionPage() {
  const [programs, recommendations] = await Promise.all([
    prisma.program.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, duration: true },
    }),
    prisma.degreeRecommendation.findMany({
      select: { degree: true, choice1ProgramId: true },
    }),
  ]);

  return <CloseSessionClient programs={programs} recommendations={recommendations} />;
}
