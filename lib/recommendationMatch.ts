export type RecommendationRow = {
  degree: string;
  choice1ProgramId: string | null;
};

/** Exact case-insensitive degree match first, else the "Other" fallback row. Shared
 * by the personalized hero and the close-session flow so both pick the same program. */
export function findRecommendationForDegree<T extends RecommendationRow>(
  recommendations: T[],
  degree: string,
): T | null {
  return (
    recommendations.find((r) => r.degree.toLowerCase() === degree.toLowerCase()) ??
    recommendations.find((r) => r.degree === "Other") ??
    null
  );
}
