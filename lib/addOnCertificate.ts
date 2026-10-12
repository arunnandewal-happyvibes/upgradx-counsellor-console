export const ADD_ON_DESCRIPTION_PLACEHOLDER =
  "Please add any additional masterclasses or projects that are needed for this certificate";
export const ADD_ON_DESCRIPTION_MIN = 40;
export const ADD_ON_DESCRIPTION_MAX = 500;

/** Returns the trimmed description, or throws if it's missing or too short to be a real 2-3 liner. */
export function requireAddOnDescription(raw: FormDataEntryValue | null): string {
  const text = String(raw ?? "").trim();
  if (text.length < ADD_ON_DESCRIPTION_MIN) {
    throw new Error(
      `An additional certificate needs a 2-3 line description of its extra masterclasses or projects (at least ${ADD_ON_DESCRIPTION_MIN} characters).`,
    );
  }
  return text.slice(0, ADD_ON_DESCRIPTION_MAX);
}
