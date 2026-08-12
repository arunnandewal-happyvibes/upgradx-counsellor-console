import { put } from "@vercel/blob";

/**
 * Reads a file from FormData and uploads it to Vercel Blob if present.
 * Returns the new public URL, or `null` if no file was submitted (caller
 * should then fall back to whatever URL/value already exists).
 */
export async function maybeUploadImage(formData: FormData, fieldName: string, folder: string) {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size === 0) return null;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Image upload isn't configured yet — BLOB_READ_WRITE_TOKEN is missing. Paste an image URL instead, or connect Vercel Blob storage.",
    );
  }

  const ext = file.name.split(".").pop() || "jpg";
  const key = `${folder}/${crypto.randomUUID()}.${ext}`;
  const blob = await put(key, file, { access: "public" });
  return blob.url;
}
