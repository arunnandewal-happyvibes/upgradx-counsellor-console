export function linesToArray(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Parses "a | b | c" lines into tuples, dropping malformed rows. */
export function linesToTuples(value: FormDataEntryValue | null, parts: number): string[][] {
  return linesToArray(value)
    .map((line) => line.split("|").map((p) => p.trim()))
    .filter((tuple) => tuple.length === parts && tuple.every(Boolean));
}

export function str(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}
