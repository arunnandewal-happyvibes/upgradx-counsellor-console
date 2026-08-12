/**
 * Wraps a data-driven section: renders nothing when `hasData` is false,
 * per the "hide module completely, no placeholder" build rule.
 */
export function EmptyCollapse({
  hasData,
  children,
}: {
  hasData: boolean;
  children: React.ReactNode;
}) {
  if (!hasData) return null;
  return <>{children}</>;
}
