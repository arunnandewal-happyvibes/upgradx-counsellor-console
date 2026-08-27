import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Every Prisma model, in schema declaration order — which happens to also be
 * FK-safe (parents declared before children), so restoring in this order
 * never violates a foreign key before its target exists.
 */
const MODEL_NAMES = Prisma.dmmf.datamodel.models.map((m) => m.name);

/** AddOnCertificate<->Program is the only implicit many-to-many relation in
 * the schema; every other model is fully described by its own scalar
 * columns, so it's the only one that needs special-casing below. */
const MANY_TO_MANY_MODEL = "AddOnCertificate";

function delegate(modelName: string) {
  const key = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[key];
}

export type Snapshot = {
  capturedAt: string;
  counts: Record<string, number>;
  data: Record<string, Record<string, unknown>[]>;
};

/** Dumps every row of every table into one plain-JSON snapshot. */
export async function buildSnapshot(): Promise<Snapshot> {
  const data: Record<string, Record<string, unknown>[]> = {};
  const counts: Record<string, number> = {};

  for (const modelName of MODEL_NAMES) {
    if (modelName === MANY_TO_MANY_MODEL) {
      const rows = await prisma.addOnCertificate.findMany({
        include: { programs: { select: { id: true } } },
      });
      data[modelName] = rows.map(({ programs, ...scalar }) => ({
        ...scalar,
        programIds: programs.map((p) => p.id),
      }));
    } else {
      data[modelName] = await delegate(modelName).findMany();
    }
    counts[modelName] = data[modelName].length;
  }

  return { capturedAt: new Date().toISOString(), counts, data };
}

/**
 * Upserts every row from a snapshot back into the database by `id` — never
 * deletes anything. Rows that still exist are left as-is (update is a
 * no-op-equivalent overwrite with the snapshot's values); rows that were
 * deleted since the snapshot was taken are recreated.
 */
export async function restoreSnapshot(snapshot: Snapshot): Promise<Record<string, number>> {
  const restored: Record<string, number> = {};

  for (const modelName of MODEL_NAMES) {
    const rows = snapshot.data[modelName] ?? [];
    let count = 0;

    for (const row of rows) {
      if (modelName === MANY_TO_MANY_MODEL) {
        const { programIds, ...scalar } = row as Record<string, unknown> & { programIds?: string[] };
        const ids = (programIds ?? []).map((id) => ({ id }));
        await prisma.addOnCertificate.upsert({
          where: { id: scalar.id as string },
          create: { ...scalar, programs: { connect: ids } } as Prisma.AddOnCertificateCreateInput,
          update: { ...scalar, programs: { set: ids } } as Prisma.AddOnCertificateUpdateInput,
        });
      } else {
        await delegate(modelName).upsert({
          where: { id: (row as { id: string }).id },
          create: row,
          update: row,
        });
      }
      count++;
    }

    restored[modelName] = count;
  }

  return restored;
}
