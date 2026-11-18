// POST /api/upload-media (admin only)
// FormData: { chunk: Blob, slug, id, index, total, size, type }
//
// Les fonctions Netlify n'acceptent qu'environ 4,5 Mo de binaire par requête : une vidéo est donc
// envoyée par morceaux. Chaque morceau est un blob `<slug>/<id>/<index>` ; le dernier appel écrit
// `<slug>/<id>/meta`, lu par /api/media pour servir la vidéo par plages d'octets.
import { getStore } from "@netlify/blobs";
import { isAdminRequest } from "./_lib/admin";
import { json } from "./_lib/grants";

const ALLOWED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
export const MEDIA_CHUNK_SIZE = 2 * 1024 * 1024; // 2 Mo
const MAX_SIZE = 80 * 1024 * 1024; // 80 Mo

export default async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  if (!(await isAdminRequest(req))) return json(401, { error: "unauthorized" });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json(400, { error: "invalid_form_data" });
  }

  const chunk = form.get("chunk") as File | null;
  const slug = String(form.get("slug") ?? "");
  const id = String(form.get("id") ?? "");
  const type = String(form.get("type") ?? "");
  const index = Number(form.get("index"));
  const total = Number(form.get("total"));
  const size = Number(form.get("size"));

  if (!chunk || !/^[a-z0-9-]+$/.test(slug) || !/^[a-z0-9-]+$/.test(id)) return json(400, { error: "missing_fields" });
  if (!ALLOWED_TYPES.includes(type)) return json(400, { error: "invalid_file_type" });
  if (!Number.isInteger(size) || size <= 0 || size > MAX_SIZE) return json(400, { error: "file_too_large" });
  if (!Number.isInteger(total) || total !== Math.ceil(size / MEDIA_CHUNK_SIZE)) return json(400, { error: "invalid_chunks" });
  if (!Number.isInteger(index) || index < 0 || index >= total) return json(400, { error: "invalid_chunks" });
  if (chunk.size > MEDIA_CHUNK_SIZE) return json(400, { error: "chunk_too_large" });

  const store = getStore("building_media");
  await store.set(`${slug}/${id}/${index}`, await chunk.arrayBuffer());

  if (index < total - 1) return json(200, { ok: true });

  await store.setJSON(`${slug}/${id}/meta`, { contentType: type, size, chunkSize: MEDIA_CHUNK_SIZE, total });
  return json(200, { ok: true, url: `/api/media?slug=${slug}&id=${id}` });
};
