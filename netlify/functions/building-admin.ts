// Admin CRUD for building/welcome-book data stored in Netlify Blobs.
// All routes require a valid admin session cookie.
//
//   GET    /api/building-admin           → list all building summaries
//   GET    /api/building-admin?slug=xxx  → get one building's full data
//   POST   /api/building-admin           → create or update a building (upsert)
//   DELETE /api/building-admin?slug=xxx  → delete a building
import { isAdminRequest, json } from "./_lib/admin";
import { getBuilding, putBuilding, deleteBuilding, listBuildingSlugs } from "./_lib/building-store";
import staticBuildings from "./_data/buildings.json";

type StaticBuilding = { id: string; name: string };

export default async (req: Request) => {
  if (!(await isAdminRequest(req))) return json(401, { error: "unauthorized" });

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  // ── GET ─────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    if (slug) {
      // Try Blobs first, fallback to static
      const data =
        (await getBuilding(slug)) ??
        ((staticBuildings as Record<string, unknown>)[slug] as object | undefined) ?? null;
      if (!data) return json(404, { error: "not_found" });
      return json(200, data);
    }
    // List: merge Blobs keys with static keys, deduplicate, return summaries
    const blobSlugs = await listBuildingSlugs();
    const staticSlugs = Object.keys(staticBuildings);
    const allSlugs = [...new Set([...blobSlugs, ...staticSlugs])];
    const summaries = await Promise.all(
      allSlugs.map(async (s) => {
        const blob = await getBuilding(s);
        if (blob) return { id: blob.id, name: blob.name };
        const stat = (staticBuildings as Record<string, StaticBuilding>)[s];
        return stat ? { id: stat.id, name: stat.name } : null;
      })
    );
    return json(200, { buildings: summaries.filter(Boolean) });
  }

  // ── POST (upsert) ────────────────────────────────────────────────────────
  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json(400, { error: "invalid_json" });
    }
    if (!body.id || typeof body.id !== "string") return json(400, { error: "missing_id" });
    if (!body.name || typeof body.name !== "string") return json(400, { error: "missing_name" });
    // Basic slug validation: lowercase, hyphens only
    if (!/^[a-z0-9-]+$/.test(body.id)) return json(400, { error: "invalid_id" });
    await putBuilding(body as Parameters<typeof putBuilding>[0]);
    return json(200, { ok: true });
  }

  // ── DELETE ───────────────────────────────────────────────────────────────
  if (req.method === "DELETE") {
    if (!slug) return json(400, { error: "missing_slug" });
    await deleteBuilding(slug);
    return json(200, { ok: true });
  }

  return json(405, { error: "method_not_allowed" });
};
