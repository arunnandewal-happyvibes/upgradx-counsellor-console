import type { Prisma } from "@prisma/client";

export type SessionFilterParams = {
  city?: string;
  from?: string;
  to?: string;
};

/** Shared between the admin Closed Sessions page and its Excel export so
 * the exported rows always match exactly what's on screen. */
export function buildSessionsWhere({ city, from, to }: SessionFilterParams): Prisma.LeadWhereInput {
  return {
    sessionClosedAt: {
      not: null,
      ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
      ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
    },
    ...(city ? { counsellorCity: city } : {}),
  };
}
