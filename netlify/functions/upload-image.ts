// POST /api/upload-image (admin only)
// FormData: { file: File, slug: string, field: "background" | "logo" }
// Returns: { url: string }
import { isAdminRequest } from "./_lib/admin";
import { json } from "./_lib/grants";
import { getStore } from "@netlify/blobs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function imageStore() {
  return getStore("building_images");
}

export async function getImageUrl(slug: string, field: string): Promise<string | null> {
  const store = imageStore();
  try {
    const res = await store.getWithMetadata(`${slug}/${field}`, { type: "arrayBuffer" });
    return res ? `/api/image?slug=${slug}&field=${field}` : null;
  } catch {
    return null;
  }
}

export default async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  if (!(await isAdminRequest(req))) return json(401, { error: "unauthorized" });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return json(400, { error: "invalid_form_data" });
  }

  const file = formData.get("file") as File | null;
  const slug = formData.get("slug") as string | null;
  const field = formData.get("field") as string | null;

  if (!file || !slug || !field) return json(400, { error: "missing_fields" });
  if (!ALLOWED_TYPES.includes(file.type)) return json(400, { error: "invalid_file_type" });
  if (file.size > MAX_SIZE) return json(400, { error: "file_too_large" });

  const buffer = await file.arrayBuffer();
  const store = imageStore();
  await store.set(`${slug}/${field}`, buffer, {
    metadata: { contentType: file.type },
  });

  return json(200, { url: `/api/image?slug=${slug}&field=${field}` });
};
